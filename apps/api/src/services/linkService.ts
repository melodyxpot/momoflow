import bcrypt from "bcryptjs";
import {
  generateShortCode,
  isReservedCode,
  sanitizeUrl,
  type CreateLinkInput,
  type UpdateLinkInput,
} from "@momoflow/lib";
import { LinkModel, type LinkDoc } from "../models/Link";
import { HttpError } from "../utils/HttpError";
import { linkCacheKey, redis, LINK_CACHE_TTL, negativeCacheKey } from "../config/redis";
import { logger } from "../config/logger";

const MAX_CODE_RETRIES = 5;

export async function createLink(userId: string, input: CreateLinkInput): Promise<LinkDoc> {
  const safeUrl = sanitizeUrl(input.targetUrl);
  if (!safeUrl) throw HttpError.badRequest("Invalid or unsafe target URL");

  let code = input.customCode?.trim();

  if (code) {
    if (isReservedCode(code)) throw HttpError.conflict("This alias is reserved");
    const exists = await LinkModel.exists({ code });
    if (exists) throw HttpError.conflict("Custom alias already taken");
  } else {
    code = await generateUniqueCode();
  }

  const rules = input.rules ? { ...input.rules } : undefined;
  if (rules?.password) {
    rules.password = await bcrypt.hash(rules.password, 10);
  }

  const doc = await LinkModel.create({
    code,
    targetUrl: safeUrl,
    userId,
    expiresAt: input.expiresAt ?? null,
    title: input.title,
    description: input.description,
    rules,
  });

  await invalidateLinkCache(code);
  return doc;
}

async function generateUniqueCode(size = 7): Promise<string> {
  for (let i = 0; i < MAX_CODE_RETRIES; i++) {
    const code = generateShortCode(size);
    if (isReservedCode(code)) continue;
    const exists = await LinkModel.exists({ code });
    if (!exists) return code;
  }
  // expand size on extreme collisions
  return generateUniqueCode(size + 1);
}

export async function listLinks(userId: string, query: { page?: number; limit?: number; search?: string }) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { userId };
  if (query.search) {
    const re = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [{ code: re }, { targetUrl: re }, { title: re }];
  }

  const [items, total] = await Promise.all([
    LinkModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    LinkModel.countDocuments(filter),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getLinkById(userId: string, id: string): Promise<LinkDoc> {
  const link = await LinkModel.findOne({ _id: id, userId });
  if (!link) throw HttpError.notFound("Link not found");
  return link;
}

export async function updateLink(
  userId: string,
  id: string,
  input: UpdateLinkInput
): Promise<LinkDoc> {
  const link = await getLinkById(userId, id);

  if (input.targetUrl) {
    const safe = sanitizeUrl(input.targetUrl);
    if (!safe) throw HttpError.badRequest("Invalid or unsafe target URL");
    link.targetUrl = safe;
  }
  if (input.expiresAt !== undefined) link.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
  if (input.enabled !== undefined) link.enabled = input.enabled;
  if (input.title !== undefined) link.title = input.title;
  if (input.description !== undefined) link.description = input.description;

  if (input.rules) {
    const rules = { ...input.rules };
    if (rules.password) rules.password = await bcrypt.hash(rules.password, 10);
    link.rules = rules;
  }

  await link.save();
  await invalidateLinkCache(link.code);
  return link;
}

export async function deleteLink(userId: string, id: string): Promise<void> {
  const link = await LinkModel.findOneAndDelete({ _id: id, userId });
  if (!link) throw HttpError.notFound("Link not found");
  await invalidateLinkCache(link.code);
}

export async function invalidateLinkCache(code: string): Promise<void> {
  try {
    await redis.del(linkCacheKey(code), negativeCacheKey(code));
  } catch (err) {
    logger.warn("Cache invalidation failed", { code, err });
  }
}

export async function cacheLink(code: string, payload: object): Promise<void> {
  try {
    await redis.set(linkCacheKey(code), JSON.stringify(payload), "EX", LINK_CACHE_TTL);
  } catch (err) {
    logger.warn("Cache set failed", { code, err });
  }
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
