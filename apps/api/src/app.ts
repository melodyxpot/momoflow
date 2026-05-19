import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { env } from "./config/env";
import { logger } from "./config/logger";
import { apiLimiter } from "./middleware/rateLimit";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import linkRoutes from "./routes/linkRoutes";
import statsRoutes from "./routes/statsRoutes";
import landingRoutes from "./routes/landingRoutes";
import redirectRoutes from "./routes/redirectRoutes";

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet({ contentSecurityPolicy: false }));
  const allowedOrigins = env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean);
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser());

  if (env.NODE_ENV !== "test") {
    app.use(
      morgan(env.NODE_ENV === "production" ? "combined" : "dev", {
        stream: { write: (msg) => logger.http?.(msg.trim()) ?? logger.info(msg.trim()) },
      })
    );
  }

  // Health
  app.get("/health", (_req, res) => res.json({ status: "ok", uptime: process.uptime() }));

  // API surface (rate-limited)
  app.use("/api/auth", apiLimiter, authRoutes);
  app.use("/api/links", apiLimiter, linkRoutes);
  app.use("/api/stats", apiLimiter, statsRoutes);

  // Public landing page at exact "/". Mounted before the redirect router
  // so it doesn't collide with /:code (which only matches /something).
  app.use("/", landingRoutes);

  // Critical hot path: short-link redirect. Mounted last to avoid shadowing /api/*.
  app.use("/", redirectRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
