"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { Icon, type IconName } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import { profileApi, type DashboardStats } from "@/lib/api";
import {
  TIER,
  formatKg,
  nextTierLabel,
  pointsToNextTier,
  tierForPoints,
} from "@/lib/design";
import { cn } from "@/lib/utils";

const MENU: { href: string; icon: IconName; label: string }[] = [
  { href: "/collections", icon: "package", label: "My collections" },
  { href: "/redeem", icon: "wallet", label: "Wallet & rewards" },
  { href: "/leaderboard", icon: "trophy", label: "My rankings" },
];

function ProfileContent() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    profileApi
      .getDashboard()
      .then((d) => setStats(d?.stats ?? null))
      .catch(() => setStats(null));
  }, []);

  if (!user) return null;

  const name = user.display_name || user.username;
  const tier = tierForPoints(user.total_points);
  const remaining = pointsToNextTier(user.total_points);
  const next = nextTierLabel(user.total_points);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-4 lg:px-8 lg:py-7">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-[26px] font-bold text-ink">Profile</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Settings"
            className="grid size-10 place-items-center rounded-full border border-border bg-surface text-ink"
          >
            <Icon name="settings" size={18} />
          </button>
        </div>
      </header>

      <section className="flex flex-col items-center gap-2.5">
        <span
          className={cn(
            "grid size-21 place-items-center rounded-full bg-surface-2 font-display text-[28px] font-bold text-ink-muted ring-[3px]",
            TIER[tier].ring,
          )}
        >
          {initials(name)}
        </span>
        <h2 className="font-display text-xl font-bold text-ink">{name}</h2>
        <p className="text-xs text-ink-muted">
          @{user.username} · joined{" "}
          {new Date(user.created_at).toLocaleDateString(undefined, {
            month: "short",
            year: "numeric",
          })}
        </p>
        <span className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5">
          <Icon name="medal" size={14} className={TIER[tier].text} />
          <span className="text-xs font-semibold text-ink">
            {TIER[tier].label} tier
            {remaining && next ? ` · ${remaining} to ${next}` : ""}
          </span>
        </span>
      </section>

      <section className="flex overflow-hidden rounded-lg border border-border bg-surface">
        {[
          { value: user.total_points.toLocaleString(), label: "POINTS" },
          { value: formatKg(stats?.total_kg_collected ?? 0), label: "KG" },
          { value: stats?.volunteer_streak ?? 0, label: "STREAK" },
        ].map((s, i) => (
          <div
            key={s.label}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-3.5",
              i < 2 && "border-r border-border",
            )}
          >
            <span className="numeric text-xl font-bold text-ink">{s.value}</span>
            <span className="text-[10px] font-medium tracking-[0.05em] text-ink-muted">
              {s.label}
            </span>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-surface">
        {MENU.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 border-b border-border px-3.5 py-3.5 transition-colors last:border-b-0 hover:bg-surface-2"
          >
            <Icon name={item.icon} size={18} className="text-ink" />
            <span className="flex-1 text-sm font-medium text-ink">
              {item.label}
            </span>
            <Icon name="forward" size={16} className="text-ink-muted" />
          </Link>
        ))}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 border-t border-border px-3.5 py-3.5 text-left transition-colors hover:bg-surface-2"
        >
          <Icon name="logout" size={18} className="text-danger" />
          <span className="flex-1 text-sm font-medium text-danger">Log out</span>
        </button>
      </section>
    </div>
  );
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

export default function ProfilePage() {
  return (
    <AuthGuard>
      <AppShell>
        <ProfileContent />
      </AppShell>
    </AuthGuard>
  );
}
