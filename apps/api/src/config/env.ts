import path from "node:path";
import fs from "node:fs";
import { config as loadEnv } from "dotenv";
import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Env loading strategy
//
// We support a SINGLE root `.env` at the monorepo root so users don't have
// to maintain copies inside each app. Resolution order (later wins):
//   1. <repo-root>/.env       (shared)
//   2. apps/api/.env          (optional override)
//   3. real process.env       (Docker / Vercel / CI)
// ─────────────────────────────────────────────────────────────────────────────
function findRepoRoot(start: string): string | null {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

const repoRoot = findRepoRoot(process.cwd()) ?? findRepoRoot(__dirname);
if (repoRoot) loadEnv({ path: path.join(repoRoot, ".env"), override: false });
loadEnv({ override: false }); // apps/api/.env if present

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  PUBLIC_BASE_URL: z.string().url().default("http://localhost:4000"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  // Landing page
  BRAND_NAME: z.string().default("MomoLinks"),
  DASHBOARD_URL: z.string().url().default("http://localhost:3000"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
