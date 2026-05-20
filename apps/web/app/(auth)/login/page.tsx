"use client";

import { Button, Input, Label, TextField, toast } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, api, auth } from "@/lib/api";
import type { AuthUser } from "@momolinks/lib";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("auth");
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
      toast.success(t("welcomeBack", { name: out.user.name }));
      router.replace("/dashboard");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Login failed";
      console.error("Sign in failed:", message);
      toast.danger(t("loginFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">{t("loginTitle")}</h1>
      <p className="mt-1 text-sm text-default-500">{t("loginSubtitle")}</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <TextField isRequired>
          <Label>{t("email")}</Label>
          <Input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            autoComplete="email"
          />
        </TextField>
        <TextField isRequired>
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            autoComplete="current-password"
          />
        </TextField>
        <Button type="submit" variant="primary" isPending={loading}>
          {t("signInButton")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-default-500">
        {t("newHere")}{" "}
        <Link href="/register" className="text-primary hover:underline">
          {t("createAccount")}
        </Link>
      </p>
    </>
  );
}
