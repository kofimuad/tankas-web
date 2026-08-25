"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { IssueCard } from "@/components/issue-card";
import { Icon } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { issuesApi } from "@/lib/api";
import { cn } from "@/lib/utils";

// Leaflet reads `window` on import, so the map is client-only.
const IssuesMap = dynamic(() => import("@/components/issues-map"), {
  ssr: false,
  loading: () => <div className="skeleton size-full rounded-none" />,
});

const FALLBACK: [number, number] = [5.6037, -0.187]; // Accra city centre.
// Starts wide: a 5 km default around the city centre misses reports in the
// outer suburbs entirely when geolocation is unavailable.
const RADII = [5, 10, 25, 50] as const;

function MapContent() {
  const [center, setCenter] = useState<[number, number]>(FALLBACK);
  const [located, setLocated] = useState(false);
  const [radius, setRadius] = useState<number>(25);

  const locate = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
        setLocated(true);
      },
      () => setLocated(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  useEffect(() => {
    locate();
  }, [locate]);

  const { data: issues = [], isPending: loading } = useQuery({
    queryKey: ["nearby-issues", center[0], center[1], radius],
    queryFn: () => issuesApi.getNearby(center[0], center[1], radius),
    // Keep the previous pins on screen while a wider radius loads.
    placeholderData: (prev) => prev,
  });

  // Straight-line distance, only for ordering and the "x km away" label.
  const withDistance = useMemo(
    () =>
      issues
        .map((issue) => ({
          issue,
          km: haversineKm(center, [issue.latitude, issue.longitude]),
        }))
        .sort((a, b) => a.km - b.km),
    [issues, center],
  );

  return (
    <div className="flex flex-col lg:h-[calc(100vh-68px)] lg:flex-row">
      <div className="relative h-[45vh] shrink-0 lg:h-full lg:flex-1">
        <IssuesMap center={center} issues={issues} zoom={zoomFor(radius)} />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex items-start justify-between gap-2 p-3">
          <div className="pointer-events-auto flex gap-1.5 rounded-full border border-border bg-surface/95 p-1 backdrop-blur">
            {RADII.map((r) => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                aria-pressed={radius === r}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors",
                  radius === r
                    ? "bg-primary text-on-primary"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                {r} km
              </button>
            ))}
          </div>

          <button
            onClick={locate}
            aria-label="Center on my location"
            className="pointer-events-auto grid size-10 place-items-center rounded-full border border-border bg-surface/95 text-ink backdrop-blur"
          >
            <Icon name="pin" size={18} />
          </button>
        </div>
      </div>

      <aside className="flex min-h-0 flex-col gap-3 border-border p-4 lg:w-96 lg:overflow-y-auto lg:border-l lg:p-5">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-lg font-bold text-ink">
              Issues near you
            </h1>
            <p className="text-xs text-ink-muted">
              {loading
                ? "Searching…"
                : `${issues.length} within ${radius} km`}
              {!located && " · using Accra as your location"}
            </p>
          </div>
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
        </header>

        {loading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="skeleton h-64" />
            ))}
          </div>
        ) : withDistance.length ? (
          <div className="space-y-3">
            {withDistance.map(({ issue, km }) => (
              <IssueCard key={issue.id} issue={issue} distanceKm={km} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface px-6 py-12 text-center">
            <Icon name="leaf" size={26} className="text-primary-ink" />
            <p className="text-sm text-ink-muted">
              Nothing reported within {radius} km.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

function zoomFor(radiusKm: number) {
  if (radiusKm <= 5) return 13;
  if (radiusKm <= 10) return 12;
  if (radiusKm <= 25) return 11;
  return 10;
}

function haversineKm([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export default function MapPage() {
  return (
    <AuthGuard>
      <AppShell>
        <MapContent />
      </AppShell>
    </AuthGuard>
  );
}
