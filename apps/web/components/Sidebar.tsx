"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { cn } from "@momoflow/ui";
import { auth } from "@/lib/api";
import { ThemeSwitch } from "./ThemeSwitch";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "▦" },
  { href: "/links", label: "Links", icon: "🔗" },
  { href: "/links/new", label: "Create", icon: "+" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    auth.clear();
    router.replace("/login");
  }

  return (
    <aside className="sticky top-0 flex h-screen w-60 flex-col border-r border-default-200 bg-content1/60 px-4 py-6 backdrop-blur">
      <Link href="/dashboard" className="mb-8 px-2 text-xl font-bold tracking-tight">
        momo<span className="text-primary">flow</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-default-600 hover:bg-default-100"
              )}
            >
              <span className="w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t border-default-200 pt-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-default-400">Theme</span>
          <ThemeSwitch />
        </div>
        <Button size="sm" variant="flat" color="danger" onPress={logout}>
          Sign out
        </Button>
      </div>
    </aside>
  );
}
