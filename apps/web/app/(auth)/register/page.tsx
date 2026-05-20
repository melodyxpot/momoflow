"use client";

import { Button, Description, Input, Label, TextField, toast } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, api, auth } from "@/lib/api";
import type { AuthUser } from "@momolinks/lib";

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations("auth");
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
      toast.success(t("welcome", { name: out.user.name }));
      router.replace("/dashboard");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Registration failed";
      console.error("Sign up failed:", message);
      toast.danger(t("registerFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">{t("registerTitle")}</h1>
      <p className="mt-1 text-sm text-default-500">{t("registerSubtitle")}</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <TextField isRequired>
          <Label htmlFor="name">{t("name")}</Label>
          <Input
            name="name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            autoComplete="name"
          />
        </TextField>

        <TextField isRequired>
          <Label htmlFor="email">{t("email")}</Label>
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
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            autoComplete="new-password"
          />
          <Description>{t("passwordHint")}</Description>
        </TextField>
        <Button type="submit" variant="primary" isPending={loading}>
          {t("registerButton")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-default-500">
        {t("haveAccount")}{" "}
        <Link href="/login" className="text-primary hover:underline">
          {t("signInLink")}
        </Link>
      </p>
    </>
  );
}
