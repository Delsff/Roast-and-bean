import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { HttpError } from "./errorHandler";

export type AuthUser = { id: string; role: "user" | "admin" };

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const signToken = (user: AuthUser) =>
  jwt.sign({ role: user.role }, config.JWT_SECRET, {
    subject: user.id,
    expiresIn: "7d",
  });

const readToken = (req: Request) => {
  const header = req.headers.authorization;
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
};

const verify = (token: string): AuthUser => {
  const payload = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload;
  return { id: payload.sub as string, role: payload.role };
};

export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = readToken(req);
  if (token) {
    try {
      req.user = verify(token);
    } catch {}
  }
  next();
};

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = readToken(req);
  if (!token) throw new HttpError(401, "Authentication required");
  try {
    req.user = verify(token);
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }
  next();
};

export const requireAdmin = [
  requireAuth,
  (req: Request, _res: Response, next: NextFunction) => {
    if (req.user?.role !== "admin") throw new HttpError(403, "Forbidden");
    next();
  },
];
