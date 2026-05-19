"use client";

import { Switch } from "@heroui/react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

// Subscribe to "we have hydrated on the client" without setState-in-effect.
// React calls getSnapshot during SSR (returns false) and again after hydration
// on the client (returns true), which lets us defer rendering the Switch until
// next-themes has resolved the active theme — avoiding a hydration mismatch.
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

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
