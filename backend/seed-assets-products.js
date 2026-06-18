const fs = require("fs");
const path = require("path");

const API_BASE = "http://localhost:4000";
const assetsDir = path.join(__dirname, "..", "frontend", "src", "Components", "Assets");

const products = [
  ["product_1.png", "Women's Striped Flutter Sleeve Peplum Blouse", "women", 50, 80.5, "Lightweight striped blouse with flutter sleeves, an overlap collar, and a flattering peplum hem for polished everyday styling."],
  ["product_2.png", "Women's Floral Wrap Peplum Top", "women", 85, 120.5, "Soft wrap-style peplum top with a feminine silhouette, easy drape, and a dressy-casual finish."],
  ["product_3.png", "Women's Ruffle Sleeve Casual Blouse", "women", 60, 100.5, "Comfortable blouse with subtle ruffle sleeves and a neat fit that works well with jeans, skirts, or tailored trousers."],
  ["product_4.png", "Women's Statement Collar Printed Top", "women", 100, 150, "Printed everyday top with a sharp collar detail and relaxed structure for brunch, office, or weekend wear."],
  ["product_5.png", "Women's Soft Gathered Hem Blouse", "women", 85, 120.5, "Easy-fit blouse with soft gathers, breathable fabric feel, and a clean shape for daily outfits."],
  ["product_6.png", "Women's Elegant Sleeve Detail Top", "women", 85, 120.5, "Modern sleeve-detail top designed for a refined look without sacrificing comfort."],
  ["product_7.png", "Women's Classic Casual Printed Blouse", "women", 85, 120.5, "Versatile printed blouse with a smooth finish and comfortable cut for repeat everyday use."],
  ["product_8.png", "Women's Relaxed Fit Fashion Top", "women", 85, 120.5, "Relaxed fashion top with a flattering fall, soft touch, and simple styling for day-to-night wear."],
  ["product_9.png", "Women's Premium Layering Blouse", "women", 85, 120.5, "Premium blouse built for easy layering, featuring a polished neckline and comfortable regular fit."],
  ["product_10.png", "Women's Chic Workwear Blouse", "women", 85, 120.5, "Smart workwear blouse with a neat profile, lightweight comfort, and an elevated casual look."],
  ["product_11.png", "Women's Everyday Peplum Shirt", "women", 85, 120.5, "Everyday peplum shirt with a feminine shape, simple pairing options, and an airy feel."],
  ["product_12.png", "Women's Modern Printed Casual Top", "women", 85, 120.5, "Modern printed casual top made for easy styling with denim, trousers, or skirts."],
  ["product_13.png", "Men's Green Slim Fit Bomber Jacket", "men", 85, 120.5, "Slim fit bomber jacket with a clean zip front, structured collar, and lightweight warmth for casual layering."],
  ["product_14.png", "Men's Casual Full-Zip Jacket", "men", 85, 120.5, "Everyday full-zip jacket with a comfortable fit and versatile styling for cool-weather outfits."],
  ["product_15.png", "Men's Urban Lightweight Bomber", "men", 85, 120.5, "Urban bomber jacket with lightweight construction, practical zip closure, and a sharp casual profile."],
  ["product_16.png", "Men's Solid Zip-Front Jacket", "men", 85, 120.5, "Solid zip-front jacket designed for easy layering over tees, polos, and casual shirts."],
  ["product_17.png", "Men's Weekend Bomber Jacket", "men", 85, 120.5, "Weekend-ready bomber with a clean shape, comfortable sleeves, and a dependable everyday finish."],
  ["product_18.png", "Men's Smart Casual Jacket", "men", 85, 120.5, "Smart casual jacket with a balanced fit and minimal detailing for a modern wardrobe staple."],
  ["product_19.png", "Men's Classic Green Outerwear Jacket", "men", 85, 120.5, "Classic green outerwear jacket with a regular fit, clean zip front, and easy seasonal layering."],
  ["product_20.png", "Men's Sporty Full-Zip Bomber", "men", 85, 120.5, "Sporty full-zip bomber jacket with comfortable movement and a polished streetwear-inspired look."],
  ["product_21.png", "Men's Daily Wear Zip Jacket", "men", 85, 120.5, "Daily wear zip jacket with a lightweight feel, simple shape, and reliable casual comfort."],
  ["product_22.png", "Men's Minimal Bomber Jacket", "men", 85, 120.5, "Minimal bomber jacket that pairs easily with denim, chinos, and sneakers for effortless styling."],
  ["product_23.png", "Men's Regular Fit Casual Jacket", "men", 85, 120.5, "Regular fit casual jacket with clean lines and a practical design for everyday use."],
  ["product_24.png", "Men's Essential Zip Bomber", "men", 85, 120.5, "Essential zip bomber with timeless styling, easy comfort, and a versatile solid finish."],
  ["product_25.png", "Kids' Orange Colourblock Hooded Sweatshirt", "kid", 85, 120.5, "Bright colourblock hoodie with soft comfort, a playful look, and easy layering for active days."],
  ["product_26.png", "Kids' Cozy Hooded Sweatshirt", "kid", 85, 120.5, "Cozy hooded sweatshirt made for school days, weekend play, and relaxed everyday comfort."],
  ["product_27.png", "Kids' Casual Colourblock Hoodie", "kid", 85, 120.5, "Casual colourblock hoodie with a comfortable fit and cheerful styling for daily wear."],
  ["product_28.png", "Kids' Everyday Pullover Hoodie", "kid", 85, 120.5, "Everyday pullover hoodie with soft fabric feel and a durable shape for active kids."],
  ["product_29.png", "Kids' Playtime Hooded Sweatshirt", "kid", 85, 120.5, "Playtime-ready hooded sweatshirt with warm coverage and easy movement."],
  ["product_30.png", "Kids' Soft Casual Hoodie", "kid", 85, 120.5, "Soft casual hoodie with a relaxed fit and fun colour detail for comfortable outings."],
  ["product_31.png", "Kids' Weekend Colourblock Sweatshirt", "kid", 85, 120.5, "Weekend colourblock sweatshirt with a cozy hood and easy-care everyday styling."],
  ["product_32.png", "Kids' Warm Hooded Pullover", "kid", 85, 120.5, "Warm hooded pullover designed for simple layering, comfort, and playful everyday outfits."],
  ["product_33.png", "Kids' Active Day Hoodie", "kid", 85, 120.5, "Active day hoodie with a comfortable cut and bright colourblocking for energetic routines."],
  ["product_34.png", "Kids' Relaxed Fit Sweatshirt", "kid", 85, 120.5, "Relaxed fit sweatshirt with a cozy feel and easy styling for school or casual days."],
  ["product_35.png", "Kids' Bright Hooded Sweatshirt", "kid", 85, 120.5, "Bright hooded sweatshirt with playful colour details and soft comfort for daily wear."],
  ["product_36.png", "Kids' Essential Colourblock Hoodie", "kid", 85, 120.5, "Essential colourblock hoodie with a comfortable hood, easy fit, and reliable everyday warmth."],
];

