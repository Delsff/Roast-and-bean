import { Router } from "express";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { loginSchema, registerSchema } from "../schemas";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/asyncHandler";
import { HttpError } from "../middleware/errorHandler";
import { requireAuth, signToken } from "../middleware/auth";

export const authRouter = Router();

const publicUser = (u: {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
}) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
});

authRouter.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 12);
    try {
      const user = await prisma.user.create({
        data: { name, email, passwordHash },
      });
      res.status(201).json({
        token: signToken({ id: user.id, role: user.role }),
        user: publicUser(user),
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new HttpError(409, "Email is already registered");
      }
      throw err;
    }
  }),
);

authRouter.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!user || !ok) throw new HttpError(401, "Invalid email or password");
    res.json({
      token: signToken({ id: user.id, role: user.role }),
      user: publicUser(user),
    });
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new HttpError(401, "User no longer exists");
    res.json(publicUser(user));
  }),
);
