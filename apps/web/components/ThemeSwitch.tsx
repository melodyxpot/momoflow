"use client";

import { Switch } from "@heroui/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes resolves the active theme only on the client; rendering the
  // Switch before mount would cause a hydration mismatch.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div aria-hidden className="h-6 w-10" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Switch
      size="sm"
      isSelected={isDark}
      onChange={(selected: boolean) => setTheme(selected ? "dark" : "light")}
      aria-label="Toggle dark mode"
    >
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
    </Switch>
  );
}
