"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { AuthGuard } from "@/components/auth-guard";
import { AppNavbar } from "@/components/app-navbar";
import { BottomNav } from "@/components/bottom-nav";
import { BadgeTier } from "@/components/badge-tier";
import { IssueCard } from "@/components/issue-card";
import { issuesApi, leaderboardApi, Issue } from "@/lib/api";

function StatsCard({
  label,
  value,
  icon,
  sub,
}: {
  label: string;
  value: string | number;
  icon: string;
  sub?: string;
}) {
  return (
    <div className="bg-white/4 border border-white/8 rounded-2xl p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-white/40 text-sm">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="font-display text-3xl font-700 text-white">{value}</p>
      {sub && <p className="text-white/30 text-xs">{sub}</p>}
    </div>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [nearbyIssues, setNearbyIssues] = useState<Issue[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Load nearby issues using default Accra coords if no geolocation
    const loadData = async (lat = 5.6037, lng = -0.187) => {
      try {
        const [issues, rankData] = await Promise.all([
          issuesApi.getNearby(lat, lng, 20),
          leaderboardApi.getUserRank(user.id, "points"),
        ]);
        setNearbyIssues(issues.slice(0, 6));
        setRank(rankData?.rank ?? null);
      } catch {
        // fallback silently
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => loadData(pos.coords.latitude, pos.coords.longitude),
        () => loadData(),
      );
    } else {
      loadData();
    }
  }, [user]);

  if (!user) return null;

  const pointsToNext =
    user.badge_tier === "bronze"
      ? 100 - user.total_points
      : user.badge_tier === "silver"
        ? 500 - user.total_points
        : null;

  const progressPct =
    user.badge_tier === "bronze"
      ? Math.min((user.total_points / 100) * 100, 100)
      : user.badge_tier === "silver"
        ? Math.min(((user.total_points - 100) / 400) * 100, 100)
        : 100;

  return (
    <div className="min-h-screen bg-[#0e1a13] pb-24 md:pb-8">
      <AppNavbar />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-8">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-[#38e07b]/15 to-transparent border border-[#38e07b]/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-700 text-white mb-1">
              Hey, {user.display_name || user.username}! 👋
            </h1>
            <div className="flex items-center gap-3">
              <BadgeTier tier={user.badge_tier} size="sm" />
              {pointsToNext !== null && pointsToNext > 0 && (
                <span className="text-white/40 text-sm">
                  {pointsToNext} pts to next tier
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-3 w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#38e07b] rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <Link
            href="/report"
            className="self-start md:self-auto bg-[#38e07b] text-[#0e1a13] font-display font-700 px-6 py-3 rounded-xl hover:bg-[#38e07b]/90 transition-all hover:scale-105 active:scale-95 text-sm"
          >
            + Report Issue
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            label="Total Points"
            value={user.total_points.toLocaleString()}
            icon="⭐"
            sub="Lifetime earnings"
          />
          <StatsCard
            label="Issues Reported"
            value={user.issues_reported ?? 0}
            icon="📸"
            sub="+15 pts each"
          />
          <StatsCard
            label="Tasks Completed"
            value={user.tasks_completed ?? 0}
            icon="✅"
            sub="Cleanups done"
          />
          <StatsCard
            label="Community Rank"
            value={rank ? `#${rank}` : "—"}
            icon="🏆"
            sub="Points leaderboard"
          />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              href: "/report",
              icon: "📸",
              label: "Report Issue",
              color: "border-[#38e07b]/30 hover:border-[#38e07b]/60",
            },
            {
              href: "/issues",
              icon: "🗺️",
              label: "Find Issues",
              color: "border-white/10 hover:border-white/20",
            },
            {
              href: "/redeem",
              icon: "💰",
              label: "Redeem Points",
              color: "border-yellow-500/30 hover:border-yellow-500/50",
            },
            {
              href: "/leaderboard",
              icon: "🏆",
              label: "Leaderboard",
              color: "border-white/10 hover:border-white/20",
            },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <div
                className={`bg-white/4 border ${action.color} rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:bg-white/6 cursor-pointer`}
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-white/70 text-xs font-medium text-center">
                  {action.label}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Nearby issues */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-700 text-white">
              Nearby Issues
            </h2>
            <Link
              href="/issues"
              className="text-[#38e07b] text-sm hover:underline"
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white/4 rounded-2xl h-52 animate-pulse"
                />
              ))}
            </div>
          ) : nearbyIssues.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {nearbyIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} compact />
              ))}
            </div>
          ) : (
            <div className="bg-white/4 border border-white/8 rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">🌿</div>
              <p className="text-white/40">
                No open issues nearby — your area is clean!
              </p>
              <Link
                href="/issues"
                className="text-[#38e07b] text-sm mt-2 inline-block hover:underline"
              >
                Browse all issues →
              </Link>
            </div>
          )}
        </div>

        {/* Email verification banner */}
        {!user.email_verified && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-yellow-300 text-sm">
                Your email isn&apos;t verified yet. Check your inbox for the
                verification code.
              </p>
            </div>
            <Link
              href={`/verify-email?email=${encodeURIComponent(user.email)}`}
              className="text-yellow-300 text-sm font-600 hover:underline whitespace-nowrap"
            >
              Verify →
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