async function uploadImage(filename) {
  const filePath = path.join(assetsDir, filename);
  const blob = new Blob([await fs.promises.readFile(filePath)]);
  const form = new FormData();
  form.append("product", blob, filename);

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    throw new Error(`Upload failed for ${filename}: ${response.status}`);
  }

  const data = await response.json();
  if (!data.success || !data.image_url) {
    throw new Error(`Upload failed for ${filename}: ${JSON.stringify(data)}`);
  }
  return data.image_url;
}

async function addProduct(product) {
  const response = await fetch(`${API_BASE}/addproduct`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    throw new Error(`Add product failed for ${product.name}: ${response.status}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(`Add product failed for ${product.name}: ${JSON.stringify(data)}`);
  }
}

async function main() {
  const existingResponse = await fetch(`${API_BASE}/allproducts`);
  if (!existingResponse.ok) {
    throw new Error(`Backend is not reachable at ${API_BASE}`);
  }
  const existingProducts = await existingResponse.json();
  const existingNames = new Set(existingProducts.map((product) => product.name));

  let added = 0;
  let skipped = 0;

  for (const [filename, name, category, new_price, old_price, description] of products) {
    if (existingNames.has(name)) {
      skipped += 1;
      console.log(`Skipped existing: ${name}`);
      continue;
    }

    const image = await uploadImage(filename);
    await addProduct({ name, category, new_price, old_price, description, image });
    added += 1;
    console.log(`Added: ${name}`);
  }

  console.log(`Done. Added ${added}, skipped ${skipped}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
