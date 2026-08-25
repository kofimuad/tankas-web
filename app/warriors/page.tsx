"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { publicApi } from "@/lib/api";
import { TIER, formatKg } from "@/lib/design";
import { cn } from "@/lib/utils";

/** Public directory — readable signed out, so no AuthGuard here. */
function WarriorsContent() {
  const [search, setSearch] = useState("");

  const { data: warriors = [], isPending } = useQuery({
    queryKey: ["warriors"],
    queryFn: () => publicApi.getWarriors(60),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return warriors;
    return warriors.filter(
      (w) =>
        w.username.toLowerCase().includes(q) ||
        (w.display_name ?? "").toLowerCase().includes(q),
    );
  }, [warriors, search]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-4 lg:px-8 lg:py-7">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold text-ink">
            Warriors
          </h1>
          <p className="text-xs text-ink-muted">
            Everyone keeping their city clean.
          </p>
        </div>
        <div className="lg:hidden">
          <ThemeToggle />
        </div>
      </header>

      <label className="flex items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-3">
        <Icon name="search" size={17} className="shrink-0 text-ink-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search warriors…"
          className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
        />
      </label>

      {isPending ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-18" />
          ))}
        </div>
      ) : filtered.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((w) => (
            <Link
              key={w.user_id}
              href={`/warriors/${w.user_id}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3.5 transition-colors hover:border-primary-ink/40"
            >
              <span className="numeric w-6 shrink-0 text-xs font-bold text-ink-muted">
                {w.rank}
              </span>
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 font-display text-xs font-bold text-ink-muted ring-2",
                  TIER[w.badge_tier]?.ring ?? TIER.bronze.ring,
                )}
              >
                {initials(w.display_name || w.username)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink">
                  {w.display_name || w.username}
                </span>
                <span className="block text-[11px] text-ink-muted">
                  {w.issues_reported} reported · {formatKg(w.total_kg_collected)}{" "}
                  kg
                </span>
              </span>
              <span className="numeric shrink-0 text-sm font-bold text-primary-ink">
                {w.total_points.toLocaleString()}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface px-6 py-14 text-center">
          <Icon name="users" size={26} className="text-ink-muted" />
          <p className="text-sm text-ink-muted">No warriors match that search.</p>
        </div>
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

export default function WarriorsPage() {
  return (
    <AppShell>
      <WarriorsContent />
    </AppShell>
  );
}
