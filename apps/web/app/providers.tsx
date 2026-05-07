"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Toast } from "@heroui/react";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
      <Toast.Provider />
      {children}
    </NextThemesProvider>
  );
}
