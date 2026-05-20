import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import createNextIntlPlugin from "next-intl/plugin";

// ─── Load monorepo-root .env so we only maintain ONE env file ────────────────
// On Vercel this file won't exist (envs come from the dashboard) — that's fine.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
function findRepoRoot(start) {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}
const repoRoot = findRepoRoot(__dirname);
if (repoRoot) {
  loadEnv({ path: path.join(repoRoot, ".env"), override: false });
}

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@momolinks/ui", "@momolinks/lib", "@heroui/react"],
  experimental: {
    optimizePackageImports: ["@heroui/react", "recharts"],
  },
  outputFileTracingRoot: repoRoot ?? path.join(__dirname, "../.."),
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SHORT_DOMAIN: process.env.NEXT_PUBLIC_SHORT_DOMAIN,
  },
};

export default withNextIntl(nextConfig);
