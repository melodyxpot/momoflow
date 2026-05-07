import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

// Resolve the actual on-disk location of the HeroUI theme package.
// This works regardless of pnpm/yarn hoisting in a Turborepo monorepo.
const heroUiThemePath = path.join(
  path.dirname(require.resolve("@heroui/theme/package.json")),
  "dist/**/*.{js,ts,jsx,tsx}"
);

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./lib/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    heroUiThemePath,
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: { DEFAULT: "#6d28d9", foreground: "#ffffff" },
          },
        },
        dark: {
          colors: {
            primary: { DEFAULT: "#a78bfa", foreground: "#0b0b14" },
          },
        },
      },
    }),
  ],
};

export default config;
