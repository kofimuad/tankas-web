"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { issuesApi, Issue } from "@/lib/api";
import { motion } from "framer-motion";

// ---------------------------------------------------------------------------
// Stat counter component
// ---------------------------------------------------------------------------
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-4xl md:text-5xl font-800 text-[#38e07b]">
        {value}
      </span>
      <span className="text-sm text-white/60 mt-1 tracking-widest uppercase">
        {label}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Issue card
// ---------------------------------------------------------------------------
function IssueCard({ issue }: { issue: Issue }) {
  const difficultyColor = {
    easy: "bg-green-500/20 text-green-400 border-green-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    hard: "bg-red-500/20 text-red-400 border-red-500/30",
  }[issue.difficulty];

  return (
    <Link href={`/issues/${issue.id}`}>
      <div className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#38e07b]/40 hover:bg-white/8 transition-all duration-300 cursor-pointer">
        <div className="relative h-48 overflow-hidden">
          <img
            src={issue.picture_url || "/placeholder-issue.jpg"}
            alt={issue.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 flex gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full border font-medium ${difficultyColor}`}
            >
              {issue.difficulty}
            </span>
            <span className="text-xs px-2 py-1 rounded-full border border-[#38e07b]/40 bg-[#38e07b]/20 text-[#38e07b] font-medium">
              {issue.points_assigned} pts
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-display font-600 text-white text-base mb-1 line-clamp-1">
            {issue.title}
          </h3>
          <p className="text-white/50 text-sm line-clamp-2">
            {issue.description}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Nav
// ---------------------------------------------------------------------------
function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0e1a13]/90 backdrop-blur-md border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-800 text-xl text-white">
          🌍 Tankas
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/issues"
            className="text-white/70 hover:text-white text-sm transition-colors"
          >
            Issues
          </Link>
          <Link
            href="/leaderboard"
            className="text-white/70 hover:text-white text-sm transition-colors"
          >
            Leaderboard
          </Link>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-sm bg-[#38e07b] text-[#0e1a13] font-600 px-4 py-2 rounded-full hover:bg-[#38e07b]/90 transition-colors"
              >
                Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-white/70 hover:text-white text-sm transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm bg-[#38e07b] text-[#0e1a13] font-600 px-4 py-2 rounded-full hover:bg-[#38e07b]/90 transition-colors"
              >
                Join the movement
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Landing page
// ---------------------------------------------------------------------------
export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(true);

  useEffect(() => {
    if (isAuthenticated) router.push("/dashboard");
  }, [isAuthenticated]);

  useEffect(() => {
    issuesApi
      .getAll("open")
      .then((data) => setIssues(data.slice(0, 6)))
      .catch(() => setIssues([]))
      .finally(() => setLoadingIssues(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0e1a13] text-white">
      <Navbar />

      {/* ----------------------------------------------------------------- */}
      {/* Hero */}
      {/* ----------------------------------------------------------------- */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Background mesh */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#38e07b]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#38e07b]/5 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "linear-gradient(rgba(56,224,123,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(56,224,123,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-[#38e07b]/10 border border-[#38e07b]/30 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-[#38e07b] rounded-full animate-pulse" />
            <span className="text-[#38e07b] text-sm font-medium">
              Ghana&apos;s Environmental Cleanup Platform
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-6xl md:text-8xl font-800 leading-none mb-6">
            <span className="text-white">Snap.</span>{" "}
            <span className="text-gradient">Clean.</span>{" "}
            <span className="text-white">Earn.</span>
          </h1>

          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Report environmental issues in your community, volunteer for
            cleanups, and earn real GHS rewards through Mobile Money.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-[#38e07b] text-[#0e1a13] font-display font-700 text-lg px-8 py-4 rounded-2xl hover:bg-[#38e07b]/90 transition-all hover:scale-105 active:scale-95"
            >
              Start earning today →
            </Link>
            <Link
              href="/issues"
              className="w-full sm:w-auto bg-white/5 border border-white/20 text-white font-display font-600 text-lg px-8 py-4 rounded-2xl hover:bg-white/10 transition-all"
            >
              Browse issues
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative z-10 mt-24 w-full max-w-3xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-6 grid grid-cols-3 gap-8">
            <StatCard value="100pts" label="= GHS 1" />
            <StatCard value="500+" label="Min to Redeem" />
            <StatCard value="3" label="Networks Supported" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* How it works */}
      {/* ----------------------------------------------------------------- */}
      <section className="py-32 px-6 bg-[#0a120e]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-700 text-white mb-4">
              How it works
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Three steps to a cleaner Ghana and money in your pocket.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                icon: "📸",
                title: "Snap",
                desc: "Spot litter, dumping, or pollution? Take a photo and report it. Our AI verifies the issue automatically. You earn 15 points instantly.",
              },
              {
                number: "02",
                icon: "🧹",
                title: "Clean",
                desc: "Join a cleanup group or go solo. Mark the issue resolved with a before/after photo. Earn up to 60 points per cleanup.",
              },
              {
                number: "03",
                icon: "💰",
                title: "Earn",
                desc: "Redeem your points for real GHS via MTN Mobile Money, Vodafone Cash, or AirtelTigo Money. Minimum 500 points = GHS 5.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="relative bg-white/3 border border-white/8 rounded-2xl p-8 hover:border-[#38e07b]/30 transition-colors group"
              >
                <div className="absolute top-6 right-6 font-display text-5xl font-800 text-white/5 group-hover:text-[#38e07b]/10 transition-colors">
                  {step.number}
                </div>
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="font-display text-2xl font-700 text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-white/50 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Recent issues */}
      {/* ----------------------------------------------------------------- */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-700 text-white mb-2">
                Active issues
              </h2>
              <p className="text-white/50">
                Real problems reported by your community right now.
              </p>
            </div>
            <Link
              href="/issues"
              className="text-[#38e07b] text-sm font-medium hover:underline hidden md:block"
            >
              View all →
            </Link>
          </div>

          {loadingIssues ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white/5 rounded-2xl h-72 animate-pulse"
                />
              ))}
            </div>
          ) : issues.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-white/30">
              <div className="text-5xl mb-4">🌿</div>
              <p>No issues yet — your community is clean!</p>
            </div>
          )}

          <div className="text-center mt-10 md:hidden">
            <Link
              href="/issues"
              className="text-[#38e07b] text-sm font-medium hover:underline"
            >
              View all issues →
            </Link>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* CTA Banner */}
      {/* ----------------------------------------------------------------- */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-[#38e07b] rounded-3xl px-8 md:px-16 py-16 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, #0e1a13 0%, transparent 50%), radial-gradient(circle at 80% 50%, #0e1a13 0%, transparent 50%)",
            }}
          />
          <div className="relative z-10">
            <h2 className="font-display text-4xl md:text-5xl font-800 text-[#0e1a13] mb-4">
              Ready to make a difference?
            </h2>
            <p className="text-[#0e1a13]/70 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of Ghanaians already cleaning up their communities
              and earning real rewards.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-[#0e1a13] text-[#38e07b] font-display font-700 text-lg px-8 py-4 rounded-2xl hover:bg-[#0e1a13]/90 transition-all hover:scale-105 active:scale-95"
            >
              Create your account →
            </Link>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Footer */}
      {/* ----------------------------------------------------------------- */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display font-700 text-lg text-white">
            🌍 Tankas
          </div>
          <p className="text-white/30 text-sm">
            © 2026 Tankas · Made in Ghana 🇬🇭
          </p>
          <div className="flex gap-6 text-sm text-white/40">
            <Link href="/issues" className="hover:text-white transition-colors">
              Issues
            </Link>
            <Link
              href="/leaderboard"
              className="hover:text-white transition-colors"
            >
              Leaderboard
            </Link>
            <Link href="/signup" className="hover:text-white transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
