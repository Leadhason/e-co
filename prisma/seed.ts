import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding the database...");

  // 1. Check if an owner already exists
  const existingOwner = await prisma.adminUser.findFirst({
    where: { role: "OWNER" },
  });

  if (existingOwner) {
    console.log("Owner account already exists. Skipping seed.");
    return;
  }

  // 2. Create the default owner account
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  await prisma.adminUser.create({
    data: {
      name: "Store Owner",
      email: "owner@brand.com",
      passwordHash: hashedPassword,
      role: "OWNER",
    },
  });

  console.log("Created Owner Account:");
  console.log("Email: owner@brand.com");
  console.log("Password: admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
