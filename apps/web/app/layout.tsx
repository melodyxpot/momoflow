import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "MomoFlow — URL shortener & smart redirects",
  description:
    "Create branded short links, route by geo/device/A-B, and track clicks in real time.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SHORT_DOMAIN ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
