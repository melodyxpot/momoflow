export type UserRole = "user" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface GeoRule {
  country: string; // ISO 3166-1 alpha-2
  url: string;
}

export interface DeviceRule {
  device: "mobile" | "tablet" | "desktop";
  url: string;
}

export interface ABVariant {
  url: string;
  weight: number; // 0-100
}

export interface LinkRules {
  geo?: GeoRule[];
  device?: DeviceRule[];
  ab?: ABVariant[];
  password?: string; // hashed
}

export interface Link {
  id: string;
  code: string;
  targetUrl: string;
  userId: string;
  clicks: number;
  uniqueClicks: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
  rules?: LinkRules;
  title?: string;
  description?: string;
  enabled: boolean;
}

export interface AnalyticsEvent {
  id: string;
  linkId: string;
  timestamp: string;
  ipHash: string;
  country?: string;
  device?: "mobile" | "tablet" | "desktop";
  browser?: string;
  os?: string;
  referrer?: string;
  bot?: boolean;
}

export interface LinkStats {
  totalClicks: number;
  uniqueClicks: number;
  byCountry: Record<string, number>;
  byDevice: Record<string, number>;
  byReferrer: Record<string, number>;
  byDay: Array<{ date: string; clicks: number }>;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
