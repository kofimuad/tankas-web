"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { IssueCard } from "@/components/issue-card";
import { Icon } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { issuesApi, type Issue } from "@/lib/api";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "pending_review", label: "In review" },
  { key: "resolved", label: "Resolved" },
] as const;

function IssuesContent() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("open");

  useEffect(() => {
    issuesApi
      .getAll()
      .then(setIssues)
      .catch(() => setIssues([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return issues.filter((i) => {
      if (status !== "all" && i.status !== status) return false;
      if (!q) return true;
      return (
        i.title.toLowerCase().includes(q) ||
        (i.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [issues, status, search]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-4 lg:px-8 lg:py-7">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold text-ink">Issues</h1>
          <p className="text-xs text-ink-muted">
            {filtered.length} issue{filtered.length === 1 ? "" : "s"} found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/map"
            aria-label="View issues on a map"
            className="grid size-10 place-items-center rounded-full border border-border bg-surface text-ink transition-colors hover:bg-surface-2"
          >
            <Icon name="map" size={18} />
          </Link>
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <label className="flex items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-3">
        <Icon name="search" size={17} className="shrink-0 text-ink-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search issues…"
          className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
        />
      </label>

      <div
        role="tablist"
        aria-label="Filter by status"
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {FILTERS.map((f) => {
          const active = status === f.key;
          return (
            <button
              key={f.key}
              role="tab"
              aria-selected={active}
              onClick={() => setStatus(f.key)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-xs transition-colors",
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

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-64" />
          ))}
        </div>
      ) : filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface px-6 py-16 text-center">
          <Icon name="search" size={28} className="text-ink-muted" />
          <p className="text-sm text-ink-muted">
            No issues match these filters.
          </p>
        </div>
      )}
    </div>
  );
}

export default function IssuesPage() {
  return (
    <AuthGuard>
      <AppShell>
        <IssuesContent />
      </AppShell>
    </AuthGuard>
  );
}
