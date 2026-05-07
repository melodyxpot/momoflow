"use client";

import { Button, Description, Input, Label, TextField, toast } from "@heroui/react";
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
      toast.success(`Welcome, ${out.user.name}!`);
      router.replace("/dashboard");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Registration failed";
      console.error("Sign up failed:", message);
      toast.danger("Sign up failed. Please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">Create account</h1>
      <p className="mt-1 text-sm text-default-500">Start shortening links in seconds.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <TextField isRequired>
          <Label htmlFor="name">Name</Label>
          <Input
            name="name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            autoComplete="name"
          />
        </TextField>
        
        <TextField isRequired>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            name='email'
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            autoComplete="email"
          />
        </TextField>

        <TextField isRequired>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            autoComplete="new-password"
          />
          <Description>Minimum 8 characters</Description>
        </TextField>
        <Button type="submit" variant="primary" isPending={loading}>
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
