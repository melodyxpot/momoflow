import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-screen items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,#7c3aed30,transparent)]" />
      <div className="absolute left-6 top-6">
        <Link href="/" className="text-lg font-bold">
          momo<span className="text-primary">flow</span>
        </Link>
      </div>
      <div className="w-full max-w-md rounded-2xl border border-default-200 bg-content1 p-8 shadow-xl">
        {children}
      </div>
    </div>
  );
}
