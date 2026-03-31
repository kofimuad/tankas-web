"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all filled
    if (newOtp.every((d) => d) && newOtp.join("").length === 6) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    const otpCode = code || otp.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }
    setLoading(true);
    try {
      await authApi.verifyOTP(email, otpCode);
      toast.success("Email verified! Welcome to Tankas 🎉");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail || "Invalid code. Please try again.",
      );
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      await authApi.resendOTP(email);
      toast.success("New code sent to your email!");
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1a13] flex flex-col justify-center px-6 py-12">
      <div className="max-w-md mx-auto w-full text-center">
        <Link
          href="/"
          className="font-display font-800 text-xl text-white mb-12 block"
        >
          🌍 Tankas
        </Link>

        <div className="text-5xl mb-6">📧</div>
        <h1 className="font-display text-3xl font-700 text-white mb-2">
          Check your email
        </h1>
        <p className="text-white/50 mb-2">We sent a 6-digit code to</p>
        <p className="text-[#38e07b] font-medium mb-10">{email}</p>

        {/* OTP inputs */}
        <div className="flex justify-center gap-3 mb-8">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-display font-700 text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#38e07b]/60 transition-colors"
            />
          ))}
        </div>

        <button
          onClick={() => handleVerify()}
          disabled={loading || otp.some((d) => !d)}
          className="w-full bg-[#38e07b] text-[#0e1a13] font-display font-700 text-base py-4 rounded-xl hover:bg-[#38e07b]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {loading ? "Verifying..." : "Verify email →"}
        </button>

        <button
          onClick={handleResend}
          disabled={countdown > 0 || resending}
          className="text-white/40 text-sm hover:text-white/70 transition-colors disabled:cursor-not-allowed"
        >
          {countdown > 0
            ? `Resend code in ${countdown}s`
            : resending
              ? "Sending..."
              : "Resend code"}
        </button>

        <p className="text-white/20 text-xs mt-6">
          Didn&apos;t get an email? Check your spam folder.
        </p>
      </div>
    </div>
  );
}
