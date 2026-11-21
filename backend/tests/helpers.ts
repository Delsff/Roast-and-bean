import bcrypt from "bcryptjs";
import { prisma } from "../src/db";
import { signToken } from "../src/middleware/auth";

export const customer = {
  fullName: "John Doe",
  email: "john@example.com",
  address: "123 Coffee Street, Prague",
};

export async function resetDb() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
}

export async function seedProducts() {
  const base = {
    description: "Test product description",
    category: "coffee_beans" as const,
    imageUrl: "https://example.com/image.jpg",
  };
  await prisma.product.createMany({
    data: [
      {
        id: "p1",
        name: "Test Beans A",
        price: 1500,
        roastLevel: "light",
        inStock: true,
        ...base,
      },
      {
        id: "p2",
        name: "Test Beans B",
        price: 1000,
        roastLevel: "dark",
        inStock: true,
        ...base,
      },
      {
        id: "p3",
        name: "Sold Out Beans",
        price: 900,
        roastLevel: "medium",
        inStock: false,
        ...base,
      },
    ],
  });
}

let counter = 0;

export async function createUser(role: "user" | "admin" = "user") {
  counter += 1;
  const user = await prisma.user.create({
    data: {
      email: `${role}${counter}@test.dev`,
      name: `Test ${role}`,
      passwordHash: await bcrypt.hash("password123", 4),
      role,
    },
  });
  return { user, token: signToken({ id: user.id, role: user.role }) };
}
