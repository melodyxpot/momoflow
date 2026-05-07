/**
 * Sanitize and normalize a URL string. Returns null when invalid or unsafe.
 *
 * Rules:
 *  - Only http(s) schemes allowed (no javascript:, data:, file:, etc.)
 *  - No localhost / private IP ranges (configurable; off by default)
 *  - Trim whitespace, normalize hostname casing
 */
export function sanitizeUrl(
  raw: string,
  opts: { allowPrivate?: boolean } = {}
): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null;
  }

  if (!opts.allowPrivate && isPrivateHost(url.hostname)) {
    return null;
  }

  url.hostname = url.hostname.toLowerCase();
  return url.toString();
}

const PRIVATE_HOST_REGEX =
  /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.0\.0\.0|::1|fc00:|fe80:)/i;

export function isPrivateHost(hostname: string): boolean {
  if (PRIVATE_HOST_REGEX.test(hostname)) return true;
  // 172.16.0.0/12
  const m = /^172\.(\d+)\./.exec(hostname);
  if (m && m[1]) {
    const second = Number(m[1]);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

export function buildShortUrl(base: string, code: string): string {
  const trimmed = base.replace(/\/+$/, "");
  return `${trimmed}/${code}`;
}
