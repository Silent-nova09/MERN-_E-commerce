const { getRecommendationContext } = require("../recommendationContext");
const {
  generateRecommendations,
} = require("../services/geminiRecommendationService");

const FALLBACK_REASON = "Fresh pick aligned to your store interests.";
const FALLBACK_SCORE = 60;

const normalizeText = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
};

const getCatalogPrice = (product) => {
  const numericPrice = Number(product?.new_price);
  return Number.isFinite(numericPrice) ? numericPrice : 0;
};

const buildProductMap = (products) => {
  const productMap = new Map();

  products.forEach((product) => {
    productMap.set(Number(product.id), product);
  });

  return productMap;
};

const getActiveProductIds = (dataObject = {}, predicate) => {
  return Object.entries(dataObject)
    .filter(([, value]) => predicate(value))
    .map(([productId]) => Number(productId))
    .filter((productId) => Number.isInteger(productId));
};

const buildPurchasedProducts = (orders = []) => {
  return orders.flatMap((order) =>
    (order.items || []).map((item) => ({
      productId: Number(item.productId),
      name: normalizeText(item.name),
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 0,
    })),
  );
};

const buildWishlistProducts = (wishlistIds, productMap) => {
  return wishlistIds
    .map((productId) => {
      const product = productMap.get(productId);
      if (!product) return null;

      return {
        productId,
        name: normalizeText(product.name),
      };
    })
    .filter(Boolean);
};

const buildCartProducts = (cartIds, cartData, productMap) => {
  return cartIds
    .map((productId) => {
      const product = productMap.get(productId);
      if (!product) return null;

      return {
        productId,
        name: normalizeText(product.name),
        quantity: Number(cartData[productId]) || 0,
      };
    })
    .filter(Boolean);
};

const buildUserInsights = (purchasedProducts, wishlistProducts, cartProducts, productMap) => {
  const categoryCounts = new Map();
  const productCounts = new Map();
  const spendValues = [];

  purchasedProducts.forEach((item) => {
    const product = productMap.get(item.productId);
    if (!product) return;

    const category = normalizeText(product.category).toLowerCase();
    if (category) {
      categoryCounts.set(
        category,
        (categoryCounts.get(category) || 0) + Math.max(item.quantity, 1),
      );
    }

    productCounts.set(
      item.productId,
      (productCounts.get(item.productId) || 0) + Math.max(item.quantity, 1),
    );
    spendValues.push((Number(item.price) || 0) * Math.max(Number(item.quantity) || 0, 1));
  });

  wishlistProducts.forEach((item) => {
    const product = productMap.get(item.productId);
    const category = normalizeText(product?.category).toLowerCase();
    if (category) {
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 2);
    }
  });

  cartProducts.forEach((item) => {
    const product = productMap.get(item.productId);
    const category = normalizeText(product?.category).toLowerCase();
    if (category) {
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 3);
    }
  });

  const preferredCategories = [...categoryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category]) => category);

  const frequentlyPurchasedProducts = [...productCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([productId, quantity]) => {
      const product = productMap.get(productId);
      return {
        productId,
        name: normalizeText(product?.name),
        quantity,
      };
    })
    .filter((item) => item.name);

  const averageSpend =
    spendValues.length > 0
      ? spendValues.reduce((sum, value) => sum + value, 0) / spendValues.length
      : 0;

  let averageSpendingRange = "unknown";
  if (averageSpend > 0) {
    averageSpendingRange = `${Math.max(0, Math.round(averageSpend * 0.8))}-${Math.round(averageSpend * 1.2)}`;
  }

  return {
    preferredCategories,
    averageSpendingRange,
    frequentlyPurchasedProducts,
  };
};

const buildCatalogForGemini = (products) => {
  return products.map((product) => ({
    productId: Number(product.id),
    name: normalizeText(product.name),
    category: normalizeText(product.category),
    price: getCatalogPrice(product),
    description: normalizeText(product.description).slice(0, 220),
  }));
};

