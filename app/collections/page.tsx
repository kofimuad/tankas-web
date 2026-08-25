"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { StatTile } from "@/components/ui/stat-tile";
import { Icon } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import {
  collectionsApi,
  type CollectorStats,
  type Destination,
} from "@/lib/api";
import { formatKg } from "@/lib/design";

const FALLBACK: [number, number] = [5.6037, -0.187];

function CollectionsContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CollectorStats | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    collectionsApi
      .getCollectorStats(user.id)
      .then(setStats)
      .catch(() => setStats(null));

    const load = (lat: number, lng: number) =>
      collectionsApi
        .getNearbyDestinations(lat, lng, 15)
        .then(setDestinations)
        .catch(() => setDestinations([]))
        .finally(() => setLoading(false));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => load(p.coords.latitude, p.coords.longitude),
        () => load(...FALLBACK),
      );
    } else {
      load(...FALLBACK);
    }
  }, [user]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-4 lg:px-8 lg:py-7">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold text-ink">
            Collections
          </h1>
          <p className="text-xs text-ink-muted">
            Take collected waste to a registered depot to earn points.
          </p>
        </div>
        <div className="lg:hidden">
          <ThemeToggle />
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <StatTile
          icon="package"
          value={stats?.total_collections ?? 0}
          label="Collections"
        />
        <StatTile
          icon="check"
          value={stats?.verified_collections ?? 0}
          label="Verified"
        />
        <StatTile
          icon="scale"
          value={formatKg(stats?.total_kg_collected ?? 0)}
          label="Kg total"
        />
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-[17px] font-semibold text-ink">
          Drop-off points near you
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="skeleton h-20" />
            ))}
          </div>
        ) : destinations.length ? (
          destinations.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3.5"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-md bg-surface-2">
                <Icon name="warehouse" size={19} className="text-ink" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">
                  {d.name}
                </p>
                <p className="truncate text-[11px] text-ink-muted">
                  {d.address}
                </p>
                {d.operating_hours && (
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-muted">
                    <Icon name="clock" size={11} />
                    {d.operating_hours}
                  </p>
                )}
              </div>
              {d.distance_km !== undefined && (
                <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary-ink">
                  {d.distance_km.toFixed(1)} km
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface px-6 py-12 text-center">
            <Icon name="warehouse" size={26} className="text-ink-muted" />
            <p className="text-sm text-ink-muted">
              No registered drop-off points within 15 km.
            </p>
          </div>
        )}
      </section>

      <section className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
        <Icon name="recycle" size={20} className="mt-0.5 shrink-0 text-primary-ink" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-ink">
            Start a collection from an issue
          </p>
          <p className="text-xs leading-relaxed text-ink-muted">
            Open a cleanup you&apos;ve joined, start collecting, then submit the
            weight and a proof photo at the depot. Your GPS fix is checked
            against the depot location before the collection is verified.
          </p>
          <Link
            href="/issues"
            className="inline-flex items-center gap-1 pt-1 text-xs font-semibold text-primary-ink"
          >
            Browse issues
            <Icon name="forward" size={13} />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <CollectionsContent />
      </AppShell>
    </AuthGuard>
  );
}
