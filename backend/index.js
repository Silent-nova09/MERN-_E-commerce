require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { log } = require("console");
const bcrypt = require("bcrypt");
const VerificationToken = require("./verify.js");
const nodemailer = require("nodemailer");
const { url } = require("inspector");
const braintree = require("braintree");
const { setRecommendationContext } = require("./recommendationContext");
const stripe = require("stripe")(
  process.env.SECRET_STRIPE_KEY || process.env.SECERT_STRIPE_KEY,
);

const port = 4000;
const app = express();

// webhook for /after/payment
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("In webhook");
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.log(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      await handleSuccessfulPayment(session);
    }

    res.status(200).json({ received: true });
  },
);

// THEN add express.json() for all other routes
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

// Helper function to create default cart
const getDefaultCart = () => {
  const cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  return cart;
};

const flattenOrders = (users) => {
  const orders = [];

  users.forEach((user) => {
    (user.orders || []).forEach((order) => {
      orders.push({
        userId: String(user._id),
        userName: user.name || user.email || "Customer",
        userEmail: user.email || "",
        ...order.toObject(),
      });
    });
  });

  return orders;
};

const buildDashboardAnalytics = (products, orders) => {
  const now = new Date();
  const trailingDays = 7;
  const trendMap = new Map();
  const categoryMap = new Map();
  const productMap = new Map();
  const startWindow = new Date(now);
  startWindow.setDate(startWindow.getDate() - (trailingDays - 1));
  startWindow.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < trailingDays; offset += 1) {
    const date = new Date(startWindow);
    date.setDate(startWindow.getDate() + offset);
    const key = date.toISOString().slice(0, 10);
    trendMap.set(key, { date: key, orders: 0, revenue: 0 });
  }

  orders.forEach((order) => {
    const orderDate = new Date(order.orderDate);
    const trendKey = orderDate.toISOString().slice(0, 10);
    if (trendMap.has(trendKey)) {
      const trendEntry = trendMap.get(trendKey);
      trendEntry.orders += 1;
      trendEntry.revenue += order.totalAmount || 0;
    }

    (order.items || []).forEach((item) => {
      const matchedProduct = products.find(
        (product) => product.id === item.productId,
      );
      const category = matchedProduct?.category || "uncategorized";
      const revenue = (item.price || 0) * (item.quantity || 0);

      const currentCategory = categoryMap.get(category) || {
        category,
        revenue: 0,
        unitsSold: 0,
      };
      currentCategory.revenue += revenue;
      currentCategory.unitsSold += item.quantity || 0;
      categoryMap.set(category, currentCategory);

      const currentProduct = productMap.get(item.productId) || {
        productId: item.productId,
        name: item.name,
        category,
        unitsSold: 0,
        revenue: 0,
      };
      currentProduct.unitsSold += item.quantity || 0;
      currentProduct.revenue += revenue;
      productMap.set(item.productId, currentProduct);
    });
  });

  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0,
  );

  const lowStockAlerts = products
    .map((product) => {
      const unitsLast7Days = orders.reduce((sum, order) => {
        const orderDate = new Date(order.orderDate);
        if (orderDate < startWindow) return sum;

        const matchedItem = (order.items || []).find(
          (item) => item.productId === product.id,
        );
        if (!matchedItem) return sum;
        return sum + (matchedItem.quantity || 0);
      }, 0);

      const dailyVelocity = Number((unitsLast7Days / trailingDays).toFixed(2));
      const daysUntilStockout =
        dailyVelocity > 0
          ? Number((product.stock / dailyVelocity).toFixed(1))
          : null;

      const shouldAlert =
        product.stock <= 10 ||
        (dailyVelocity > 0 &&
          daysUntilStockout !== null &&
          daysUntilStockout <= 14);

      if (!shouldAlert) return null;

      let severity = "medium";
      if (
        product.stock <= 5 ||
        (daysUntilStockout !== null && daysUntilStockout <= 7)
      ) {
        severity = "high";
      }

      return {
        productId: product.id,
        name: product.name,
        category: product.category,
        stock: product.stock,
        unitsLast7Days,
        dailyVelocity,
        daysUntilStockout,
        severity,
        reason:
          dailyVelocity > 0
            ? `Selling ${dailyVelocity}/day with ${product.stock} units left`
            : `Only ${product.stock} units left and no recent sales buffer`,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a.severity !== b.severity) return a.severity === "high" ? -1 : 1;
      if (a.daysUntilStockout === null) return 1;
      if (b.daysUntilStockout === null) return -1;
      return a.daysUntilStockout - b.daysUntilStockout;
    });

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue)
    .slice(0, 5);

  const revenueByCategory = Array.from(categoryMap.values()).sort(
    (a, b) => b.revenue - a.revenue,
  );

  const totalUnitsSold = Array.from(productMap.values()).reduce(
    (sum, product) => sum + product.unitsSold,
    0,
  );

  return {
    totals: {
      revenue: Number(totalRevenue.toFixed(2)),
      orders: orders.length,
      products: products.length,
      unitsSold: totalUnitsSold,
    },
    salesTrend: Array.from(trendMap.values()).map((entry) => ({
      ...entry,
      revenue: Number(entry.revenue.toFixed(2)),
    })),
    topProducts: topProducts.map((product) => ({
      ...product,
      revenue: Number(product.revenue.toFixed(2)),
    })),
    revenueByCategory: revenueByCategory.map((entry) => ({
      ...entry,
      revenue: Number(entry.revenue.toFixed(2)),
    })),
    lowStockAlerts,
  };
};

