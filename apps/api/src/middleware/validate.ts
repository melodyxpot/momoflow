import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { HttpError } from "../utils/HttpError";

export const validateBody =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(
        HttpError.badRequest("Validation failed", result.error.flatten().fieldErrors)
      );
    }
    req.body = result.data;
    next();
  };
