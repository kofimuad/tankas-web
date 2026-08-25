"use client";

import { use, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/ui/icon";
import { collectionsApi, issuesApi, type Destination } from "@/lib/api";
import { cn } from "@/lib/utils";

const FALLBACK: [number, number] = [5.6037, -0.187];
// The API verifies the drop-off GPS fix against the depot; mirror that here so
// the user is warned before they submit rather than after it is rejected.
const IN_RANGE_METRES = 200;

function apiError(err: unknown, fallback: string) {
  return (
    (err as { response?: { data?: { detail?: string } } })?.response?.data
      ?.detail ?? fallback
  );
}

const STEPS = ["Start", "Collect", "Deliver"] as const;

function SubmitCollection({ issueId }: { issueId: string }) {
  const router = useRouter();
  const photoInput = useRef<HTMLInputElement>(null);

  const [started, setStarted] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [kg, setKg] = useState(5);
  const [notes, setNotes] = useState("");
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: issue } = useQuery({
    queryKey: ["issue", issueId],
    queryFn: () => issuesApi.getById(issueId),
  });

  const { data: destinations = [] } = useQuery({
    queryKey: ["destinations", coords?.[0], coords?.[1]],
    queryFn: () =>
      collectionsApi.getNearbyDestinations(
        coords?.[0] ?? FALLBACK[0],
        coords?.[1] ?? FALLBACK[1],
        20,
      ),
  });

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords([p.coords.latitude, p.coords.longitude]),
      () => undefined,
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const selected: Destination | undefined = destinations.find(
    (d) => d.id === destinationId,
  );

  const metresAway =
    selected && coords
      ? haversineKm(coords, [selected.latitude, selected.longitude]) * 1000
      : null;
  const inRange = metresAway !== null && metresAway <= IN_RANGE_METRES;

  const pickPhoto = (file: File) => {
    setPhoto(file);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
  };

  const start = async () => {
    setBusy(true);
    try {
      await collectionsApi.start(issueId);
      setStarted(true);
      toast.success("Collection started.");
    } catch (err) {
      toast.error(apiError(err, "Could not start this collection."));
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) return toast.error("Add a proof photo.");
    if (!destinationId) return toast.error("Pick a drop-off point.");

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("destination_id", destinationId);
      fd.append("photo", photo);
      fd.append("quantity_kg", String(kg));
      if (notes) fd.append("notes", notes);

      await collectionsApi.submit(issueId, fd);
      toast.success("Submitted for verification.");
      router.push("/collections");
    } catch (err) {
      toast.error(apiError(err, "Could not submit the collection."));
    } finally {
      setBusy(false);
    }
  };

  const stepIndex = started ? (photo ? 2 : 1) : 0;

  return (
    <form
      onSubmit={submit}
      className="mx-auto w-full max-w-2xl space-y-5 px-4 py-4 lg:px-8 lg:py-7"
    >
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="grid size-9.5 place-items-center rounded-full border border-border bg-surface text-ink"
        >
          <Icon name="back" size={18} />
        </button>
        <h1 className="font-display text-xl font-bold text-ink">
          Submit collection
        </h1>
      </header>

      <ol className="flex items-center">
        {STEPS.map((label, i) => (
          <li key={label} className="contents">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full",
                  i <= stepIndex
                    ? "bg-primary text-on-primary"
                    : "bg-surface-2 text-ink-muted",
                  i === stepIndex && "ring-[3px] ring-primary",
                )}
              >
                <Icon name={i < stepIndex ? "check" : "flag"} size={14} />
              </span>
              <span
                className={cn(
                  "text-[11px]",
                  i === stepIndex
                    ? "font-semibold text-ink"
                    : "text-ink-muted",
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  "mx-1 h-[3px] flex-1 rounded-full",
                  i < stepIndex ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </li>
        ))}
      </ol>

      {issue && (
        <div className="flex items-center gap-2.5 rounded-md border border-border bg-surface p-2.5">
          <span className="relative size-11 shrink-0 overflow-hidden rounded-sm bg-surface-2">
            {issue.picture_url && (
              <Image
                src={issue.picture_url}
                alt=""
                fill
                sizes="44px"
                className="object-cover"
              />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold text-ink">
              {issue.title}
            </span>
            <span className="block text-[11px] text-ink-muted">
              {issue.points_assigned} pts · {issue.status}
            </span>
          </span>
        </div>
      )}

      {!started ? (
        <button
          type="button"
          onClick={start}
          disabled={busy}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-md bg-primary text-[15px] font-semibold text-on-primary disabled:opacity-60"
        >
          <Icon name="recycle" size={18} />
          {busy ? "Starting…" : "Start collecting"}
        </button>
      ) : (
        <>
          <input
            ref={photoInput}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => e.target.files?.[0] && pickPhoto(e.target.files[0])}
          />

          {preview ? (
            <div className="relative h-42 overflow-hidden rounded-lg bg-surface-2">
              <Image
                src={preview}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => photoInput.current?.click()}
                className="glass absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-ink"
              >
                <Icon name="camera" size={13} />
                Retake
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => photoInput.current?.click()}
              className="flex h-42 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-surface"
            >
              <Icon name="camera" size={26} className="text-primary-ink" />
              <span className="text-sm font-semibold text-ink">
                Photograph what you collected
              </span>
            </button>
          )}

          <div className="space-y-2">
            <p className="text-[11px] font-semibold tracking-[0.04em] text-ink-muted">
              QUANTITY COLLECTED
            </p>
            <div className="flex items-center gap-3 rounded-md border border-border bg-surface px-3.5 py-3">
              <button
                type="button"
                onClick={() => setKg((v) => Math.max(0.5, +(v - 0.5).toFixed(1)))}
                aria-label="Decrease weight"
                className="grid size-9.5 shrink-0 place-items-center rounded-sm bg-surface-2 text-ink"
              >
                <Icon name="minus" size={16} />
              </button>
              <span className="flex flex-1 items-baseline justify-center gap-1.5">
                <span className="numeric text-3xl font-bold text-ink">{kg}</span>
                <span className="text-sm font-medium text-ink-muted">kg</span>
              </span>
              <button
                type="button"
                onClick={() => setKg((v) => +(v + 0.5).toFixed(1))}
                aria-label="Increase weight"
                className="grid size-9.5 shrink-0 place-items-center rounded-sm bg-primary-soft text-primary-ink"
              >
                <Icon name="plus" size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold tracking-[0.04em] text-ink-muted">
              DROP-OFF POINT
            </p>
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
              {destinations.length === 0 && (
                <p className="px-3.5 py-6 text-center text-xs text-ink-muted">
                  No depots found nearby.
                </p>
              )}
              {destinations.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDestinationId(d.id)}
                  className={cn(
                    "flex w-full items-center gap-3 border-b border-border px-3.5 py-3 text-left last:border-b-0 transition-colors",
                    destinationId === d.id && "bg-primary-soft",
                  )}
                >
                  <span className="grid size-9.5 shrink-0 place-items-center rounded-sm bg-surface-2">
                    <Icon name="warehouse" size={17} className="text-ink" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-ink">
                      {d.name}
                    </span>
                    <span className="block truncate text-[11px] text-ink-muted">
                      {d.address}
                    </span>
                  </span>
                  {destinationId === d.id && (
                    <Icon
                      name="check"
                      size={17}
                      className="shrink-0 text-primary-ink"
                    />
                  )}
                </button>
              ))}
            </div>

            {selected && metresAway !== null && (
              <p
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2.5 text-xs font-semibold",
                  inRange
                    ? "bg-primary-soft text-primary-ink"
                    : "bg-status-review/10 text-status-review",
                )}
              >
                <Icon name={inRange ? "check" : "info"} size={15} />
                {inRange
                  ? `You are ${Math.round(metresAway)} m away — within range`
                  : `You are ${(metresAway / 1000).toFixed(1)} km away — go to the depot to submit`}
              </p>
            )}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold tracking-[0.04em] text-ink-muted">
              NOTES (OPTIONAL)
            </span>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything the depot should know…"
              className="resize-none rounded-md border border-border bg-surface px-3.5 py-3 text-sm text-ink outline-none placeholder:text-ink-muted"
            />
          </label>

          <button
            type="submit"
            disabled={busy || !photo || !destinationId}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-md bg-primary text-[15px] font-semibold text-on-primary disabled:opacity-50"
          >
            <Icon name="delivery" size={18} />
            {busy ? "Submitting…" : "Submit for verification"}
          </button>
        </>
      )}
    </form>
  );
}

function haversineKm(
  [lat1, lon1]: [number, number],
  [lat2, lon2]: [number, number],
) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export default function CollectionSubmitPage({
  params,
}: {
  params: Promise<{ issueId: string }>;
}) {
  const { issueId } = use(params);
  return (
    <AuthGuard>
      <AppShell>
        <SubmitCollection issueId={issueId} />
      </AppShell>
    </AuthGuard>
  );
}