// Handle successful payment
async function handleSuccessfulPayment(session) {
  const userId = session.metadata.userId;
  if (!userId) {
    console.error("No userId in session metadata");
    return;
  }
  console.log(userId);

  try {
    // Get session details from Stripe
    const expandedSession = await stripe.checkout.sessions.retrieve(
      session.id,
      {
        expand: ["line_items.data.price.product"],
      },
    );

    const lineItems = expandedSession.line_items.data;
    const totalAmount = session.amount_total / 100;
    console.log(lineItems);
    // Create order items with FROZEN prices
    const orderItems = lineItems.map((item) => ({
      productId:
        parseInt(item.metadata?.productId) ||
        parseInt(item.price.product.metadata?.productId) ||
        0,
      name: item.description || item.price.product.name,
      price: item.price.unit_amount / 100, // Price at purchase time
      quantity: item.quantity,
      image: item.price.product.metadata?.image || "",
    }));

    // Find user
    const user = await Users.findById(userId);
    if (!user) {
      console.error(`User ${userId} not found`);
      return;
    }

    if (user.orders.some((order) => order.orderId === session.id)) {
      console.log(`Order ${session.id} already saved for user ${userId}`);
      return;
    }

    let shippingAddress;
    try {
      shippingAddress = session.metadata.shippingAddress
        ? JSON.parse(session.metadata.shippingAddress)
        : undefined;
    } catch (error) {
      shippingAddress = undefined;
    }

    // Create new order
    const newOrder = {
      orderId: session.id,
      items: orderItems,
      totalAmount: totalAmount,
      paymentStatus: "completed",
      stripeSessionId: session.id,
      shippingAddress,
      orderDate: new Date(),
    };

    // Add to user's orders array
    user.orders.push(newOrder);

    await Promise.all(
      orderItems.map((item) =>
        Product.findOneAndUpdate(
          { id: item.productId },
          [
            {
              $set: {
                stock: {
                  $max: [0, { $subtract: ["$stock", item.quantity || 0] }],
                },
              },
            },
            {
              $set: {
                available: {
                  $gt: ["$stock", 0],
                },
              },
            },
          ],
          { new: true },
        ),
      ),
    );

    // Clear the cart
    user.cartData = getDefaultCart();

    // Save everything
    await user.save();
    console.log(`✅ Order ${session.id} saved for user ${userId}`);
  } catch (error) {
    console.error("Error in handleSuccessfulPayment:", error);
  }
}

//Schema for product
const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  stock: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 4,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

// Schema for admin/owner authentication
const Owner = mongoose.model("Owner", {
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: "Store Owner",
  },
  role: {
    type: String,
    default: "owner",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Admin = mongoose.model("Admin", {
  username: String,
  password: String,
  name: String,
  role: String,
});

const compareOwnerPassword = async (plainPassword, storedPassword) => {
  if (!storedPassword) return false;
  if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$")) {
    return bcrypt.compare(plainPassword, storedPassword);
  }
  return plainPassword === storedPassword;
};

const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});
const upload = multer({ storage: storage });
app.use("/images", express.static("upload/images"));

//Payment gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.Merchant_id,
  publicKey: process.env.Public_key,
  privateKey: process.env.Private_key,
});

// Schema for Order Items (individual products in an order)
const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true, // This FREEZES the price at purchase time
  },
  quantity: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
  },
});

// Schema for Orders
const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "completed",
  },
  stripeSessionId: {
    type: String,
  },
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
});

