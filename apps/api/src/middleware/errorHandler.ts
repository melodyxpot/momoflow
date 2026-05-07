import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/HttpError";
import { logger } from "../config/logger";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(HttpError.notFound("Route not found"));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  logger.error("Unhandled error", { err, path: req.path });

  res.status(500).json({
    success: false,
    error: { code: "INTERNAL", message: "Internal server error" },
  });
}
