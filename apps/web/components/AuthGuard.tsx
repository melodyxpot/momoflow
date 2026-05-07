"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Spinner } from "@heroui/react";
import { auth } from "@/lib/api";

type Status = "checking" | "authed" | "anon";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    const check = () => {
      if (auth.token) {
        setStatus("authed");
      } else {
        setStatus("anon");
        router.replace("/login");
      }
    };

    check();

    // React to logout/login from other tabs.
    const onStorage = (e: StorageEvent) => {
      if (e.key === "momoflow_token") check();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [router]);

  if (status !== "authed") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
