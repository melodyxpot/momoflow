"use client";

import { Switch } from "@heroui/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-6 w-10" />;

  return (
    <Switch
      size="sm"
      isSelected={theme === "dark"}
      onValueChange={(v) => setTheme(v ? "dark" : "light")}
      aria-label="Toggle dark mode"
    />
  );
}
