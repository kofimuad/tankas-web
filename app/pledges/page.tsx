"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { pledgesApi, type Pledge } from "@/lib/api";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: "pending", label: "Pending" },
  { key: "fulfilled", label: "Fulfilled" },
  { key: "cancelled", label: "Cancelled" },
] as const;

function apiError(err: unknown, fallback: string) {
  return (
    (err as { response?: { data?: { detail?: string } } })?.response?.data
      ?.detail ?? fallback
  );
}

function PledgesContent() {
  const [status, setStatus] = useState<string>("pending");
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["my-pledges", status],
    queryFn: () => pledgesApi.getMyPledges(status),
  });

  const pledges: Pledge[] = data?.pledges ?? data ?? [];

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["my-pledges"] });

  const fulfil = useMutation({
    mutationFn: (id: string) => pledgesApi.fulfil(id),
    onSuccess: () => {
      toast.success("Pledge marked as fulfilled.");
      invalidate();
    },
    onError: (err) => toast.error(apiError(err, "Could not update the pledge.")),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => pledgesApi.cancel(id),
    onSuccess: () => {
      toast.success("Pledge cancelled.");
      invalidate();
    },
    onError: (err) => toast.error(apiError(err, "Could not cancel the pledge.")),
  });

  const busy = fulfil.isPending || cancel.isPending;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-4 lg:px-8 lg:py-7">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold text-ink">
            My pledges
          </h1>
          <p className="text-xs text-ink-muted">
            What you&apos;ve promised to cleanups.
          </p>
        </div>
        <div className="lg:hidden">
          <ThemeToggle />
        </div>
      </header>

      <div role="tablist" className="flex gap-2">
        {FILTERS.map((f) => {
          const active = status === f.key;
          return (
            <button
              key={f.key}
              role="tab"
              aria-selected={active}
              onClick={() => setStatus(f.key)}
              className={cn(
                "rounded-full px-3.5 py-2 text-xs transition-colors",
                active
                  ? "bg-primary font-semibold text-on-primary"
                  : "border border-border bg-surface font-medium text-ink-muted hover:text-ink",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {isPending ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="skeleton h-24" />
          ))}
        </div>
      ) : pledges.length ? (
        <div className="space-y-3">
          {pledges.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-3.5"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary-soft">
                  <Icon
                    name={p.pledge_type === "money" ? "money" : "package"}
                    size={18}
                    className="text-primary-ink"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {p.description || p.pledge_type}
                  </p>
                  <p className="text-[11px] capitalize text-ink-muted">
                    {p.pledge_type}
                    {p.amount ? ` · GHS ${p.amount}` : ""}
                    {p.quantity > 1 ? ` · ×${p.quantity}` : ""}
                  </p>
                </div>
                <Link
                  href={`/issues/${p.issue_id}`}
                  aria-label="Open the issue"
                  className="shrink-0 text-ink-muted"
                >
                  <Icon name="forward" size={16} />
                </Link>
              </div>

              {p.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => fulfil.mutate(p.id)}
                    disabled={busy}
                    className="flex-1 rounded-md bg-primary py-2.5 text-xs font-semibold text-on-primary disabled:opacity-60"
                  >
                    Mark fulfilled
                  </button>
                  <button
                    onClick={() => cancel.mutate(p.id)}
                    disabled={busy}
                    className="flex-1 rounded-md bg-surface-2 py-2.5 text-xs font-semibold text-danger disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface px-6 py-14 text-center">
          <Icon name="heart" size={26} className="text-ink-muted" />
          <p className="text-sm text-ink-muted">No {status} pledges.</p>
          <Link href="/issues" className="text-xs font-semibold text-primary-ink">
            Find a cleanup to support
          </Link>
        </div>
      )}
    </div>
  );
}

export default function PledgesPage() {
  return (
    <AuthGuard>
      <AppShell>
        <PledgesContent />
      </AppShell>
    </AuthGuard>
  );
}
