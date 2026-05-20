import bcrypt from "bcryptjs";
import geoip from "geoip-lite";
import { parseUserAgent, pickWeighted, type LinkRules } from "@momolinks/lib";
import {
  redis,
  linkCacheKey,
  negativeCacheKey,
  LINK_CACHE_TTL,
  NEGATIVE_CACHE_TTL,
} from "../config/redis";
import { LinkModel } from "../models/Link";
import { logger } from "../config/logger";

export interface CachedLink {
  id: string;
  targetUrl: string;
  enabled: boolean;
  expiresAt: string | null;
  rules?: LinkRules;
}

export interface ResolveContext {
  ip: string;
  userAgent?: string;
  password?: string;
}

export type ResolveResult =
  | { kind: "redirect"; url: string; linkId: string }
  | { kind: "not_found" }
  | { kind: "expired"; linkId: string }
  | { kind: "disabled"; linkId: string }
  | { kind: "password_required"; linkId: string }
  | { kind: "password_invalid"; linkId: string };

export async function resolveLink(code: string, ctx: ResolveContext): Promise<ResolveResult> {
  const link = await loadLink(code);
  if (!link) return { kind: "not_found" };

  if (!link.enabled) return { kind: "disabled", linkId: link.id };

  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    return { kind: "expired", linkId: link.id };
  }

  if (link.rules?.password) {
    if (!ctx.password) return { kind: "password_required", linkId: link.id };
    const ok = await bcrypt.compare(ctx.password, link.rules.password);
    if (!ok) return { kind: "password_invalid", linkId: link.id };
  }

  const target = pickTarget(link, ctx);
  return { kind: "redirect", url: target, linkId: link.id };
}

async function loadLink(code: string): Promise<CachedLink | null> {
  // 1) Positive cache
  try {
    const cached = await redis.get(linkCacheKey(code));
    if (cached) return JSON.parse(cached) as CachedLink;
  } catch (err) {
    logger.warn("Redis get failed", { code, err });
  }

  // 2) Negative cache to prevent DB hammering on bad codes
  try {
    const miss = await redis.get(negativeCacheKey(code));
    if (miss) return null;
  } catch {
    /* noop */
  }

  // 3) DB fallback
  const doc = await LinkModel.findOne({ code }).lean();
  if (!doc) {
    redis.set(negativeCacheKey(code), "1", "EX", NEGATIVE_CACHE_TTL).catch(() => {});
    return null;
  }

  const cached: CachedLink = {
    id: String(doc._id),
    targetUrl: doc.targetUrl,
    enabled: doc.enabled,
    expiresAt: doc.expiresAt ? new Date(doc.expiresAt).toISOString() : null,
    rules: doc.rules as LinkRules | undefined,
  };
  redis.set(linkCacheKey(code), JSON.stringify(cached), "EX", LINK_CACHE_TTL).catch(() => {});
  return cached;
}

function pickTarget(link: CachedLink, ctx: ResolveContext): string {
  const rules = link.rules;
  if (!rules) return link.targetUrl;

  // Geo
  if (rules.geo && rules.geo.length > 0) {
    const country = geoip.lookup(ctx.ip)?.country;
    if (country) {
      const match = rules.geo.find((r) => r.country.toUpperCase() === country.toUpperCase());
      if (match) return match.url;
    }
  }

  // Device
  if (rules.device && rules.device.length > 0) {
    const { device } = parseUserAgent(ctx.userAgent);
    const match = rules.device.find((r) => r.device === device);
    if (match) return match.url;
  }

  // A/B
  if (rules.ab && rules.ab.length > 0) {
    const variant = pickWeighted(rules.ab);
    if (variant) return variant.url;
  }

  return link.targetUrl;
}
