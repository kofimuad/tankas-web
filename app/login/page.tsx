"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success("Welcome back! 👋");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail || "Invalid credentials. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1a13] flex flex-col justify-center px-6 py-12">
      <div className="max-w-md mx-auto w-full">
        <Link
          href="/"
          className="font-display font-800 text-xl text-white mb-12 block"
        >
          🌍 Tankas
        </Link>

        <h1 className="font-display text-4xl font-700 text-white mb-2">
          Welcome back
        </h1>
        <p className="text-white/50 mb-10">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#38e07b] hover:underline">
            Sign up
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-white/60 mb-2">
              Username or Email
            </label>
            <input
              type="text"
              required
              placeholder="bismark123 or you@example.com"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#38e07b]/50 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-white/60">Password</label>
            </div>
            <input
              type="password"
              required
              placeholder="Your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#38e07b]/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#38e07b] text-[#0e1a13] font-display font-700 text-base py-4 rounded-xl hover:bg-[#38e07b]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log in →"}
          </button>
        </form>
      </div>
    </div>
  );
}
