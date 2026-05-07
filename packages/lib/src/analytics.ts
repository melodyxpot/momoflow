import { createHash } from "crypto";
import { UAParser } from "ua-parser-js";

export function hashIp(ip: string, salt = "momoflow"): string {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export interface ParsedClient {
  device: "mobile" | "tablet" | "desktop";
  browser?: string;
  os?: string;
  bot: boolean;
}

const BOT_REGEX =
  /bot|crawl|slurp|spider|mediapartners|facebookexternalhit|whatsapp|telegram|preview|monitor|pingdom|uptime/i;

export function parseUserAgent(ua: string | undefined): ParsedClient {
  if (!ua) {
    return { device: "desktop", bot: false };
  }

  const bot = BOT_REGEX.test(ua);
  const parser = new UAParser(ua);
  const result = parser.getResult();
  const t = result.device.type;
  const device: ParsedClient["device"] =
    t === "mobile" ? "mobile" : t === "tablet" ? "tablet" : "desktop";

  return {
    device,
    browser: result.browser.name,
    os: result.os.name,
    bot,
  };
}

/** Pick a weighted A/B variant. Sum of weights doesn't need to be 100. */
export function pickWeighted<T extends { weight: number }>(
  variants: T[]
): T | undefined {
  if (variants.length === 0) return undefined;
  const total = variants.reduce((s, v) => s + Math.max(0, v.weight), 0);
  if (total <= 0) return variants[0];
  let r = Math.random() * total;
  for (const v of variants) {
    r -= Math.max(0, v.weight);
    if (r <= 0) return v;
  }
  return variants[variants.length - 1];
}
