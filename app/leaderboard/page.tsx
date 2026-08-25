"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import { leaderboardApi } from "@/lib/api";
import { TIER, tierForPoints, type Tier } from "@/lib/design";
import { cn } from "@/lib/utils";

// The five boards the API exposes (`leaderboard_service.py`).
const TABS = [
  { key: "points", label: "Points" },
  { key: "issues_reported", label: "Issues" },
  { key: "collections", label: "Collections" },
  { key: "kg_collected", label: "Kg" },
  { key: "volunteer_hours", label: "Hours" },
] as const;

type Row = {
  rank: number;
  user_id: string;
  username: string;
  display_name?: string | null;
  metric_value: number;
  badge_tier?: Tier | null;
};

function LeaderboardContent() {
  const { user } = useAuth();
  const [tab, setTab] = useState<string>("points");

  const { data: rows = [], isPending: loading } = useQuery({
    queryKey: ["leaderboard", tab],
    queryFn: async (): Promise<Row[]> => {
      const d = await leaderboardApi.get(tab);
      return d?.rankings ?? [];
    },
  });

  const format = (v: number) => {
    if (tab === "kg_collected") return `${v.toFixed(1)} kg`;
    if (tab === "volunteer_hours") return `${v.toFixed(1)}h`;
    return Math.round(v).toLocaleString();
  };

  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);
  // Podium reads 2nd–1st–3rd so the winner sits centre and tallest.
  const order = [1, 0, 2];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-4 lg:px-8 lg:py-7">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold text-ink">
            Leaderboards
          </h1>
          <p className="text-xs text-ink-muted">Top warriors this week</p>
        </div>
        <div className="lg:hidden">
          <ThemeToggle />
        </div>
      </header>

      <div
        role="tablist"
        aria-label="Leaderboard metric"
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-xs transition-colors",
                active
                  ? "bg-primary font-semibold text-on-primary"
                  : "border border-border bg-surface font-medium text-ink-muted hover:text-ink",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-50" />
          <div className="skeleton h-64" />
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface px-6 py-16 text-center">
          <Icon name="trophy" size={28} className="text-ink-muted" />
          <p className="text-sm text-ink-muted">
            No rankings for this board yet.
          </p>
        </div>
      ) : (
        <>
          {podium.length === 3 && (
            <div className="flex items-end justify-center gap-2.5">
              {order.map((idx) => {
                const row = podium[idx];
                const first = idx === 0;
                const tier = row.badge_tier ?? tierForPoints(row.metric_value);
                const height = first ? "h-29" : idx === 1 ? "h-23" : "h-19";
                return (
                  <div
                    key={row.user_id}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <span
                      className={cn(
                        "grid place-items-center rounded-full bg-surface-2 font-display font-bold text-ink-muted ring-[3px]",
                        first ? "size-14 text-[17px]" : "size-11.5 text-sm",
                        TIER[tier]?.ring ?? TIER.bronze.ring,
                      )}
                    >
                      {initials(row.display_name || row.username)}
                    </span>
                    <span className="w-full truncate text-center text-[11px] font-semibold text-ink">
                      {row.display_name || row.username}
                    </span>
                    <div
                      className={cn(
                        "flex w-full flex-col items-center justify-center gap-0.5 rounded-t-[10px]",
                        height,
                        first ? "bg-primary" : "bg-surface-2",
                      )}
                    >
                      <span
                        className={cn(
                          "numeric text-xl font-bold",
                          first ? "text-on-primary" : "text-ink-muted",
                        )}
                      >
                        {row.rank}
                      </span>
                      <span
                        className={cn(
                          "text-[11px] font-semibold",
                          first ? "text-on-primary/75" : "text-ink-muted",
                        )}
                      >
                        {format(row.metric_value)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            {(podium.length === 3 ? rest : rows).map((row) => {
              const me = row.user_id === user?.id;
              return (
                <div
                  key={row.user_id}
                  className={cn(
                    "flex items-center gap-3 border-b border-border px-3.5 py-2.5 last:border-b-0",
                    me && "bg-primary-soft",
                  )}
                >
                  <span
                    className={cn(
                      "numeric w-5 text-[13px] font-bold",
                      me ? "text-primary-ink" : "text-ink-muted",
                    )}
                  >
                    {row.rank}
                  </span>
                  <span
                    className={cn(
                      "grid size-8 place-items-center rounded-full text-[11px] font-semibold",
                      me
                        ? "bg-primary text-on-primary"
                        : "bg-surface-2 text-ink-muted",
                    )}
                  >
                    {initials(row.display_name || row.username)}
                  </span>
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-[13px] text-ink",
                      me ? "font-bold" : "font-medium",
                    )}
                  >
                    {me ? "You" : row.display_name || row.username}
                  </span>
                  <span
                    className={cn(
                      "numeric text-sm font-bold",
                      me ? "text-primary-ink" : "text-ink",
                    )}
                  >
                    {format(row.metric_value)}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
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

export default function LeaderboardPage() {
  return (
    <AuthGuard>
      <AppShell>
        <LeaderboardContent />
      </AppShell>
    </AuthGuard>
  );
}
