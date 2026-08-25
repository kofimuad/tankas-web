"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { TierHero } from "@/components/tier-hero";
import { IssueCard } from "@/components/issue-card";
import { StatTile } from "@/components/ui/stat-tile";
import { Icon } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { TIER, formatKg, tierForPoints } from "@/lib/design";
import {
  issuesApi,
  leaderboardApi,
  profileApi,
  type DashboardStats,
  type Issue,
} from "@/lib/api";
import { cn } from "@/lib/utils";

// Accra city centre — used when the browser denies or lacks geolocation.
const FALLBACK_COORDS = { lat: 5.6037, lng: -0.187 };

type RankRow = {
  rank: number;
  username: string;
  display_name?: string | null;
  metric_value: number;
};

function DashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [nearby, setNearby] = useState<Issue[]>([]);
  const [rankings, setRankings] = useState<RankRow[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Counters load independently of the map data: a failure in one should not
    // blank the other.
    profileApi
      .getDashboard()
      .then((d) => setStats(d?.stats ?? null))
      .catch(() => setStats(null));

    leaderboardApi
      .get("points", "global")
      .then((d) => setRankings((d?.rankings ?? []).slice(0, 4)))
      .catch(() => setRankings([]));

    const load = async (lat: number, lng: number) => {
      try {
        const [issues, rankData] = await Promise.all([
          issuesApi.getNearby(lat, lng, 20),
          leaderboardApi.getUserRank(user.id, "points"),
        ]);
        setNearby(issues.slice(0, 4));
        setRank(rankData?.rank ?? null);
      } catch {
        // Leave the empty state in place.
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => load(pos.coords.latitude, pos.coords.longitude),
        () => load(FALLBACK_COORDS.lat, FALLBACK_COORDS.lng),
      );
    } else {
      load(FALLBACK_COORDS.lat, FALLBACK_COORDS.lng);
    }
  }, [user]);

  if (!user) return null;

  const name = user.display_name || user.username;
  const tier = tierForPoints(user.total_points);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-4 lg:px-8 lg:py-7">
      {/* Mobile identity header. On desktop the topbar carries these actions. */}
      <header className="flex items-center gap-3 lg:hidden">
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-full bg-surface-2 font-display text-[15px] font-bold text-primary-ink ring-2",
            TIER[tier].ring,
          )}
        >
          {initials(name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-ink-muted">{greeting()}</p>
          <p className="truncate font-display text-lg font-bold text-ink">
            {name}
          </p>
        </div>
        <ThemeToggle />
        <button
          type="button"
          aria-label="Notifications"
          className="grid size-10 place-items-center rounded-full border border-border bg-surface text-ink"
        >
          <Icon name="bell" size={18} />
        </button>
      </header>

      <header className="hidden items-center justify-between lg:flex">
        <div>
          <h1 className="font-display text-[28px] font-bold text-ink">
            {greeting()}, {name.split(" ")[0]}
          </h1>
          <p className="text-[13px] text-ink-muted">
            {nearby.length} open issues near you
            {stats?.volunteer_streak
              ? ` · ${stats.volunteer_streak} day volunteer streak`
              : ""}
          </p>
        </div>
        {rank && (
          <span className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-xs">
            <Icon name="trophy" size={16} className={TIER[tier].text} />
            <span className="font-semibold text-ink">Rank #{rank}</span>
            <span className="text-ink-muted">points</span>
          </span>
        )}
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="lg:hidden">
            <TierHero points={user.total_points} />
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              icon="flag"
              value={stats?.issues_reported ?? 0}
              label="Issues reported"
            />
            <StatTile
              icon="check"
              value={stats?.tasks_completed ?? 0}
              label="Tasks done"
            />
            <StatTile
              icon="leaf"
              value={stats?.areas_cleaned ?? 0}
              label="Areas cleaned"
            />
            <StatTile
              icon="scale"
              value={formatKg(stats?.total_kg_collected ?? 0)}
              label="Kg collected"
            />
            <StatTile
              icon="clock"
              value={stats?.volunteer_hours ?? 0}
              label="Volunteer hrs"
            />
            <StatTile
              icon="flame"
              value={stats?.volunteer_streak ?? 0}
              label="Day streak"
            />
            <StatTile
              icon="medal"
              value={stats?.badges_earned ?? 0}
              label="Badges"
            />
            <StatTile
              icon="zap"
              value={user.total_points.toLocaleString()}
              label="Total points"
            />
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[17px] font-semibold text-ink lg:text-lg">
                Nearby issues
              </h2>
              <Link
                href="/issues"
                className="flex items-center gap-1 text-xs font-semibold text-primary-ink"
              >
                See all
                <Icon name="forward" size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[0, 1].map((i) => (
                  <div key={i} className="skeleton h-64" />
                ))}
              </div>
            ) : nearby.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {nearby.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <div className="hidden lg:block">
            <TierHero points={user.total_points} />
          </div>

          {rankings.length > 0 && (
            <section className="overflow-hidden rounded-lg border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-3.5 py-3.5">
                <h2 className="font-display text-[15px] font-semibold text-ink">
                  Top warriors
                </h2>
                <Link href="/leaderboard" className="text-[11px] text-ink-muted">
                  This week
                </Link>
              </div>
              {rankings.map((row) => (
                <div
                  key={row.rank}
                  className="flex items-center gap-2.5 border-b border-border px-3.5 py-2.5 last:border-b-0"
                >
                  <span className="numeric w-4 text-xs font-bold text-ink-muted">
                    {row.rank}
                  </span>
                  <span className="grid size-7 place-items-center rounded-full bg-surface-2 text-[10px] font-semibold text-ink-muted">
                    {initials(row.display_name || row.username)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink">
                    {row.display_name || row.username}
                  </span>
                  <span className="numeric text-[13px] font-bold text-ink">
                    {Math.round(row.metric_value).toLocaleString()}
                  </span>
                </div>
              ))}
            </section>
          )}

          {!user.email_verified && (
            <Link
              href={`/verify-email?email=${encodeURIComponent(user.email)}`}
              className="flex items-center gap-3 rounded-lg border border-status-review/30 bg-status-review/10 p-3.5"
            >
              <Icon
                name="info"
                size={18}
                className="shrink-0 text-status-review"
              />
              <span className="flex-1 text-xs text-status-review">
                Verify your email to unlock redemptions.
              </span>
              <Icon name="forward" size={14} className="text-status-review" />
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface px-6 py-12 text-center">
      <Icon name="leaf" size={28} className="text-primary-ink" />
      <p className="text-sm text-ink-muted">
        No open issues nearby — your area is clean.
      </p>
      <Link href="/issues" className="text-xs font-semibold text-primary-ink">
        Browse all issues
      </Link>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <AppShell>
        <DashboardContent />
      </AppShell>
    </AuthGuard>
  );
}
