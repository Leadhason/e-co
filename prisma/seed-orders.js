const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CUSTOMER_NAMES = [
  "Kwame Mensah", "Ama Serwaa", "Kofi Annan", "Akosua Boateng", 
  "John Doe", "Jane Smith", "Emmanuel Osei", "Fatima Abubakar",
  "David Tetteh", "Sarah Appiah", "Robert Mensah", "Linda Owusu",
  "Charles Boadu", "Grace Addo", "Michael Frimpong"
];

const CITIES = ["Accra", "Kumasi", "Tamale", "Takoradi", "Tema", "Cape Coast", "Koforidua"];
const REGIONS = ["Greater Accra", "Ashanti", "Northern", "Western", "Central", "Eastern"];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("🌱 Starting order seed...");

  // 1. Fetch existing Products and Variants
  const variants = await prisma.productVariant.findMany({
    include: { product: true }
  });

  if (variants.length === 0) {
    console.error("❌ No variants found. Please seed products first!");
    return;
  }

  // 2. Create Customers and Addresses
  const customers = [];
  for (const name of CUSTOMER_NAMES) {
    const email = `${name.toLowerCase().replace(/ /g, ".")}@example.com`;
    const customer = await prisma.customer.upsert({
      where: { email },
      update: {},
      create: {
        name,
        email,
        phone: `+233${Math.floor(200000000 + Math.random() * 700000000)}`,
        addresses: {
          create: [
            {
              line1: `${Math.floor(10 + Math.random() * 90)} ${getRandomItem(ADJECTIVES_STREET)} Street`,
              city: getRandomItem(CITIES),
              region: getRandomItem(REGIONS),
              isDefault: true
            }
          ]
        }
      },
      include: { addresses: true }
    });
    customers.push(customer);
  }
  console.log(`✅ Created ${customers.length} customers.`);

  // 3. Generate 50 Orders
  for (let i = 0; i < 50; i++) {
    const customer = getRandomItem(customers);
    const address = customer.addresses[0];
    const orderNumber = `ORD-${Date.now()}-${i + 100}`;
    
    // Pick 1-4 random items
    const numItems = Math.floor(Math.random() * 4) + 1;
    const selectedVariants = [];
    for (let j = 0; j < numItems; j++) {
      selectedVariants.push(getRandomItem(variants));
    }

    let subtotal = 0;
    const itemsData = selectedVariants.map(v => {
      const price = v.priceOverride ?? v.product.basePrice;
      const qty = Math.floor(Math.random() * 2) + 1;
      const itemSubtotal = price * qty;
      subtotal += itemSubtotal;
      return {
        variantId: v.id,
        productName: v.product.name,
        variantName: "Standard", // Simplification for seed
        sku: v.sku,
        unitPrice: price,
        quantity: qty,
        subtotal: itemSubtotal
      };
    });

    const shippingFee = subtotal > 500 ? 0 : 30;
    const total = subtotal + shippingFee;

    const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    const status = i < 10 ? "PENDING" : i < 20 ? "PROCESSING" : i < 40 ? "DELIVERED" : "CANCELLED";
    
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));

    await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        addressId: address.id,
        status,
        paymentStatus: status === "DELIVERED" ? "PAID" : "UNPAID",
        paymentMethod: "Mobile Money",
        subtotal,
        shippingFee,
        total,
        createdAt,
        items: {
          create: itemsData
        }
      }
    });

    if ((i + 1) % 10 === 0) {
      console.log(`🛒 Generated ${i + 1} orders...`);
    }
  }

  console.log("✨ Order seeding complete!");
}

const ADJECTIVES_STREET = ["Oxford", "Spintex", "Independence", "Liberation", "High", "Boundary", "Labadi"];

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
