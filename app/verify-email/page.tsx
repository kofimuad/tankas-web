"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { AuthLayout, authButtonClass } from "@/components/auth-layout";

const LENGTH = 6;

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [otp, setOtp] = useState<string[]>(Array(LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const setDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  // Let a pasted code fill every box rather than only the focused one.
  const onPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    e.preventDefault();
    const next = Array(LENGTH).fill("");
    for (let i = 0; i < Math.min(text.length, LENGTH); i++) next[i] = text[i];
    setOtp(next);
    inputs.current[Math.min(text.length, LENGTH - 1)]?.focus();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < LENGTH) {
      toast.error("Enter all 6 digits.");
      return;
    }
    setLoading(true);
    try {
      await authApi.verifyOTP(email, code);
      toast.success("Email verified.");
      router.push("/dashboard");
    } catch (err) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "That code did not work.";
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await authApi.resendOTP(email);
      toast.success("New code sent.");
      setCountdown(60);
    } catch (err) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Could not resend the code.";
      toast.error(detail);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={
        email ? `We sent a 6-digit code to ${email}` : "Enter the 6-digit code"
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div className="flex justify-center gap-2" onPaste={onPaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={digit}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              aria-label={`Digit ${i + 1}`}
              className="numeric size-12 rounded-md border border-border bg-surface text-center text-xl font-bold text-ink outline-none focus:border-primary"
            />
          ))}
        </div>

        <button type="submit" disabled={loading} className={authButtonClass}>
          {loading ? "Verifying…" : "Verify email"}
        </button>

        <button
          type="button"
          onClick={resend}
          disabled={countdown > 0 || resending}
          className="text-center text-[13px] font-semibold text-primary-ink disabled:text-ink-muted"
        >
          {countdown > 0
            ? `Resend code in ${countdown}s`
            : resending
              ? "Sending…"
              : "Resend code"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  // useSearchParams() opts this subtree out of prerendering, so it needs a
  // Suspense boundary above it.
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-canvas" aria-busy="true" />}
    >
      <VerifyForm />
    </Suspense>
  );
}
