"use client";

import { Button, Input, addToast } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, api, auth } from "@/lib/api";
import type { AuthUser } from "@momoflow/lib";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const out = await api.post<{ token: string; user: AuthUser }>("/api/auth/register", {
        name,
        email,
        password,
      });
      auth.set(out.token);
      addToast({ title: `Welcome, ${out.user.name}!`, color: "success" });
      router.replace("/dashboard");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Registration failed";
      addToast({ title: "Sign up failed", description: message, color: "danger" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">Create account</h1>
      <p className="mt-1 text-sm text-default-500">Start shortening links in seconds.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          label="Name"
          value={name}
          onValueChange={setName}
          isRequired
          autoComplete="name"
        />
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
          autoComplete="new-password"
          description="Minimum 8 characters"
        />
        <Button type="submit" color="primary" isLoading={loading}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-default-500">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