// Updated User Schema
const Users = mongoose.model("Users", {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cartData: {
    type: Object,
    default: getDefaultCart,
  },
  orders: {
    type: [OrderSchema],
    default: [],
  },
  wishlistData: {
    type: Object,
  },
  wishlistIcon: {
    type: Object,
  },
  verified: {
    type: Boolean,
    default: false,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Subscriber = mongoose.model("Subscriber", {
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const EmailCampaign = mongoose.model("EmailCampaign", {
  type: {
    type: String,
    enum: ["newsletter", "wishlist-offer"],
    required: true,
  },
  subject: String,
  message: String,
  productIds: {
    type: [Number],
    default: [],
  },
  discountPercent: Number,
  recipientCount: {
    type: Number,
    default: 0,
  },
  sentCount: {
    type: Number,
    default: 0,
  },
  failedCount: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

app.get("/", (req, res) => {
  res.send("express app is running");
});

// Owner login for admin panel
app.post("/ownerlogin", async (req, res) => {
  const username = req.body.username?.trim();
  const password = req.body.password;

  if (!username || !password) {
    return res.json({
      success: false,
      errors: "Username and password are required",
    });
  }

  let owner = await Owner.findOne({ username });
  if (!owner) owner = await Admin.findOne({ username });

  if (!owner) {
    return res.json({
      success: false,
      errors: "Owner account not found",
    });
  }

  const passwordMatch = await compareOwnerPassword(password, owner.password);
  if (!passwordMatch) {
    return res.json({
      success: false,
      errors: "Invalid owner credentials",
    });
  }

  const token = jwt.sign(
    {
      owner: {
        id: owner.id,
        username: owner.username,
        role: owner.role || "owner",
      },
    },
    "secret_ecom_admin",
    { expiresIn: "1d" },
  );

  res.json({
    success: true,
    token,
    owner: {
      username: owner.username,
      name: owner.name || owner.username,
      role: owner.role || "owner",
    },
  });
});

//CREATING API FOR ADDING A PRODUCT INTO DATABASE
app.post("/addproduct", async (req, res) => {
  const lastProduct = await Product.findOne().sort("-id").select("id");
  const nextId = lastProduct ? lastProduct.id + 1 : 1;

  const product = new Product({
    id: nextId,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
    description: req.body.description,
    rating: req.body.rating,
    stock: req.body.stock,
    available: req.body.available !== undefined ? req.body.available : true,
  });
  console.log(product);
  await product.save();
  console.log("Saved");
  res.json({
    success: true,
    name: req.body.name,
  });
});

// CREATING API FOR ADDING MULTIPLE PRODUCTS INTO DATABASE
app.post("/addproducts", async (req, res) => {
  try {
    const products = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        errors: "Please provide an array of products",
      });
    }

    // Get last product id
    const lastProduct = await Product.findOne().sort("-id").select("id");
    let nextId = lastProduct ? lastProduct.id + 1 : 1;

    const productsToInsert = products.map((product) => ({
      id: nextId++,
      name: product.name,
      image: product.image,
      category: product.category,
      new_price: product.new_price,
      old_price: product.old_price,
      description: product.description || "",
      rating: product.rating || 0,
      stock: product.stock || 0,
      available: product.available !== undefined ? product.available : true,
    }));

    const insertedProducts = await Product.insertMany(productsToInsert);

    console.log(`${insertedProducts.length} products saved`);

    res.json({
      success: true,
      count: insertedProducts.length,
      products: insertedProducts,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      errors: error.message,
    });
  }
});

//CREATING API TO UPDATE A PRODUCT GIVEN ID , NAME OF FIELD AND NEW VALUE OF FIELD
app.post("/updateproduct", async (req, res) => {
  const id = req.body.id;
  const allowedFields = [
    "name",
    "category",
    "old_price",
    "new_price",
    "image",
    "description",
    "stock",
    "rating",
    "available",
  ];
  let updates = {};

  if (req.body.updates && typeof req.body.updates === "object") {
    allowedFields.forEach((field) => {
      if (req.body.updates[field] !== undefined) {
        updates[field] = req.body.updates[field];
      }
    });
  } else if (allowedFields.includes(req.body.options)) {
    updates[req.body.options] = req.body.newvalue;
  }

  if (updates.old_price !== undefined)
    updates.old_price = Number(updates.old_price);
  if (updates.new_price !== undefined)
    updates.new_price = Number(updates.new_price);
  if (updates.stock !== undefined) updates.stock = Number(updates.stock);
  if (updates.rating !== undefined) updates.rating = Number(updates.rating);
  if (updates.stock !== undefined && updates.available === undefined) {
    updates.available = updates.stock > 0;
  }

  if (!id || Object.keys(updates).length === 0) {
    return res.json({
      success: false,
      errors: "No valid update fields provided",
    });
  }

  const product = await Product.findOneAndUpdate(
    { id: Number(id) },
    { $set: updates },
    { new: true },
  );
  if (!product) return res.json({ success: false, errors: "No product found" });
  res.json({
    success: true,
    product,
  });
});

//CREATING API TO DELETE A PRODUCT FROM DATABASE
app.post("/deleteproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({
    success: true,
    name: req.body.name,
  });
});

//CREATING API FOR GETTING ALL PRODUCTS
app.get("/allproducts", async (req, res) => {
  let products = await Product.find({}).sort({ id: 1 });
  console.log("All products fetched");
  res.send(products);
});

app.get("/admin/dashboard", async (req, res) => {
  try {
    const [products, users] = await Promise.all([
      Product.find({}).sort({ id: 1 }),
      Users.find({}, "name email orders"),
    ]);

    const orders = flattenOrders(users).sort(
      (a, b) => new Date(b.orderDate) - new Date(a.orderDate),
    );

    res.json({
      success: true,
      generatedAt: new Date().toISOString(),
      ...buildDashboardAnalytics(products, orders),
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    res.status(500).json({
      success: false,
      errors: "Unable to build dashboard analytics",
    });
  }
});

app.get("/admin/powerbi/sales", async (req, res) => {
  try {
    const users = await Users.find({});
    const products = await Product.find({});

    const productMap = {};

    products.forEach((product) => {
      productMap[product.id] = product;
    });

    const salesData = [];

    users.forEach((user) => {
      (user.orders || []).forEach((order) => {
        (order.items || []).forEach((item) => {
          const product = productMap[item.productId];

          salesData.push({
            date: order.orderDate,
            orderId: order.orderId,
            pincode: order.shippingAddress?.zip || "Unknown",
            productId: item.productId,
            productName: item.name,
            category: product?.category || "Unknown",
            quantity: item.quantity,
            unitPrice: item.price,
            revenue: item.quantity * item.price,
          });
        });
      });
    });

    res.json(salesData);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to generate Power BI dataset",
    });
  }
});
app.get("/admin/powerbi/products", async (req, res) => {
  try {
    const products = await Product.find({})
      .sort({ id: 1 })
      .select("id name category stock rating new_price old_price available");

    const dataset = products.map((product) => ({
      productId: product.id,
      productName: product.name,
      category: product.category,
      stock: product.stock,
      rating: product.rating,
      sellingPrice: product.new_price,
      originalPrice: product.old_price,
      available: product.available,
    }));

    res.json(dataset);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to generate products dataset",
    });
  }
});

