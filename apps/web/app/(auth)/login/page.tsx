"use client";

import { Button, Input } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, api, auth } from "@/lib/api";
import type { AuthUser } from "@momoflow/lib";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const out = await api.post<{ token: string; user: AuthUser }>("/api/auth/login", {
        email,
        password,
      });
      auth.set(out.token);
      console.log(`Welcome back, ${out.user.name}!`);
      router.replace("/dashboard");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Login failed";
      console.error("Sign in failed:", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-1 text-sm text-default-500">Welcome back to MomoFlow.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          type="email"
          label="Email"
          value={email}
          onValueChange={setEmail}
          isRequired
          autoComplete="email"
        />
        <Input
          type="password"
          label="Password"
          value={password}
          onValueChange={setPassword}
          isRequired
          autoComplete="current-password"
        />
        <Button type="submit" color="primary" isLoading={loading}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-default-500">
        New here?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
