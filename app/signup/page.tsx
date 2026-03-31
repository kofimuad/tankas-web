"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    display_name: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { email } = await signup(form);
      toast.success(
        "Account created! Check your email for a verification code.",
      );
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail || "Signup failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1a13] flex">
      {/* Left — form */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 max-w-lg mx-auto w-full">
        <Link
          href="/"
          className="font-display font-800 text-xl text-white mb-12 block"
        >
          🌍 Tankas
        </Link>

        <h1 className="font-display text-4xl font-700 text-white mb-2">
          Join the movement
        </h1>
        <p className="text-white/50 mb-10">
          Already have an account?{" "}
          <Link href="/login" className="text-[#38e07b] hover:underline">
            Log in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-white/60 mb-2">Username</label>
            <input
              type="text"
              required
              placeholder="bismark123"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#38e07b]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Email</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#38e07b]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">
              Display Name <span className="text-white/30">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Bismark Antwi"
              value={form.display_name}
              onChange={(e) =>
                setForm({ ...form, display_name: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#38e07b]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Password</label>
            <input
              type="password"
              required
              placeholder="8+ characters with uppercase and numbers"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#38e07b]/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#38e07b] text-[#0e1a13] font-display font-700 text-base py-4 rounded-xl hover:bg-[#38e07b]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Creating account..." : "Create account →"}
          </button>
        </form>

        <p className="text-white/20 text-xs text-center mt-8">
          By signing up you agree to help keep Ghana clean 🌿
        </p>
      </div>

      {/* Right — visual panel (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-[#38e07b]/10 border-l border-white/5 flex-col justify-center items-center p-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-[#38e07b]/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <div className="text-8xl mb-6">🌍</div>
          <h2 className="font-display text-3xl font-700 text-white mb-4">
            Snap. Clean. Earn.
          </h2>
          <div className="space-y-4 text-left mt-8">
            {[
              { icon: "📸", text: "Report issues, earn 15 pts instantly" },
              { icon: "🧹", text: "Join cleanups, earn up to 60 pts" },
              { icon: "💰", text: "Redeem for GHS via Mobile Money" },
              { icon: "🏆", text: "Climb the leaderboard" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-white/60">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
