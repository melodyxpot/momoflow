"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { setLocaleCookie } from "@/i18n/actions";
import { locales, localeNames, type Locale } from "@/i18n/config";

export function LocaleSwitcher() {
  const current = useLocale() as Locale;
  const [pending, startTransition] = useTransition();

  function change(next: Locale) {
    if (next === current || pending) return;
    startTransition(() => {
      void setLocaleCookie(next);
    });
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center gap-0.5 rounded-full border border-default-200 bg-content2 p-0.5 text-xs"
    >
      {locales.map((l) => {
        const active = l === current;
        return (
          <button
            key={l}
            type="button"
            onClick={() => change(l)}
            aria-pressed={active}
            disabled={pending}
            className={
              "px-2.5 py-1 rounded-full transition-colors " +
              (active
                ? "bg-primary text-primary-foreground"
                : "text-default-600 hover:bg-default-100")
            }
            title={localeNames[l]}
          >
            {l.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
