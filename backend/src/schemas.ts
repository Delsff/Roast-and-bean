import { z } from "zod";

export const createOrderSchema = z.object({
  customer: z.object({
    fullName: z.string().trim().min(2, "Name is too short").max(100),
    email: z.string().trim().toLowerCase().email("Invalid email"),
    address: z.string().trim().min(5, "Address is too short").max(300),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "Order must contain at least one item")
    .max(50),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(1).max(72),
});

export const updaterStatusSchema = z.object({
  status: z.enum(["pending", "processing", "completed"]),
});

const productFields = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(1000),
  price: z.number().int().min(1).max(10_000_000),
  category: z.enum(["coffee_beans", "accessories", "equipment"]),
  roastLevel: z.enum(["light", "medium", "dark"]).nullable().optional(),
  imageUrl: z.string().trim().url("Invalid image URL").max(500),
  inStock: z.boolean().optional(),
});

export const createProductSchema = productFields;

export const updateProductSchema = productFields
  .partial()
  .refine((o) => Object.keys(o).length > 0, "Nothing to update");

export type ProductInput = z.infer<typeof createProductSchema>;

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
