import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

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

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Workspace TS sources must be transpiled by Next.
  transpilePackages: ["@momoflow/ui", "@momoflow/lib", "@heroui/react"],
  experimental: {
    optimizePackageImports: ["@heroui/react", "recharts"],
  },
  // Required for Vercel deployments from a monorepo:
  // tells Next to trace files starting from the repo root so that
  // workspace packages (@momoflow/ui, @momoflow/lib) are included.
  outputFileTracingRoot: repoRoot ?? path.join(__dirname, "../.."),
  // Re-export public env vars so they are baked into the client bundle even
  // when only present in the root .env at build time.
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SHORT_DOMAIN: process.env.NEXT_PUBLIC_SHORT_DOMAIN,
  },
};

export default nextConfig;
