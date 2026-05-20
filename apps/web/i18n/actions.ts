"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { locales, LOCALE_COOKIE, type Locale } from "./config";

export async function setLocaleCookie(next: Locale) {
  if (!(locales as readonly string[]).includes(next)) return;
  const store = await cookies();
  store.set(LOCALE_COOKIE, next, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  // Re-render all server components with the new locale.
  revalidatePath("/", "layout");
}