app.get("/admin/powerbi/wishlist", async (req, res) => {
  try {
    const users = await Users.find({});
    const products = await Product.find({});

    const productMap = {};
    products.forEach((product) => {
      productMap[product.id] = product;
    });

    const wishlistCounts = {};

    users.forEach((user) => {
      const wishlist = user.wishlistData || {};

      Object.keys(wishlist).forEach((productId) => {
        if (wishlist[productId] === 1) {
          wishlistCounts[productId] = (wishlistCounts[productId] || 0) + 1;
        }
      });
    });

    const wishlistData = Object.entries(wishlistCounts)
      .map(([productId, count]) => {
        const product = productMap[productId];

        return {
          productId: Number(productId),
          productName: product?.name || "Unknown",
          category: product?.category || "Unknown",
          wishlistCount: count,
        };
      })
      .sort((a, b) => b.wishlistCount - a.wishlistCount);

    res.json(wishlistData);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to generate wishlist dataset",
    });
  }
});

app.post("/subscribe", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        errors: "Please enter a valid email address",
      });
    }

    const subscriber = await Subscriber.findOneAndUpdate(
      { email },
      { email, active: true },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.json({
      success: true,
      subscriber,
      message: "Subscribed successfully",
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    res.status(500).json({
      success: false,
      errors: "Unable to save subscription",
    });
  }
});

app.get("/admin/email/overview", async (req, res) => {
  try {
    const [subscribers, products, users, campaigns] = await Promise.all([
      Subscriber.find({ active: true }).sort({ date: -1 }),
      Product.find({}).sort({ id: 1 }),
      Users.find({}, "email wishlistData"),
      EmailCampaign.find({}).sort({ date: -1 }).limit(10),
    ]);

    const wishlistCounts = {};
    users.forEach((user) => {
      const wishlist = user.wishlistData || {};
      Object.keys(wishlist).forEach((productId) => {
        if (Number(wishlist[productId]) === 1) {
          wishlistCounts[productId] = (wishlistCounts[productId] || 0) + 1;
        }
      });
    });

    const productsWithWishlist = products
      .map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        old_price: product.old_price,
        new_price: product.new_price,
        image: product.image,
        wishlistCount: wishlistCounts[product.id] || 0,
      }))
      .sort((a, b) => b.wishlistCount - a.wishlistCount || a.id - b.id);

    res.json({
      success: true,
      subscriberCount: subscribers.length,
      subscribers,
      products: productsWithWishlist,
      campaigns,
    });
  } catch (error) {
    console.error("Email overview error:", error);
    res.status(500).json({
      success: false,
      errors: "Unable to load email overview",
    });
  }
});

