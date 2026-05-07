import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { HttpError } from "../utils/HttpError";
import type { UserRole } from "@momoflow/lib";

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface AuthedRequest extends Request {
  user: JwtPayload;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(HttpError.unauthorized("Missing bearer token"));
  }
  const token = header.slice("Bearer ".length).trim();
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    (req as AuthedRequest).user = decoded;
    next();
  } catch {
    next(HttpError.unauthorized("Invalid or expired token"));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as AuthedRequest).user;
    if (!user || !roles.includes(user.role)) {
      return next(HttpError.forbidden("Insufficient permissions"));
    }
    next();
  };
}
