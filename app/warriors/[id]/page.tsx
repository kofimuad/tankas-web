"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { StatTile } from "@/components/ui/stat-tile";
import { Icon } from "@/components/ui/icon";
import { publicApi } from "@/lib/api";
import { TIER, formatKg } from "@/lib/design";
import { cn } from "@/lib/utils";

function WarriorProfile({ userId }: { userId: string }) {
  const router = useRouter();

  const { data: warrior, isPending, isError } = useQuery({
    queryKey: ["warrior", userId],
    queryFn: () => publicApi.getWarrior(userId),
  });

  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4 p-4">
        <div className="skeleton h-40" />
        <div className="skeleton h-28" />
      </div>
    );
  }

  if (isError || !warrior) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-4 py-20 text-center">
        <Icon name="user" size={28} className="text-ink-muted" />
        <p className="text-sm text-ink-muted">That warrior could not be found.</p>
        <button
          onClick={() => router.push("/warriors")}
          className="text-xs font-semibold text-primary-ink"
        >
          Back to warriors
        </button>
      </div>
    );
  }

  const name = warrior.display_name || warrior.username;
  const tier = warrior.badge_tier ?? "bronze";

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-4 lg:px-8 lg:py-7">
      <button
        onClick={() => router.back()}
        aria-label="Go back"
        className="grid size-9.5 place-items-center rounded-full border border-border bg-surface text-ink"
      >
        <Icon name="back" size={18} />
      </button>

      <section className="flex flex-col items-center gap-2.5">
        <span
          className={cn(
            "grid size-21 place-items-center rounded-full bg-surface-2 font-display text-[28px] font-bold text-ink-muted ring-[3px]",
            TIER[tier]?.ring ?? TIER.bronze.ring,
          )}
        >
          {initials(name)}
        </span>
        <h1 className="font-display text-xl font-bold text-ink">{name}</h1>
        <p className="text-xs text-ink-muted">
          @{warrior.username} · rank #{warrior.rank}
        </p>
        <span className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5">
          <Icon name="medal" size={14} className={TIER[tier]?.text} />
          <span className="text-xs font-semibold text-ink">
            {TIER[tier]?.label ?? "Bronze"} tier ·{" "}
            {warrior.total_points.toLocaleString()} pts
          </span>
        </span>
      </section>

      <div className="grid grid-cols-3 gap-3">
        <StatTile
          icon="flag"
          value={warrior.issues_reported}
          label="Reported"
        />
        <StatTile
          icon="check"
          value={warrior.tasks_completed}
          label="Cleanups"
        />
        <StatTile
          icon="scale"
          value={formatKg(warrior.total_kg_collected)}
          label="Kg"
        />
      </div>
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

export default function WarriorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AppShell>
      <WarriorProfile userId={id} />
    </AppShell>
  );
}
