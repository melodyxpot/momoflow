import type { Config } from "tailwindcss";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

// Resolve where any @heroui/* package lives on disk, then scan the whole
// @heroui directory. This is the only reliable approach in a Turborepo +
// pnpm monorepo because individual components (input, dropdown, modal, …)
// each contain their own tailwind-variants class strings, not just the
// @heroui/theme package.
const heroUiRoot = path.resolve(
  path.dirname(require.resolve("@heroui/react/package.json")),
  ".."
);

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./lib/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    `${heroUiRoot}/**/dist/**/*.{js,mjs,cjs}`,
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  darkMode: "class",
};

export default config;
