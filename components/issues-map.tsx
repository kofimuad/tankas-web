"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import type { Issue } from "@/lib/api";
import { STATUS, type IssueStatus } from "@/lib/design";

/**
 * Leaflet touches `window` at import time, so this module must only ever be
 * loaded from the browser — callers pull it in via `next/dynamic` with
 * `ssr: false`.
 */

// Resolved from the stylesheet so pins follow the active theme.
function cssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

const STATUS_VAR: Record<string, string> = {
  open: "--status-open",
  pending_review: "--status-review",
  resolved: "--status-resolved",
  rejected: "--status-rejected",
};

/**
 * A `divIcon` rather than Leaflet's default PNG marker: the bundled icon URLs
 * break under bundlers, and this lets each pin carry its status colour.
 */
function pin(status: string) {
  const color = cssVar(STATUS_VAR[status] ?? "--status-open", "#0f9d4f");
  return L.divIcon({
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -24],
    html: `<span style="display:block;width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};box-shadow:0 2px 6px rgb(0 0 0 / .3);border:2px solid #fff"></span>`,
  });
}

function meIcon() {
  const color = cssVar("--primary", "#38e07b");
  return L.divIcon({
    className: "",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 0 0 4px ${color}55"></span>`,
  });
}

/** Keeps the viewport on the active centre when the user re-locates. */
function Recenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

export default function IssuesMap({
  center,
  issues,
  zoom = 13,
  className,
}: {
  center: [number, number];
  issues: Issue[];
  zoom?: number;
  className?: string;
}) {
  const markers = useMemo(
    () =>
      issues.filter(
        (i) => Number.isFinite(i.latitude) && Number.isFinite(i.longitude),
      ),
    [issues],
  );

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className={className}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter center={center} zoom={zoom} />

      <Marker position={center} icon={meIcon()} />

      {markers.map((issue) => {
        const swatch = STATUS[(issue.status as IssueStatus) ?? "open"];
        return (
          <Marker
            key={issue.id}
            position={[issue.latitude, issue.longitude]}
            icon={pin(issue.status)}
          >
            <Popup>
              <span className="block max-w-52 font-sans">
                <span className="block text-[13px] font-semibold text-neutral-900">
                  {issue.title}
                </span>
                <span className="mt-0.5 block text-[11px] text-neutral-500">
                  {swatch?.label ?? issue.status} · {issue.points_assigned} pts
                </span>
                <Link
                  href={`/issues/${issue.id}`}
                  className="mt-1.5 inline-block text-[11px] font-semibold text-emerald-700 underline"
                >
                  View issue
                </Link>
              </span>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