app.post("/admin/email/send-newsletter", async (req, res) => {
  try {
    const subject = String(req.body.subject || "").trim();
    const message = String(req.body.message || "").trim();

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        errors: "Subject and message are required",
      });
    }

    const subscribers = await Subscriber.find({ active: true });
    const emailResult = await sendCampaignEmails(
      subscribers.map((subscriber) => subscriber.email),
      subject,
      buildNewsletterTemplate({ title: subject, message }),
    );

    await EmailCampaign.create({
      type: "newsletter",
      subject,
      message,
      recipientCount: emailResult.recipients.length,
      sentCount: emailResult.sent,
      failedCount: emailResult.failed,
    });

    res.json({ success: true, ...emailResult });
  } catch (error) {
    console.error("Newsletter send error:", error);
    res.status(500).json({
      success: false,
      errors: "Unable to send newsletter",
    });
  }
});

app.post("/admin/email/send-wishlist-offer", async (req, res) => {
  try {
    const productIds = (req.body.productIds || []).map(Number).filter(Boolean);
    const discountPercent = Number(req.body.discountPercent);
    const subject = String(req.body.subject || "").trim();
    const message = String(req.body.message || "").trim();

    if (!productIds.length || !discountPercent || discountPercent <= 0) {
      return res.status(400).json({
        success: false,
        errors: "Select products and enter a valid discount",
      });
    }

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        errors: "Subject and message are required",
      });
    }

    const products = await Product.find({ id: { $in: productIds } });
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        errors: "No matching products found",
      });
    }

    const updatedProducts = await Promise.all(
      products.map((product) => {
        const originalPrice = product.old_price || product.new_price;
        const salePrice = Number(
          (originalPrice * (1 - discountPercent / 100)).toFixed(2),
        );

        return Product.findOneAndUpdate(
          { id: product.id },
          {
            $set: {
              old_price: originalPrice,
              new_price: salePrice,
            },
          },
          { new: true },
        );
      }),
    );

    const users = await Users.find(
      {
        $or: productIds.map((productId) => ({
          [`wishlistData.${productId}`]: 1,
        })),
      },
      "email",
    );

    const emailResult = await sendCampaignEmails(
      users.map((user) => user.email),
      subject,
      buildWishlistOfferTemplate({
        title: subject,
        message,
        products: updatedProducts,
      }),
    );

    await EmailCampaign.create({
      type: "wishlist-offer",
      subject,
      message,
      productIds,
      discountPercent,
      recipientCount: emailResult.recipients.length,
      sentCount: emailResult.sent,
      failedCount: emailResult.failed,
    });

    res.json({
      success: true,
      products: updatedProducts,
      ...emailResult,
    });
  } catch (error) {
    console.error("Wishlist offer send error:", error);
    res.status(500).json({
      success: false,
      errors: "Unable to send wishlist offer",
    });
  }
});

//UPLOADING IMAGES FROM SYSTEM INTO PROJECT DIRECTORY
app.post("/upload", upload.single("product"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: 0, error: "No file uploaded" });
  }
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  });
});

generateEmailTemplate = (code) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <style>
      @media only screen and (max-width : 620px){
      h1{
      font-size : 20px;
      padding : 5px;
      }
      }
      </style>
    </head>
    <body>
    <div>
      <div style="max-width : 620px;margin : 0 auto;font-family : 
      sans-serif;color : #272727;">
       <h1 style="background : #f6f6f6;padding : 10px ; text-align : center;
       color : #272727;">We are delighted to welcome you to our team!</h1>
       <p>Please verify your email to continue your verification code is:</p>
       <p style="width : 80px; margin : 0 auto; font-wieght : bold;
       text-align : center; background : #f6f6f6; border-radius : 5px;
       font-size : 25px;">${code}</p>
       </div>
    </div>
    </body>
    </html>
    `;
};

mailTransport = () =>
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "rengoku.d.zoro09@gmail.com",
      pass: "jtwccrhbnipioamz",
    },
  });

const generateOTP = () => {
  let otp = "";
  for (let i = 0; i <= 3; i++) {
    const randval = Math.round(Math.random() * 9);
    otp = otp + randval;
  }
  return otp;
};

//Creating Endpoint for registering the user
app.post("/signup", async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({
      success: false,
      errors: "existing user found with same email address",
    });
  }

  const cart = getDefaultCart();
  const wishlist = getDefaultCart();
  const wishlist_icon = getDefaultCart();

  const password = req.body.password;
  const hash = await bcrypt.hash(password, 8);
  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: hash,
    cartData: cart,
    orders: [], // Empty orders array
    wishlistData: wishlist,
    wishlistIcon: wishlist_icon,
  });

  const otp = generateOTP();

  const verificationToken = new VerificationToken({
    owner: user._id,
    token: otp,
  });

  await verificationToken.save();
  await user.save();

  mailTransport().sendMail({
    from: "rengoku.d.zoro09@gmail.com",
    to: user.email,
    subject: "Verify your Email account",
    html: generateEmailTemplate(otp),
  });

  const data = {
    user: {
      id: user.id,
    },
  };

  const token = jwt.sign(data, "secret_ecom");
  res.json({
    success: true,
    token: token,
  });
});

//Creating middleware to fetch user
const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ errors: "Please authenticate using valid token" });
  } else {
    try {
      const data = jwt.verify(token, "secret_ecom");
      req.user = data.user;
      next();
    } catch (error) {
      res
        .status(401)
        .send({ errors: "Please authenticate using a valid token" });
    }
  }
};

const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const sendCampaignEmails = async (recipients, subject, html) => {
  const uniqueRecipients = [...new Set(recipients.map(normalizeEmail))].filter(
    isValidEmail,
  );

  if (uniqueRecipients.length === 0) {
    return { sent: 0, failed: 0, recipients: [] };
  }

  const transporter = mailTransport();
  const results = await Promise.allSettled(
    uniqueRecipients.map((email) =>
      transporter.sendMail({
        from: "rengoku.d.zoro09@gmail.com",
        to: email,
        subject,
        html,
      }),
    ),
  );

  return {
    sent: results.filter((result) => result.status === "fulfilled").length,
    failed: results.filter((result) => result.status === "rejected").length,
    recipients: uniqueRecipients,
  };
};

const buildNewsletterTemplate = ({ title, message }) => `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#191714">
    <h2 style="margin:0 0 12px;color:#0f766e">${title}</h2>
    <p style="white-space:pre-line">${message}</p>
  </div>
