import Redis from "ioredis";
import { env } from "./env";
import { logger } from "./logger";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 2,
  enableReadyCheck: true,
  lazyConnect: false,
  retryStrategy(times) {
    return Math.min(times * 200, 3000);
  },
});

redis.on("connect", () => logger.info("Redis connected"));
redis.on("error", (err) => logger.error("Redis error", err));

// ---------- Keys ----------
export const linkCacheKey = (code: string) => `link:${code}`;
export const negativeCacheKey = (code: string) => `link:miss:${code}`;

// 1 hour for hot links, 1 minute for negatives (avoid cache stampede on 404)
export const LINK_CACHE_TTL = 60 * 60;
export const NEGATIVE_CACHE_TTL = 60;
