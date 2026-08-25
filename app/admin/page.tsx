"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AdminGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { StatTile } from "@/components/ui/stat-tile";
import { Icon } from "@/components/ui/icon";
import { adminApi } from "@/lib/api";

type Overview = {
  users: {
    total: number;
    new_this_week: number;
    by_badge_tier: Record<string, number>;
  };
  issues: { total: number; open: number; resolved: number; this_week: number };
  volunteers: { total_records: number };
  collections: { total: number; verified: number };
  points: { total_awarded: number };
  payments: { total_transactions: number; total_ghs_paid: number };
};

function AdminOverview() {
  const { data, isPending } = useQuery<Overview>({
    queryKey: ["admin-overview"],
    queryFn: () => adminApi.getOverview(),
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-4 lg:px-8 lg:py-7">
      <header>
        <h1 className="font-display text-[26px] font-bold text-ink">
          Admin overview
        </h1>
        <p className="text-xs text-ink-muted">Platform health at a glance.</p>
      </header>

      {isPending || !data ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="skeleton h-26" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile icon="users" value={data.users.total} label="Total users" />
            <StatTile
              icon="sparkles"
              value={data.users.new_this_week}
              label="New this week"
            />
            <StatTile icon="flag" value={data.issues.total} label="Total issues" />
            <StatTile icon="pin" value={data.issues.open} label="Open issues" />
            <StatTile
              icon="check"
              value={data.issues.resolved}
              label="Resolved"
            />
            <StatTile
              icon="package"
              value={data.collections.verified}
              label="Verified collections"
            />
            <StatTile
              icon="zap"
              value={data.points.total_awarded.toLocaleString()}
              label="Points awarded"
            />
            <StatTile
              icon="wallet"
              value={`GHS ${data.payments.total_ghs_paid.toFixed(0)}`}
              label="Paid out"
            />
          </div>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-4">
              <h2 className="mb-3 font-display text-[15px] font-semibold text-ink">
                Users by tier
              </h2>
              <div className="space-y-2.5">
                {Object.entries(data.users.by_badge_tier ?? {}).map(
                  ([tier, count]) => {
                    const pct = data.users.total
                      ? (count / data.users.total) * 100
                      : 0;
                    return (
                      <div key={tier} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="capitalize text-ink">{tier}</span>
                          <span className="numeric font-semibold text-ink-muted">
                            {count}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-surface p-4">
              <h2 className="font-display text-[15px] font-semibold text-ink">
                Jump to
              </h2>
              {[
                { href: "/admin/issues", icon: "flag", label: "Moderate issues" },
                { href: "/admin/users", icon: "users", label: "Manage users" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center gap-3 rounded-md bg-surface-2 px-3.5 py-3 transition-colors hover:bg-border"
                >
                  <Icon
                    name={l.icon as "flag" | "users"}
                    size={17}
                    className="text-ink"
                  />
                  <span className="flex-1 text-[13px] font-medium text-ink">
                    {l.label}
                  </span>
                  <Icon name="forward" size={15} className="text-ink-muted" />
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AppShell>
        <AdminOverview />
      </AppShell>
    </AdminGuard>
  );
}