`;

const buildWishlistOfferTemplate = ({ title, message, products }) => `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#191714">
    <h2 style="margin:0 0 12px;color:#0f766e">${title}</h2>
    <p style="white-space:pre-line">${message}</p>
    <div style="margin-top:18px">
      ${products
        .map(
          (product) => `
            <div style="padding:14px 0;border-top:1px solid #e4dacd">
              <strong>${product.name}</strong>
              <p style="margin:6px 0">Now at Rs.${product.new_price} <span style="color:#71685d;text-decoration:line-through">Rs.${product.old_price}</span></p>
            </div>
          `,
        )
        .join("")}
    </div>
  </div>
`;

setRecommendationContext({
  Product,
  Users,
  fetchuser,
});

const recommendationRouter = require("./routes/recommendation");
app.use("/", recommendationRouter);

// Updated payment endpoint with fetchuser middleware
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.Merchant_id,
  publicKey: process.env.Public_key,
  privateKey: process.env.Private_key,
});
app.post("/payment", fetchuser, async (req, res) => {
  console.log("User id", req.user.id);
  try {
    const items = req.body.items || [];
    if (items.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No items to process" });
    }

    console.log("Items", items);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: items.map((item) => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name,
            metadata: {
              productId: String(item.id),
              image: item.image || "",
            },
          },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: item.quantity,
      })),
      success_url:
        "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:3000/cart",
      metadata: {
        userId: req.user.id,
        shippingAddress: JSON.stringify(req.body.address || {}),
      },
    });

    console.log("SESSION CREATED");
    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Payment session error:", error);
    res.status(500).json({ success: false, error: "Unable to start payment" });
  }
});

app.post("/forgotpassword", async (req, res) => {
  const Email = req.body.Email;
  const user = await Users.findOne({ email: Email });
  if (!user) res.json({ success: false });
  mailTransport().sendMail({
    from: "emailverification@gmail.com",
    to: user.email,
    subject: "Reset your login password",
    text: `http://localhost:3000/reset-password/${user._id}`,
  });
  res.json({
    success: true,
  });
});

app.post("/resetpassword/:id", async (req, res) => {
  console.log("hiii");
  const newpassword = req.body.new;
  const confirmpassword = req.body.confirm;
  const { id } = req.params;
  if (newpassword !== confirmpassword) {
    res.json({
      success: false,
      errors: "Confirm password doesn't match",
    });
  } else {
    const hash = await bcrypt.hash(newpassword, 8);
    const user = await Users.findByIdAndUpdate({ _id: id }, { password: hash });
    res.json({
      success: true,
      errors: "No errors",
    });
  }
});

app.post("/verify", fetchuser, async (req, res) => {
  const otp = req.body.otp;
  const userId = req.user.id;
  if (!userId || !otp.trim())
    return res.json({
      success: false,
      errors: "Invalid request,missing parameters",
    });
  if (!mongoose.isValidObjectId(userId)) {
    return res.json({ success: false, errors: "Invalid user ID" });
  }

  const user = await Users.findOne({ _id: userId });
  if (!user)
    return res.json({ success: false, errors: "Sorry, user not found" });
  if (user.verified === true) {
    return res.send({ success: false, errors: "this account already exists" });
  }
  const token = await VerificationToken.findOne({ owner: user._id });
  if (!token) res.send({ success: false, errors: "Sorry, user not found" });
  const match = await token.compareToken(otp);
  if (!match)
    return res.json({ success: false, errors: "Please provide a valid token" });
  user.verified = true;
  await VerificationToken.findByIdAndDelete(token._id);
  await user.save();

  mailTransport().sendMail({
    from: "emailverification@gmail.com",
    to: user.email,
    subject: "Verification successful",
    html: generateEmailTemplate("verification successful"),
  });
  res.json({ success: true });
});

