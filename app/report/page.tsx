"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/ui/icon";
import { issuesApi } from "@/lib/api";
import { PRIORITY, type Priority } from "@/lib/design";
import { cn } from "@/lib/utils";

const MAX_BYTES = 10 * 1024 * 1024; // Matches the API's 10 MB cap.
const PRIORITIES: Priority[] = ["low", "medium", "high"];

type GpsStatus = "idle" | "locating" | "ready" | "denied";

function ReportContent() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: string; lng: string }>({
    lat: "",
    lng: "",
  });
  const [gps, setGps] = useState<GpsStatus>("idle");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [submitting, setSubmitting] = useState(false);

  const pickPhoto = (file: File) => {
    if (file.size > MAX_BYTES) {
      toast.error("Image too large. Maximum size is 10 MB.");
      return;
    }
    setPhoto(file);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
  };

  const locate = () => {
    if (!navigator.geolocation) {
      setGps("denied");
      return;
    }
    setGps("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: String(pos.coords.latitude),
          lng: String(pos.coords.longitude),
        });
        setGps("ready");
      },
      () => setGps("denied"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) return toast.error("Add a photo of the issue.");
    if (!coords.lat || !coords.lng) return toast.error("Add a location.");

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("file", photo);
      fd.append("latitude", coords.lat);
      fd.append("longitude", coords.lng);
      fd.append("title", title);
      fd.append("description", description);
      fd.append("priority", priority);

      const issue = await issuesApi.create(fd);
      toast.success(
        issue?.points_assigned
          ? `Reported — worth ${issue.points_assigned} points once cleaned.`
          : "Issue reported. Thanks for flagging it.",
      );
      router.push("/dashboard");
    } catch (err) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Could not submit the report.";
      toast.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

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
          <Icon name="close" size={18} />
        </button>
        <h1 className="font-display text-xl font-bold text-ink">
          Report an issue
        </h1>
      </header>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => e.target.files?.[0] && pickPhoto(e.target.files[0])}
      />

      {preview ? (
        <div className="relative h-50 overflow-hidden rounded-lg bg-surface-2">
          <Image src={preview} alt="" fill className="object-cover" unoptimized />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="glass absolute bottom-3.5 left-3.5 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-ink"
          >
            <Icon name="camera" size={14} />
            Retake
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="flex h-50 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-surface transition-colors hover:border-primary-ink/50"
        >
          <Icon name="camera" size={28} className="text-primary-ink" />
          <span className="text-sm font-semibold text-ink">Take a photo</span>
          <span className="text-xs text-ink-muted">JPG or PNG, up to 10 MB</span>
        </button>
      )}

      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
        <span className="grid size-13 shrink-0 place-items-center rounded-sm bg-surface-2">
          <Icon name="pin" size={20} className="text-primary-ink" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-ink">
            {gps === "ready" ? "Location captured" : "Location required"}
          </p>
          <p className="truncate text-[11px] text-ink-muted">
            {gps === "ready"
              ? `${Number(coords.lat).toFixed(4)}, ${Number(coords.lng).toFixed(4)}`
              : gps === "denied"
                ? "Permission denied — enable location access"
                : "Uses your device GPS"}
          </p>
        </div>
        <button
          type="button"
          onClick={locate}
          disabled={gps === "locating"}
          className="shrink-0 rounded-full bg-primary-soft px-3 py-1.5 text-[11px] font-semibold text-primary-ink disabled:opacity-60"
        >
          {gps === "locating"
            ? "Locating…"
            : gps === "ready"
              ? "Update"
              : "Use GPS"}
        </button>
      </div>

      <Field label="TITLE">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Overflowing bins at Circle station"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
        />
      </Field>

      <Field label="DESCRIPTION">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Describe access, scale and what equipment is needed…"
          className="w-full resize-none bg-transparent text-sm leading-relaxed text-ink outline-none placeholder:text-ink-muted"
        />
      </Field>

      <fieldset className="space-y-2">
        <legend className="text-[11px] font-semibold tracking-[0.04em] text-ink-muted">
          PRIORITY
        </legend>
        <div className="flex gap-2">
          {PRIORITIES.map((p) => {
            const active = priority === p;
            return (
              <button
                key={p}
                type="button"
                aria-pressed={active}
                onClick={() => setPriority(p)}
                className={cn(
                  "flex-1 rounded-md border py-2.5 text-xs font-semibold capitalize transition-colors",
                  active
                    ? "border-primary bg-primary-soft text-primary-ink"
                    : "border-border bg-surface text-ink-muted hover:text-ink",
                )}
              >
                {PRIORITY[p].label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Difficulty and points are derived server-side from the photo analysis;
          a moderator can reclassify afterwards. */}
      <p className="flex items-start gap-2.5 rounded-md bg-surface-2 p-3 text-xs leading-relaxed text-ink-muted">
        <Icon name="scan" size={15} className="mt-px shrink-0" />
        Difficulty and points are set automatically from your photo, then
        confirmed by a moderator.
      </p>

      <button
        type="submit"
        disabled={submitting}
        className="flex h-13 w-full items-center justify-center gap-2 rounded-md bg-primary text-[15px] font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <Icon name="send" size={17} />
        {submitting ? "Submitting…" : "Submit report"}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold tracking-[0.04em] text-ink-muted">
        {label}
      </span>
      <span className="rounded-md border border-border bg-surface px-3.5 py-3.5">
        {children}
      </span>
    </label>
  );
}

export default function ReportPage() {
  return (
    <AuthGuard>
      <AppShell>
        <ReportContent />
      </AppShell>
    </AuthGuard>
  );
}
