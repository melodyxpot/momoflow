import { Button, Chip } from "@heroui/react";
import Link from "next/link"

export default function LandingPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_-20%,#7c3aed40,transparent),radial-gradient(60%_60%_at_80%_120%,#22d3ee30,transparent)]" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-xl font-bold tracking-tight">
          momo<span className="text-primary">flow</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="tertiary" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm">
              Get started
            </Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-32">
        <Chip size="sm" variant="tertiary" className="mb-6">
          Production-ready · Redis-cached redirects
        </Chip>
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
          Smart short links that{" "}
          <span className="bg-linear-to-br from-primary to-cyan-400 bg-clip-text text-transparent">
            route, track, and convert
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-default-500 sm:text-lg">
          Create branded short links, route by geo / device / A-B variant, protect with
          passwords, and watch clicks roll in — all behind a sub-50ms redirect engine.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/register">
            <Button variant="primary" size="lg">
              Start for free
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 pb-24 sm:grid-cols-3">
        {[
          {
            title: "Lightning redirects",
            body: "Redis-backed lookup with negative caching keeps the hot path under 50ms.",
          },
          {
            title: "Smart routing",
            body: "Geo, device, A-B weighted variants, expiration, and password-protected links.",
          },
          {
            title: "Real-time analytics",
            body: "Per-link stats by country, device, referrer and day — written async, never blocking.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-default-200 bg-content1 p-6 backdrop-blur"
          >
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-default-500">{f.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
