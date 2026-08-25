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

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    display_name: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { email } = await signup(form);
      toast.success("Account created. Check your email for a code.");
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Could not create your account.";
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Join Tankas"
      subtitle="Report waste, join cleanups, earn rewards."
      footer={
        <>
          <span className="text-ink-muted">Already have an account?</span>
          <Link href="/login" className="font-bold text-primary-ink">
            Sign in
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
            minLength={3}
            placeholder="kofim"
            className={authInputClass}
          />
        </AuthField>

        <AuthField label="EMAIL" icon="send">
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
            required
            placeholder="you@example.com"
            className={authInputClass}
          />
        </AuthField>

        <AuthField label="DISPLAY NAME" icon="sparkles">
          <input
            value={form.display_name}
            onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            autoComplete="name"
            placeholder="Kofi Mensah"
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
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            className={authInputClass}
          />
        </AuthField>

        <button type="submit" disabled={loading} className={authButtonClass}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
