const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CATEGORIES = [
  "Electronics",
  "Apparel",
  "Footwear",
  "Home & Living",
  "Beauty",
  "Sports",
  "Accessories"
];

const ADJECTIVES = ["Premium", "Classic", "Modern", "Essential", "Luxury", "Smart", "Ultra", "Minimal", "Pro", "Vintage"];
const NOUNS = ["Watch", "Headphones", "Speaker", "Backpack", "Shirt", "Sneakers", "Lamp", "Wallet", "Bottle", "Desk"];

const SIZES = ["S", "M", "L", "XL"];
const COLORS = ["Midnight", "Crimson", "Slate", "Evergreen", "Sand", "Frost"];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSKU(name, variantName) {
  const prefix = name.substring(0, 3).toUpperCase();
  const suffix = variantName.substring(0, 3).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${suffix}-${random}`;
}

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Create Categories
  const categoryMap = {};
  for (const name of CATEGORIES) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categoryMap[name] = cat.id;
    console.log(`✅ Category: ${name}`);
  }

  // 2. Generate 100 Products
  for (let i = 0; i < 100; i++) {
    const adj = getRandomItem(ADJECTIVES);
    const noun = getRandomItem(NOUNS);
    const productName = `${adj} ${noun} ${i + 1}`;
    const categoryName = getRandomItem(CATEGORIES);
    const basePrice = Math.floor(Math.random() * 1000) + 50;
    
    const status = i < 70 ? "PUBLISHED" : i < 90 ? "DRAFT" : "ARCHIVED";

    const product = await prisma.product.create({
      data: {
        name: productName,
        description: `This is a high-quality ${productName.toLowerCase()}. Designed for durability and style, perfect for your everyday needs. Features premium materials and expert craftsmanship.`,
        basePrice,
        categoryId: categoryMap[categoryName],
        status,
        lowStockThreshold: 5,
        images: {
          create: [
            {
              url: `https://picsum.photos/seed/${productName.replace(/ /g, "")}/800/800`,
              position: 0
            }
          ]
        },
        attributes: {
          create: [
            {
              name: "Size",
              options: {
                create: SIZES.map(v => ({ value: v }))
              }
            },
            {
              name: "Color",
              options: {
                create: COLORS.slice(0, 3).map(v => ({ value: v }))
              }
            }
          ]
        }
      },
      include: {
        attributes: { include: { options: true } }
      }
    });

    // 3. Generate Variants
    // We'll just create a few variants per product to avoid huge DB size but enough for testing
    const sizeAttr = product.attributes.find(a => a.name === "Size");
    const colorAttr = product.attributes.find(a => a.name === "Color");

    for (let j = 0; j < 3; j++) {
      const size = getRandomItem(sizeAttr.options);
      const color = getRandomItem(colorAttr.options);
      const variantName = `${size.value} / ${color.value}`;
      
      const stockQty = Math.floor(Math.random() * 50);
      const sku = generateSKU(product.name, variantName);

      await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku,
          stockQty,
          lowStockThreshold: 3,
          isActive: true,
          optionMaps: {
            create: [
              { optionId: size.id },
              { optionId: color.id }
            ]
          }
        }
      });
    }

    if ((i + 1) % 10 === 0) {
      console.log(`📦 Generated ${i + 1} products...`);
    }
  }

  console.log("✨ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
