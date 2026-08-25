"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IssueCard } from "@/components/issue-card";
import { Icon, type IconName } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { formatKg } from "@/lib/design";
import {
  issuesApi,
  publicApi,
  type Issue,
  type PlatformStats,
} from "@/lib/api";

const STEPS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "camera",
    title: "Snap",
    body: "Photograph waste where you find it. Location and category are read from the photo automatically.",
  },
  {
    icon: "users",
    title: "Clean",
    body: "Join a cleanup group, or start one. Points are split across everyone who turns up and is verified.",
  },
  {
    icon: "wallet",
    title: "Earn",
    body: "Turn points into mobile money or rewards. Harder, higher-priority jobs are worth more.",
  },
];

export default function LandingPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    publicApi
      .getStats()
      .then(setStats)
      .catch(() => setStats(null));

    issuesApi
      .getAll()
      .then((data) => setIssues(data.slice(0, 3)))
      .catch(() => setIssues([]));
  }, []);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-border bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-sm bg-primary">
              <Icon name="leaf" size={18} className="text-on-primary" />
            </span>
            <span className="font-display text-xl font-extrabold tracking-[-0.02em] text-ink">
              Tankas
            </span>
          </Link>
          <nav className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-full px-3.5 py-2.5 text-[13px] font-semibold text-ink"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-primary px-4 py-2.5 text-[13px] font-semibold text-on-primary transition-opacity hover:opacity-90"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-5 pb-14 pt-16 text-center sm:pt-24">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3.5 py-1.5 text-xs font-semibold text-primary-ink">
            <Icon name="pin" size={13} />
            Built for Ghana
          </p>
          <h1 className="mx-auto max-w-3xl font-display text-[clamp(2.5rem,8vw,4.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink">
            Snap it. Clean it.{" "}
            <span className="text-primary-ink">Get paid.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-muted">
            Report waste in your neighbourhood, team up with people nearby to
            clear it, and turn the points you earn into mobile money.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="flex h-13 items-center gap-2 rounded-md bg-primary px-7 text-[15px] font-semibold text-on-primary transition-opacity hover:opacity-90"
            >
              Start reporting
              <Icon name="forward" size={17} />
            </Link>
            <Link
              href="/issues"
              className="flex h-13 items-center rounded-md border border-border bg-surface px-7 text-[15px] font-semibold text-ink transition-colors hover:bg-surface-2"
            >
              Browse issues
            </Link>
          </div>
        </section>

        {stats && (
          <section className="mx-auto max-w-5xl px-5 pb-16">
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { value: stats.total_users.toLocaleString(), label: "Warriors" },
                {
                  value: stats.resolved_issues.toLocaleString(),
                  label: "Areas cleaned",
                },
                {
                  value: stats.open_issues.toLocaleString(),
                  label: "Open issues",
                },
                {
                  value: `${formatKg(stats.total_kg_collected)} kg`,
                  label: "Waste collected",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-border bg-surface px-4 py-5 text-center"
                >
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="numeric text-2xl font-bold text-ink sm:text-3xl">
                    {s.value}
                  </dd>
                  <dd className="mt-1 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <section className="border-y border-border bg-surface py-16">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="text-center font-display text-3xl font-bold text-ink sm:text-4xl">
              How it works
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <div
                  key={step.title}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-canvas p-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-md bg-primary-soft">
                      <Icon
                        name={step.icon}
                        size={20}
                        className="text-primary-ink"
                      />
                    </span>
                    <span className="numeric text-sm font-bold text-ink-muted">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-ink">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-muted">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {issues.length > 0 && (
          <section className="mx-auto max-w-6xl px-5 py-16">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl font-bold text-ink">
                  Happening now
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Live reports from the community.
                </p>
              </div>
              <Link
                href="/issues"
                className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-primary-ink"
              >
                See all
                <Icon name="forward" size={14} />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          </section>
        )}

        <section className="mx-auto max-w-6xl px-5 pb-20">
          <div
            className="flex flex-col items-center gap-5 rounded-xl px-6 py-14 text-center"
            style={{
              background: "linear-gradient(160deg, #38e07b 0%, #12a85b 100%)",
            }}
          >
            <h2 className="max-w-lg font-display text-3xl font-extrabold leading-tight text-on-primary sm:text-4xl">
              Your city gets cleaner. You get paid.
            </h2>
            <p className="max-w-md text-sm text-on-primary/75">
              It takes one photo to start. Join thousands already earning.
            </p>
            <Link
              href="/signup"
              className="flex h-13 items-center rounded-md bg-on-primary px-8 text-[15px] font-semibold text-primary transition-opacity hover:opacity-90"
            >
              Create your account
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 text-[13px] text-ink-muted">
          <p>© {new Date().getFullYear()} Tankas</p>
          <nav className="flex gap-5">
            <Link href="/issues" className="hover:text-ink">
              Issues
            </Link>
            <Link href="/leaderboard" className="hover:text-ink">
              Leaderboard
            </Link>
            <Link href="/signup" className="hover:text-ink">
              Sign up
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