//Creating Endpoint for Login path
app.post("/login", async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  const pass = req.body.password;
  if (user) {
    const passcompare = bcrypt.compareSync(pass, user.password);
    if (passcompare) {
      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, "secret_ecom");
      if (!user.verified) {
        const otp = generateOTP();
        const verifier = await VerificationToken.findOne({ owner: user._id });
        if (!verifier)
          res.send({ success: false, errors: "Sorry, user not found" });
        await VerificationToken.findByIdAndDelete(verifier._id);
        const verificationToken = new VerificationToken({
          owner: user._id,
          token: otp,
        });

        await verificationToken.save();
        mailTransport().sendMail({
          from: "emailverification@gmail.com",
          to: user.email,
          subject: "Verify your Email account",
          html: generateEmailTemplate(otp),
        });
        res.json({
          success: true,
          token,
          verify: true,
        });
      } else {
        res.json({
          success: true,
          token,
          verify: false,
        });
      }
    } else {
      res.json({
        success: false,
        errors: "Wrong password",
      });
    }
  } else {
    res.json({ success: false, errors: "Wrong Email ID" });
  }
});

const buildProductEngagement = (users) => {
  const engagement = {};

  users.forEach((user) => {
    (user.orders || []).forEach((order) => {
      (order.items || []).forEach((item) => {
        const productId = Number(item.productId);
        if (!productId) return;
        engagement[productId] = engagement[productId] || {
          orders: 0,
          wishlist: 0,
          cart: 0,
        };
        engagement[productId].orders += Number(item.quantity || 0);
      });
    });

    Object.entries(user.wishlistData || {}).forEach(([productId, value]) => {
      if (Number(value) !== 1) return;
      engagement[productId] = engagement[productId] || {
        orders: 0,
        wishlist: 0,
        cart: 0,
      };
      engagement[productId].wishlist += 1;
    });

    Object.entries(user.cartData || {}).forEach(([productId, value]) => {
      const quantity = Number(value || 0);
      if (quantity <= 0) return;
      engagement[productId] = engagement[productId] || {
        orders: 0,
        wishlist: 0,
        cart: 0,
      };
      engagement[productId].cart += quantity;
    });
  });

  return engagement;
};

const productDiscountPercent = (product) => {
  const oldPrice = Number(product.old_price || 0);
  const newPrice = Number(product.new_price || 0);
  if (!oldPrice || newPrice >= oldPrice) return 0;
  return Number((((oldPrice - newPrice) / oldPrice) * 100).toFixed(1));
};

const scoreProduct = (product, engagement = {}) => {
  const stats = engagement[product.id] || {};
  return (
    (stats.orders || 0) * 6 +
    (stats.wishlist || 0) * 4 +
    (stats.cart || 0) * 2 +
    productDiscountPercent(product)
  );
};

//Creating endpoint for new collection data
app.get("/newcollection", async (req, res) => {
  let products = await Product.find({ available: true }).sort({
    date: -1,
    id: -1,
  });
  let newcollections = products.slice(0, 8);
  console.log("New collection fetched");
  res.send(newcollections);
});

//Creating endpoint for popular products by category
app.get("/popular", async (req, res) => {
  const categories = ["women", "men", "kid"];
  const [products, users] = await Promise.all([
    Product.find({ available: true }),
    Users.find({}, "orders wishlistData cartData"),
  ]);
  const engagement = buildProductEngagement(users);

  const popular = categories.reduce((result, category) => {
    result[category] = products
      .filter((product) => product.category === category)
      .map((product) => ({
        ...product.toObject(),
        popularityScore: scoreProduct(product, engagement),
      }))
      .sort(
        (a, b) => b.popularityScore - a.popularityScore || b.rating - a.rating,
      )
      .slice(0, 6);
    return result;
  }, {});

  console.log("Popular products fetched");
  res.send(popular);
});

