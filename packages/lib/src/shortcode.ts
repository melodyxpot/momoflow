import { customAlphabet } from "nanoid";

// URL-friendly alphabet, no ambiguous characters (0/O, 1/l/I)
const ALPHABET = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";

const generators = new Map<number, () => string>();

function getGenerator(size: number) {
  let g = generators.get(size);
  if (!g) {
    g = customAlphabet(ALPHABET, size);
    generators.set(size, g);
  }
  return g;
}

/**
 * Generate a URL-safe short code.
 * Default length: 7 characters → ~3.5e12 combinations.
 */
export function generateShortCode(size = 7): string {
  return getGenerator(size)();
}

const RESERVED_CODES = new Set([
  "api",
  "admin",
  "dashboard",
  "login",
  "logout",
  "register",
  "signup",
  "signin",
  "auth",
  "settings",
  "stats",
  "links",
  "static",
  "public",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "health",
  "healthz",
  "ping",
  "preview",
  "qr",
]);

export function isReservedCode(code: string): boolean {
  return RESERVED_CODES.has(code.toLowerCase());
}
