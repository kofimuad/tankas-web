"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppTopbar() {
  return (
    <header className="sticky top-0 z-40 flex h-17 shrink-0 items-center justify-between gap-5 border-b border-border bg-surface px-8">
      <label className="flex w-85 items-center gap-2.5 rounded-full bg-surface-2 px-3.5 py-2.5">
        <Icon name="search" size={16} className="shrink-0 text-ink-muted" />
        <input
          type="search"
          placeholder="Search issues, places, warriors…"
          className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-muted"
        />
      </label>

      <div className="flex items-center gap-2.5">
        <Link
          href="/report"
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-[13px] font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          <Icon name="plus" size={16} />
          Report issue
        </Link>
        <button
          type="button"
          aria-label="Notifications"
          className="grid size-10 place-items-center rounded-full bg-surface-2 text-ink transition-colors hover:bg-border"
        >
          <Icon name="bell" size={17} />
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
