import { beforeEach, afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/db";
import { resetDb } from "./helpers";
import { email } from "zod";

const credentials = {
  name: "Alice",
  email: "alice@test.dev",
  password: "password123",
};

beforeEach(resetDb);
afterAll(() => prisma.$disconnect());

describe("POST /api/auth/register", () => {
  it("creates a user and returns a token without exposing the hash", async () => {
    const res = await request(app).post("/api/auth/register").send(credentials);
    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({
      email: credentials.email,
      role: "user",
    });
    expect(res.body.user).not.toHaveProperty("passwordHash");
  });
  it("stores the password hashed, not in plain text", async () => {
    await request(app).post("/api/auth/register").send(credentials);
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });
    expect(user?.passwordHash).toBeDefined();
    expect(user?.passwordHash).not.toBe(credentials.password);
  });
  it("rejects a duplicate email", async () => {
    await request(app).post("/api/auth/register").send(credentials);
    const res = await request(app).post("/api/auth/register").send(credentials);
    expect(res.status).toBe(409);
  });
  it("rejects a short password and a invalid email", async () => {
    const short = await request(app)
      .post("/api/auth/register")
      .send({ ...credentials, password: "123" });
    const badEmail = await request(app)
      .post("/api/auth/register")
      .send({ ...credentials, email: "not-an-email" });

    expect(short.status).toBe(400);
    expect(badEmail.status).toBe(400);
  });
  it("never lets a client choose its own role", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...credentials,
        role: "admin",
      });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("user");
  });
});

describe("POST /api/auth/login", () => {
  it("logs in with correct credentials", async () => {
    await request(app).post("/api/auth/register").send(credentials);
    const res = await request(app).post("/api/auth/login").send({
      email: credentials.email,
      password: credentials.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
  });
  it("gives the same error for a wrong password and an unknown email", async () => {
    await request(app).post("/api/auth/register").send(credentials);

    const wrongPassword = await request(app)
      .post("/api/auth/login")
      .send({ email: credentials.email, password: "wrong-password" });
    const unknownEmail = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@test.dev", password: "password123" });
    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body.error).toBe(unknownEmail.body.error);
  });
});

describe("GET /api/auth/me", () => {
  it("requires a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
  it("rejects a garbage token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer not.a.taken");
    expect(res.status).toBe(401);
  });
  it("returns the current user", async () => {
    const reg = await request(app).post("/api/auth/register").send(credentials);
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${reg.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(credentials.email);
  });
});
