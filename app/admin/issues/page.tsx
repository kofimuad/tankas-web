"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/ui/icon";
import { ImageLightbox } from "@/components/image-lightbox";
import { adminApi } from "@/lib/api";
import {
  DIFFICULTY,
  PRIORITY,
  type Difficulty,
  type Priority,
} from "@/lib/design";
import { cn } from "@/lib/utils";

type PendingIssue = {
  id: string;
  title: string;
  description: string | null;
  picture_url: string | null;
  difficulty: Difficulty | null;
  priority: Priority | null;
  points_assigned: number;
  ai_labels?: string[];
  ai_confidence_score?: number;
  created_at: string;
};

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
const PRIORITIES: Priority[] = ["low", "medium", "high"];

// Mirrors PointsCalculator on the API so the moderator sees the award before
// committing the classification.
const BASE = { easy: 10, medium: 20, hard: 30 };
const MULT = { low: 1, medium: 1.5, high: 2 };
const previewPoints = (d: Difficulty, p: Priority) =>
  Math.floor(BASE[d] * MULT[p]);

function apiError(err: unknown, fallback: string) {
  return (
    (err as { response?: { data?: { detail?: string } } })?.response?.data
      ?.detail ?? fallback
  );
}

function ModerationQueue() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<
    Record<string, { difficulty: Difficulty; priority: Priority }>
  >({});
  const [viewing, setViewing] = useState<PendingIssue | null>(null);

  const { data, isPending } = useQuery({
    queryKey: ["admin-pending-issues"],
    queryFn: () => adminApi.getPendingIssues(),
  });

  const issues: PendingIssue[] = data?.issues ?? [];

  const classify = useMutation({
    mutationFn: ({
      id,
      difficulty,
      priority,
      approved,
    }: {
      id: string;
      difficulty: Difficulty;
      priority: Priority;
      approved: boolean;
    }) => adminApi.classifyIssue(id, { difficulty, priority, approved }),
    onSuccess: (_r, vars) => {
      toast.success(vars.approved ? "Issue approved." : "Issue rejected.");
      queryClient.invalidateQueries({ queryKey: ["admin-pending-issues"] });
    },
    onError: (e) => toast.error(apiError(e, "Could not classify that issue.")),
  });

  const valuesFor = (issue: PendingIssue) =>
    draft[issue.id] ?? {
      difficulty: issue.difficulty ?? "medium",
      priority: issue.priority ?? "medium",
    };

  const setValue = (
    id: string,
    patch: Partial<{ difficulty: Difficulty; priority: Priority }>,
  ) =>
    setDraft((prev) => ({
      ...prev,
      [id]: {
        difficulty: patch.difficulty ?? prev[id]?.difficulty ?? "medium",
        priority: patch.priority ?? prev[id]?.priority ?? "medium",
      },
    }));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-4 lg:px-8 lg:py-7">
      <header>
        <h1 className="font-display text-[26px] font-bold text-ink">
          Moderation
        </h1>
        <p className="text-xs text-ink-muted">
          {issues.length} report{issues.length === 1 ? "" : "s"} awaiting review.
        </p>
      </header>

      {isPending ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="skeleton h-70" />
          ))}
        </div>
      ) : issues.length ? (
        issues.map((issue) => {
          const v = valuesFor(issue);
          const busy = classify.isPending;
          return (
            <article
              key={issue.id}
              className="overflow-hidden rounded-lg border border-border bg-surface"
            >
              {issue.picture_url && (
                <button
                  type="button"
                  onClick={() => setViewing(issue)}
                  aria-label={`View the photo for "${issue.title}" full size`}
                  className="group relative block h-56 w-full cursor-zoom-in bg-surface-2"
                >
                  <Image
                    src={issue.picture_url}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 672px, 100vw"
                    className="object-cover"
                  />
                  <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-semibold text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Icon name="search" size={13} />
                    Inspect photo
                  </span>
                </button>
              )}

              <div className="space-y-3.5 p-4">
                <div>
                  <Link
                    href={`/issues/${issue.id}`}
                    className="font-display text-base font-semibold text-ink hover:underline"
                  >
                    {issue.title}
                  </Link>
                  {issue.description && (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">
                      {issue.description}
                    </p>
                  )}
                </div>

                {issue.ai_labels?.length ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Icon name="scan" size={14} className="text-primary-ink" />
                    {issue.ai_labels.map((l) => (
                      <span
                        key={l}
                        className="rounded-full bg-surface-2 px-2 py-1 text-[10px] font-medium text-ink"
                      >
                        {l}
                      </span>
                    ))}
                    {issue.ai_confidence_score ? (
                      <span className="text-[10px] text-ink-muted">
                        {Math.round(issue.ai_confidence_score * 100)}% confident
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <Choice
                    legend="DIFFICULTY"
                    options={DIFFICULTIES}
                    value={v.difficulty}
                    labelFor={(o) => DIFFICULTY[o].label}
                    onSelect={(o) => setValue(issue.id, { difficulty: o })}
                  />
                  <Choice
                    legend="PRIORITY"
                    options={PRIORITIES}
                    value={v.priority}
                    labelFor={(o) => PRIORITY[o].label}
                    onSelect={(o) => setValue(issue.id, { priority: o })}
                  />
                </div>

                <p className="flex items-center gap-1.5 rounded-md bg-primary-soft px-3 py-2 text-xs font-semibold text-primary-ink">
                  <Icon name="zap" size={13} />
                  Awards {previewPoints(v.difficulty, v.priority)} points
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      classify.mutate({ id: issue.id, ...v, approved: true })
                    }
                    disabled={busy}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary py-2.5 text-xs font-semibold text-on-primary disabled:opacity-60"
                  >
                    <Icon name="check" size={15} />
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      classify.mutate({ id: issue.id, ...v, approved: false })
                    }
                    disabled={busy}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-surface-2 py-2.5 text-xs font-semibold text-danger disabled:opacity-60"
                  >
                    <Icon name="close" size={15} />
                    Reject
                  </button>
                </div>
              </div>
            </article>
          );
        })
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface px-6 py-16 text-center">
          <Icon name="check" size={28} className="text-primary-ink" />
          <p className="text-sm text-ink-muted">
            Nothing in the queue — all caught up.
          </p>
        </div>
      )}

      {viewing?.picture_url && (
        <ImageLightbox
          src={viewing.picture_url}
          alt={viewing.title}
          caption={viewing.title}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}

function Choice<T extends string>({
  legend,
  options,
  value,
  labelFor,
  onSelect,
}: {
  legend: string;
  options: T[];
  value: T;
  labelFor: (o: T) => string;
  onSelect: (o: T) => void;
}) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-[10px] font-semibold tracking-[0.05em] text-ink-muted">
        {legend}
      </legend>
      <div className="flex gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onSelect(o)}
            className={cn(
              "flex-1 rounded-md border py-2 text-[11px] font-semibold transition-colors",
              value === o
                ? "border-primary bg-primary-soft text-primary-ink"
                : "border-border bg-surface text-ink-muted",
            )}
          >
            {labelFor(o)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function AdminIssuesPage() {
  return (
    <AdminGuard>
      <AppShell>
        <ModerationQueue />
      </AppShell>
    </AdminGuard>
  );
}
