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

describe("POST /api/orders", () => {
  it("lets a guest place an order and computes the total on the server", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        customer,
        items: [
          { productId: "p1", quantity: 2 },
          { productId: "p2", quantity: 1 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.totalAmount).toBe(4000);
    expect(res.body.status).toBe("pending");
    expect(res.body.userId).toBeNull();
    expect(res.body.items).toHaveLength(2);
  });

  it("ignores prices, names and totals sent by the client", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        customer,
        totalAmount: 1,
        items: [
          { productId: "p1", quantity: 2, price: 1, productName: "hacked" },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.totalAmount).toBe(3000);
    expect(res.body.items[0]).toMatchObject({
      price: 1500,
      productName: "Test Beans A",
    });
  });

  it("attaches the order to a logged-in user", async () => {
    const { user, token } = await createUser();
    const res = await request(app)
      .post("/api/orders")
      .set(bearer(token))
      .send({ customer, items: [{ productId: "p1", quantity: 1 }] });

    expect(res.status).toBe(201);
    expect(res.body.userId).toBe(user.id);
  });

  it.each([
    ["an empty cart", { customer, items: [] }],
    [
      "a zero quantity",
      { customer, items: [{ productId: "p1", quantity: 0 }] },
    ],
    [
      "a negative quantity",
      { customer, items: [{ productId: "p1", quantity: -3 }] },
    ],
    [
      "a fractional quantity",
      { customer, items: [{ productId: "p1", quantity: 1.5 }] },
    ],
    [
      "an invalid email",
      {
        customer: { ...customer, email: "nope" },
        items: [{ productId: "p1", quantity: 1 }],
      },
    ],
    [
      "a missing address",
      {
        customer: { ...customer, address: "" },
        items: [{ productId: "p1", quantity: 1 }],
      },
    ],
  ])("rejects %s", async (_label, body) => {
    const res = await request(app).post("/api/orders").send(body);
    expect(res.status).toBe(400);
  });

  it("rejects an unknown product", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        customer,
        items: [{ productId: "does-not-exist", quantity: 1 }],
      });
    expect(res.status).toBe(400);
  });

  it("rejects an out-of-stock product", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ customer, items: [{ productId: "p3", quantity: 1 }] });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/out of stock/i);
  });
});

describe("GET /api/orders/my", () => {
  it("requires authentication", async () => {
    const res = await request(app).get("/api/orders/my");
    expect(res.status).toBe(401);
  });

  it("returns only the orders of the current user", async () => {
    const alice = await createUser();
    const bob = await createUser();
    const payload = { customer, items: [{ productId: "p1", quantity: 1 }] };

    await request(app)
      .post("/api/orders")
      .set(bearer(alice.token))
      .send(payload);
    await request(app)
      .post("/api/orders")
      .set(bearer(alice.token))
      .send(payload);
    await request(app).post("/api/orders").set(bearer(bob.token)).send(payload);

    const aliceOrders = await request(app)
      .get("/api/orders/my")
      .set(bearer(alice.token));
    const bobOrders = await request(app)
      .get("/api/orders/my")
      .set(bearer(bob.token));

    expect(aliceOrders.body).toHaveLength(2);
    expect(bobOrders.body).toHaveLength(1);
  });
});

describe("GET /api/orders (admin)", () => {
  it("is closed to guests and regular users, open to admins", async () => {
    const user = await createUser("user");
    const admin = await createUser("admin");

    const guest = await request(app).get("/api/orders");
    const asUser = await request(app)
      .get("/api/orders")
      .set(bearer(user.token));
    const asAdmin = await request(app)
      .get("/api/orders")
      .set(bearer(admin.token));

    expect(guest.status).toBe(401);
    expect(asUser.status).toBe(403);
    expect(asAdmin.status).toBe(200);
  });
});

describe("PATCH /api/orders/:id/status", () => {
  const createOrder = async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ customer, items: [{ productId: "p1", quantity: 1 }] });
    return res.body.id as string;
  };

  it("lets an admin change the status", async () => {
    const admin = await createUser("admin");
    const id = await createOrder();

    const res = await request(app)
      .patch(`/api/orders/${id}/status`)
      .set(bearer(admin.token))
      .send({ status: "completed" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("completed");
  });

  it("forbids regular users", async () => {
    const user = await createUser("user");
    const id = await createOrder();

    const res = await request(app)
      .patch(`/api/orders/${id}/status`)
      .set(bearer(user.token))
      .send({ status: "completed" });

    expect(res.status).toBe(403);
  });

  it("validates the status and the order id", async () => {
    const admin = await createUser("admin");
    const id = await createOrder();

    const badStatus = await request(app)
      .patch(`/api/orders/${id}/status`)
      .set(bearer(admin.token))
      .send({ status: "shipped-to-moon" });
    const unknownOrder = await request(app)
      .patch("/api/orders/nope/status")
      .set(bearer(admin.token))
      .send({ status: "completed" });

    expect(badStatus.status).toBe(400);
    expect(unknownOrder.status).toBe(404);
  });
});
