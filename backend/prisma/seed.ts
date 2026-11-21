import { PrismaClient, type Category, type RoastLevel } from "@prisma/client";
import { products } from "../src/data/products";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();

  if (count === 0) {
    for (const p of products) {
      await prisma.product.create({
        data: {
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          category: p.category.replace("-", "_") as Category,
          roastLevel: (p.roastLevel ?? null) as RoastLevel | null,
          imageUrl: p.imageUrl,
          inStock: p.inStock,
        },
      });
    }
  } else {
    console.log("Products already exist, skipping");
  }
  await seedAdmin();
  for (const p of products) {
    const data = {
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category.replace("-", "_") as Category,
      roastLevel: (p.roastLevel ?? null) as RoastLevel | null,
      imageUrl: p.imageUrl,
      inStock: p.inStock,
    };
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: { id: p.id, ...data },
    });
  }
  console.log(`Seeded ${products.length} products`);
  await seedAdmin();
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set, skipping admin");
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "admin" },
    create: { email, name: "Admin", passwordHash, role: "admin" },
  });
  console.log(`Admin ready: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
