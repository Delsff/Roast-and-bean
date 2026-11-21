import { Router } from "express";
import { prisma } from "../db";
import {
  createOrderSchema,
  updaterStatusSchema,
  type CreateOrderInput,
} from "../schemas";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/asyncHandler";
import { HttpError } from "../middleware/errorHandler";
import { optionalAuth, requireAdmin, requireAuth } from "../middleware/auth";

export const ordersRouter = Router();

ordersRouter.post(
  "/",
  optionalAuth,
  validate(createOrderSchema),
  asyncHandler(async (req, res) => {
    const { customer, items } = req.body as CreateOrderInput;

    const ids = [...new Set(items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    const orderItems = items.map(({ productId, quantity }) => {
      const product = byId.get(productId);
      if (!product) throw new HttpError(400, `Product ${productId} not found`);
      if (!product.inStock)
        throw new HttpError(400, `${product.name} is out of stock`);
      return {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity,
      };
    });
    const totalAmount = orderItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    );
    const order = await prisma.order.create({
      data: {
        userId: req.user?.id ?? null,
        customerName: customer.fullName,
        customerEmail: customer.email,
        customerAddress: customer.address,
        totalAmount,
        items: { create: orderItems },
      },
      include: { items: true },
    });
    res.status(201).json(order);
  }),
);

ordersRouter.get(
  "/my",
  requireAuth,
  asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  }),
);

ordersRouter.get(
  "/",
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  }),
);

ordersRouter.patch(
  "/:id/status",
  requireAdmin,
  validate(updaterStatusSchema),
  asyncHandler(async (req, res) => {
    const exists = await prisma.order.findUnique({
      where: { id: req.params.id },
    });
    if (!exists) throw new HttpError(404, "Order not found");
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
      include: { items: true },
    });
    res.json(order);
  }),
);
