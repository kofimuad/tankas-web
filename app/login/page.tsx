"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  AuthField,
  AuthLayout,
  authButtonClass,
  authInputClass,
} from "@/components/auth-layout";
import { Icon } from "@/components/ui/icon";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success("Welcome back.");
      router.push("/dashboard");
    } catch (err) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Could not sign you in.";
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Tankas"
      subtitle="Clean your city. Earn as you go."
      footer={
        <>
          <span className="text-ink-muted">New to Tankas?</span>
          <Link href="/signup" className="font-bold text-primary-ink">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <AuthField label="USERNAME" icon="user">
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            autoComplete="username"
            required
            placeholder="your username"
            className={authInputClass}
          />
        </AuthField>

        <AuthField
          label="PASSWORD"
          icon="lock"
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="shrink-0 text-ink-muted"
            >
              <Icon name="eye" size={17} />
            </button>
          }
        >
          <input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className={authInputClass}
          />
        </AuthField>

        <button type="submit" disabled={loading} className={authButtonClass}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}
