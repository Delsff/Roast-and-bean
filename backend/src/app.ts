import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import { productsRouter } from "./routes/products";
import { ordersRouter } from "./routes/orders";
import { errorHandler, NotFound } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth";
import { asyncHandler } from "./middleware/asyncHandler";
import { prisma } from "./db";
export const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: config.CLIENT_ORIGIN }));
app.use(express.json({ limit: "10kb" }));
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    skip: () => config.NODE_ENV === "test",
  }),
);
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  skip: () => config.NODE_ENV === "test",
});
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
const allowedOrigins = config.CLIENT_ORIGIN.split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins }));
app.get(
  "/health",
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  }),
);
app.get("/", (_req, res) => {
  res.send("Roast & Bean API is running...");
});
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/auth", authLimiter, authRouter);

app.use(NotFound);
app.use(errorHandler);