app.get("/offers-for-you", async (req, res) => {
  try {
    let user = null;
    const authToken = req.header("auth-token");

    if (authToken) {
      try {
        const data = jwt.verify(authToken, "secret_ecom");
        user = await Users.findById(data.user.id);
      } catch (error) {
        user = null;
      }
    }

    const [products, users] = await Promise.all([
      Product.find({ available: true }),
      Users.find({}, "orders wishlistData cartData"),
    ]);
    const engagement = buildProductEngagement(users);
    const userWishlist = user?.wishlistData || {};
    const userCart = user?.cartData || {};
    const userOrderProductIds = new Set();

    (user?.orders || []).forEach((order) => {
      (order.items || []).forEach((item) => {
        userOrderProductIds.add(Number(item.productId));
      });
    });

    const shapedProducts = products
      .map((product) => {
        const discountPercent = productDiscountPercent(product);
        const wishedByUser = Number(userWishlist[product.id]) === 1;
        const inUserCart = Number(userCart[product.id] || 0) > 0;
        const recommended =
          user &&
          !wishedByUser &&
          !inUserCart &&
          !userOrderProductIds.has(product.id) &&
          scoreProduct(product, engagement) > 0;

        const offerScore =
          discountPercent * 4 +
          (wishedByUser ? 80 : 0) +
          (recommended ? 35 : 0) +
          scoreProduct(product, engagement);

        return {
          ...product.toObject(),
          discountPercent,
          wishedByUser,
          recommended: Boolean(recommended),
          offerScore,
        };
      })
      .filter(
        (product) =>
          product.discountPercent > 0 ||
          product.wishedByUser ||
          product.recommended,
      )
      .sort((a, b) => b.offerScore - a.offerScore)
      .slice(0, 20);

    res.json({
      success: true,
      products: shapedProducts,
    });
  } catch (error) {
    console.error("Offers for you error:", error);
    res.status(500).json({
      success: false,
      errors: "Unable to load offers",
    });
  }
});

//Creating endpoint for saving cart data
app.post("/addtocart", fetchuser, async (req, res) => {
  console.log("Added", req.body.itemId);
  let userdata = await Users.findOne({ _id: req.user.id });
  if (!userdata.cartData[req.body.itemId]) {
    userdata.cartData[req.body.itemId] = 0;
  }
  userdata.cartData[req.body.itemId] += 1;
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userdata.cartData },
  );
  res.send("Added");
});

//Creating endpoint to remove product from cart data
app.post("/removefromcart", fetchuser, async (req, res) => {
  console.log("Removed", req.body.itemId);
  let userdata = await Users.findOne({ _id: req.user.id });
  if (userdata.cartData[req.body.itemId] > 0) {
    userdata.cartData[req.body.itemId] -= 1;
  }
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userdata.cartData },
  );
  res.send("Removed");
});

//Creating endpoint to get cart data when logged in
app.post("/getcart", fetchuser, async (req, res) => {
  console.log("Getcart");
  let userdata = await Users.findOne({ _id: req.user.id });
  if (userdata) res.json(userdata.cartData);
  else res.json({ errors: "No data found" });
});

// UPDATED endpoint to get user order details from the new orders array
app.post("/getorders", fetchuser, async (req, res) => {
  console.log("GetOrders");
  let userdata = await Users.findOne({ _id: req.user.id });
  if (userdata) {
    res.json({
      success: true,
      orders: userdata.orders || [],
    });
  } else {
    res.json({ success: false, errors: "No data found" });
  }
});

//Creating endpoint to add product to wishlist
app.post("/addtowishlist", fetchuser, async (req, res) => {
  console.log("Adding to wishlist", req.body.itemId);
  let userdata = await Users.findOne({ _id: req.user.id });
  userdata.wishlistData[req.body.itemId] = 1;
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { wishlistData: userdata.wishlistData },
  );
  res.send("Added to wishlist");
});

app.post("/deletefromwishlist", fetchuser, async (req, res) => {
  console.log("Deleting from wishlist", req.body.itemId);
  let userdata = await Users.findOne({ _id: req.user.id });
  userdata.wishlistData[req.body.itemId] = 0;
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { wishlistData: userdata.wishlistData },
  );
  res.send("deleted from wishlist");
});

//Creating endpoint to get wishlist data when logged in
app.post("/getwishlist", fetchuser, async (req, res) => {
  console.log("GetWishlist");
  let userdata = await Users.findOne({ _id: req.user.id });
  if (userdata) res.json(userdata.wishlistData);
  else res.json({ errors: "No data found" });
});

app.post("/addwishlisticon", fetchuser, async (req, res) => {
  console.log("Wishlist icon added");
  let userdata = await Users.findOne({ _id: req.user.id });
  userdata.wishlistIcon[req.body.itemId] = 1;
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { wishlistIcon: userdata.wishlistIcon },
  );
  res.send("Wishlist icon added successfully");
});

app.post("/deletewishlisticon", fetchuser, async (req, res) => {
  console.log("Wishlist icon deleted");
  let userdata = await Users.findOne({ _id: req.user.id });
  userdata.wishlistIcon[req.body.itemId] = 0;
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { wishlistIcon: userdata.wishlistIcon },
  );
  res.send("Wishlist icon added successfully");
});

app.post("/getwishlisticon", fetchuser, async (req, res) => {
  console.log("GetWishlistIcons");
  let userdata = await Users.findOne({ _id: req.user.id });
  if (userdata) res.json(userdata.wishlistIcon);
  else res.json({ errors: "No data found" });
});

//LISTENING TO PORT
app.listen(port, (err) => {
  if (!err) {
    console.log("server running on port " + port);
  } else {
    console.log("Error : " + err);
  }
});
