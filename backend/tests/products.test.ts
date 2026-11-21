import { beforeEach, afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/db";
import { createUser, customer, resetDb, seedProducts } from "./helpers";

beforeEach(async () => {
  await resetDb();
  await seedProducts();
});
afterAll(() => prisma.$disconnect());

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

const newProduct = {
  name: "New Grinder",
  description: "Burr grinder for home use",
  price: 8900,
  category: "equipment",
  imageUrl: "https://example.com/grinder.jpg",
};

describe("GET /api/products", () => {
  it("returns the catalog", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  it("returns one product or 404", async () => {
    const found = await request(app).get("/api/products/p1");
    const missing = await request(app).get("/api/products/nope");

    expect(found.body.name).toBe("Test Beans A");
    expect(missing.status).toBe(404);
  });
});

describe("POST /api/products", () => {
  it("is admin-only", async () => {
    const user = await createUser("user");

    const guest = await request(app).post("/api/products").send(newProduct);
    const asUser = await request(app)
      .post("/api/products")
      .set(bearer(user.token))
      .send(newProduct);

    expect(guest.status).toBe(401);
    expect(asUser.status).toBe(403);
  });

  it("creates a product for an admin", async () => {
    const admin = await createUser("admin");
    const res = await request(app)
      .post("/api/products")
      .set(bearer(admin.token))
      .send(newProduct);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: "New Grinder",
      roastLevel: null,
      inStock: true,
    });
  });

  it("validates the payload", async () => {
    const admin = await createUser("admin");

    const negativePrice = await request(app)
      .post("/api/products")
      .set(bearer(admin.token))
      .send({ ...newProduct, price: -5 });
    const badUrl = await request(app)
      .post("/api/products")
      .set(bearer(admin.token))
      .send({ ...newProduct, imageUrl: "not a url" });

    expect(negativePrice.status).toBe(400);
    expect(badUrl.status).toBe(400);
  });
});

describe("PATCH /api/products/:id", () => {
  it("updates only the given fields and keeps the rest", async () => {
    const admin = await createUser("admin");

    // p3 лежит с inStock = false: частичное обновление не должно вернуть true
    const res = await request(app)
      .patch("/api/products/p3")
      .set(bearer(admin.token))
      .send({ name: "Renamed" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Renamed");
    expect(res.body.inStock).toBe(false);
  });

  it("rejects an empty update and an unknown id", async () => {
    const admin = await createUser("admin");

    const empty = await request(app)
      .patch("/api/products/p1")
      .set(bearer(admin.token))
      .send({});
    const missing = await request(app)
      .patch("/api/products/nope")
      .set(bearer(admin.token))
      .send({ name: "Whatever" });

    expect(empty.status).toBe(400);
    expect(missing.status).toBe(404);
  });
});

describe("DELETE /api/products/:id", () => {
  it("is admin-only", async () => {
    const user = await createUser("user");
    const res = await request(app)
      .delete("/api/products/p1")
      .set(bearer(user.token));
    expect(res.status).toBe(403);
  });

  it("deletes the product but keeps old orders intact", async () => {
    const admin = await createUser("admin");
    await request(app)
      .post("/api/orders")
      .send({ customer, items: [{ productId: "p1", quantity: 2 }] });

    const res = await request(app)
      .delete("/api/products/p1")
      .set(bearer(admin.token));
    expect(res.status).toBe(204);

    const item = await prisma.orderItem.findFirst();
    expect(item?.productId).toBeNull();
    expect(item?.productName).toBe("Test Beans A");
    expect(item?.price).toBe(1500);
  });
});
