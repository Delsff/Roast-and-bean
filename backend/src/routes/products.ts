import { Router } from "express";
import { prisma } from "../db";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { products } from "../data/products";
import { HttpError } from "../middleware/errorHandler";
import {
  createProductSchema,
  updateProductSchema,
  type ProductInput,
} from "../schemas";

export const productsRouter = Router();

productsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const products = await prisma.product.findMany({
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    res.json(products);
  }),
);

productsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
    if (!product) throw new HttpError(404, "Product not found");
    res.json(product);
  }),
);

productsRouter.post(
  "/",
  requireAdmin,
  validate(createProductSchema),
  asyncHandler(async (req, res) => {
    const data = req.body as ProductInput;
    const product = await prisma.product.create({
      data: { ...data, roastLevel: data.roastLevel ?? null },
    });
    res.status(201).json(product);
  }),
);

productsRouter.patch(
  "/:id",
  requireAdmin,
  validate(updateProductSchema),
  asyncHandler(async (req, res) => {
    const exists = await prisma.product.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });
    if (!exists) throw new HttpError(404, "Product not found");
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(product);
  }),
);

productsRouter.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const exists = await prisma.product.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });
    if (!exists) throw new HttpError(404, "Product not found");
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).end();
  }),
);