const validateGeminiRecommendations = (recommendations, productMap, excludedIds) => {
  if (!Array.isArray(recommendations)) {
    return [];
  }

  const seen = new Set();

  return recommendations
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      productId: Number(item.productId),
      score: Number(item.score),
      reason: normalizeText(item.reason).slice(0, 120),
    }))
    .filter((item) => Number.isInteger(item.productId))
    .filter((item) => productMap.has(item.productId))
    .filter((item) => !excludedIds.has(item.productId))
    .filter((item) => Number.isFinite(item.score) && item.score >= 1 && item.score <= 100)
    .filter((item) => item.reason.length > 0)
    .filter((item) => {
      if (seen.has(item.productId)) {
        return false;
      }

      seen.add(item.productId);
      return true;
    })
    .slice(0, 10);
};

const getFallbackRecommendations = (products, excludedIds, usedIds = new Set()) => {
  const availableProducts = products.filter(
    (product) =>
      product.available !== false &&
      !excludedIds.has(Number(product.id)) &&
      !usedIds.has(Number(product.id)),
  );

  const randomized = [...availableProducts]
    .map((product) => ({ product, sortKey: Math.random() }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ product }) => product)
    .slice(0, 25)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 10);

  return randomized.map((product, index) => ({
    productId: Number(product.id),
    score: Math.max(45, FALLBACK_SCORE - index),
    reason: FALLBACK_REASON,
  }));
};

const shapeResponse = (recommendations, productMap) => {
  return recommendations
    .map((recommendation) => {
      const product = productMap.get(recommendation.productId);
      if (!product) return null;

      return {
        productId: Number(product.id),
        name: product.name,
        image: product.image,
        category: product.category,
        new_price: product.new_price,
        old_price: product.old_price,
        score: recommendation.score,
        reason: recommendation.reason,
      };
    })
    .filter(Boolean);
};

const getRecommendations = async (req, res) => {
  try {
    const { Product, Users } = getRecommendationContext();
    const [user, products] = await Promise.all([
      Users.findById(req.user.id).lean(),
      Product.find({}).sort({ id: 1 }).lean(),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        errors: "User not found",
      });
    }

    const productMap = buildProductMap(products);
    const orders = Array.isArray(user.orders) ? user.orders : [];
    const cartData = user.cartData || {};
    const wishlistData = user.wishlistData || {};

    const purchasedProducts = buildPurchasedProducts(orders);
    const purchasedIds = new Set(
      purchasedProducts
        .map((item) => Number(item.productId))
        .filter((productId) => Number.isInteger(productId)),
    );
    const wishlistIds = getActiveProductIds(wishlistData, (value) => Number(value) === 1);
    const cartIds = getActiveProductIds(cartData, (value) => Number(value) > 0);
    const excludedIds = new Set([
      ...purchasedIds,
      ...wishlistIds,
      ...cartIds,
    ]);

    const wishlistProducts = buildWishlistProducts(wishlistIds, productMap);
    const cartProducts = buildCartProducts(cartIds, cartData, productMap);
    const userInsights = buildUserInsights(
      purchasedProducts,
      wishlistProducts,
      cartProducts,
      productMap,
    );

    const userProfile = {
      purchasedProducts,
      wishlistProducts,
      cartProducts,
      userInsights,
    };

    const catalog = buildCatalogForGemini(products);
    const isStarterMode =
      purchasedProducts.length === 0 &&
      wishlistProducts.length === 0 &&
      cartProducts.length === 0;

    let finalRecommendations = [];

    try {
      const geminiRecommendations = await generateRecommendations({
        userProfile,
        catalog,
        isStarterMode,
      });

      const validRecommendations = validateGeminiRecommendations(
        geminiRecommendations,
        productMap,
        excludedIds,
      );

      finalRecommendations = [...validRecommendations];

      if (finalRecommendations.length < 10) {
        const usedIds = new Set(
          finalRecommendations.map((item) => Number(item.productId)),
        );
        const fallbackRecommendations = getFallbackRecommendations(
          products,
          excludedIds,
          usedIds,
        );

        finalRecommendations = finalRecommendations.concat(
          fallbackRecommendations.slice(0, 10 - finalRecommendations.length),
        );
      }
    } catch (error) {
      console.error("Gemini recommendations failed:", error.message);
      finalRecommendations = getFallbackRecommendations(products, excludedIds);
    }

    return res.json({
      success: true,
      recommendations: shapeResponse(finalRecommendations.slice(0, 10), productMap),
    });
  } catch (error) {
    console.error("Recommendation endpoint error:", error);
    return res.status(500).json({
      success: false,
      errors: "Unable to generate recommendations",
    });
  }
};

module.exports = {
  getRecommendations,
};
