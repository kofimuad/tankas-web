"use client";

import { use, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/ui/icon";
import { Pill } from "@/components/ui/pill";
import {
  DIFFICULTY,
  PRIORITY,
  STATUS,
  type Difficulty,
  type IssueStatus,
  type Priority,
} from "@/lib/design";
import {
  commentsApi,
  issuesApi,
  pledgesApi,
  volunteersApi,
  type Comment,
  type Issue,
  type Pledge,
} from "@/lib/api";
import { cn } from "@/lib/utils";

function apiError(err: unknown, fallback: string) {
  return (
    (err as { response?: { data?: { detail?: string } } })?.response?.data
      ?.detail ?? fallback
  );
}

function IssueDetail({ issueId }: { issueId: string }) {
  const router = useRouter();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [pledgeOpen, setPledgeOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [issueData, pledgeData, commentData] = await Promise.all([
        issuesApi.getById(issueId),
        pledgesApi.getByIssue(issueId).catch(() => null),
        commentsApi.getByIssue(issueId).catch(() => null),
      ]);
      setIssue(issueData);
      setPledges(pledgeData?.pledges ?? []);
      setComments(commentData?.comments ?? []);
    } catch {
      toast.error("Could not load that issue.");
      router.push("/issues");
    } finally {
      setLoading(false);
    }
  }, [issueId, router]);

  useEffect(() => {
    load();
  }, [load]);

  const join = async () => {
    setJoining(true);
    try {
      await volunteersApi.join(issueId);
      toast.success("You've joined the cleanup group.");
      load();
    } catch (err) {
      toast.error(apiError(err, "Could not join this cleanup."));
    } finally {
      setJoining(false);
    }
  };

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    setDraft("");
    try {
      const created = await commentsApi.create(issueId, content);
      setComments((c) => [created, ...c]);
    } catch (err) {
      setDraft(content);
      toast.error(apiError(err, "Could not post that comment."));
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4 p-4">
        <div className="skeleton h-62" />
        <div className="skeleton h-40" />
      </div>
    );
  }

  if (!issue) return null;

  const status = STATUS[(issue.status as IssueStatus) ?? "open"] ?? STATUS.open;
  const priority = PRIORITY[(issue.priority as Priority) ?? "medium"];
  const difficulty = DIFFICULTY[(issue.difficulty as Difficulty) ?? "medium"];
  const labels = issue.ai_labels ?? [];

  return (
    <div className="mx-auto w-full max-w-2xl pb-24 lg:pb-8">
      <div className="relative h-62 w-full bg-surface-2 lg:rounded-b-xl lg:overflow-hidden">
        {issue.picture_url && (
          <Image
            src={issue.picture_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 672px, 100vw"
            className="object-cover"
            priority
          />
        )}
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="glass absolute left-4 top-4 grid size-9.5 place-items-center rounded-full text-ink"
        >
          <Icon name="back" size={18} />
        </button>
      </div>

      <div className="space-y-5 px-4 py-4.5 lg:px-0">
        <div className="flex flex-wrap gap-1.5">
          <Pill label={status.label} {...swatch(status)} />
          {priority && (
            <Pill label={`${priority.label} priority`} {...swatch(priority)} />
          )}
          {difficulty && <Pill label={difficulty.label} {...swatch(difficulty)} />}
        </div>

        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-2xl font-bold leading-tight text-ink">
            {issue.title}
          </h1>
          <span className="shrink-0 text-right">
            <span className="numeric block text-xl font-bold text-primary-ink">
              {issue.points_assigned}
            </span>
            <span className="block text-[10px] text-ink-muted">points</span>
          </span>
        </div>

        {issue.description && (
          <p className="text-sm leading-relaxed text-ink-muted">
            {issue.description}
          </p>
        )}

        {labels.length > 0 && (
          <section className="space-y-2.5 rounded-lg border border-border bg-surface p-3.5">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.06em] text-ink-muted">
              <Icon name="scan" size={15} className="text-primary-ink" />
              AI DETECTION
              {issue.ai_confidence_score ? (
                <span className="ml-auto font-normal">
                  {Math.round(issue.ai_confidence_score * 100)}% confidence
                </span>
              ) : null}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {labels.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-surface-2 px-2.5 py-1.5 text-[11px] font-medium text-ink"
                >
                  {label}
                </span>
              ))}
            </div>
          </section>
        )}

        {pledges.length > 0 && (
          <section className="space-y-2.5">
            <h2 className="font-display text-base font-semibold text-ink">
              Pledges
            </h2>
            {pledges.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2.5 rounded-md border border-border bg-surface p-3"
              >
                <span className="grid size-8.5 shrink-0 place-items-center rounded-sm bg-primary-soft">
                  <Icon
                    name={p.pledge_type === "money" ? "money" : "package"}
                    size={16}
                    className="text-primary-ink"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-ink">
                    {p.description || p.pledge_type}
                  </span>
                  <span className="block text-[11px] capitalize text-ink-muted">
                    {p.pledger_name ? `${p.pledger_name} · ` : ""}
                    {p.pledge_type}
                  </span>
                </span>
                <span
                  className={cn(
                    "shrink-0 text-[11px] font-semibold capitalize",
                    p.status === "fulfilled"
                      ? "text-status-open"
                      : "text-status-review",
                  )}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </section>
        )}

        <section className="space-y-3">
          <h2 className="font-display text-base font-semibold text-ink">
            Comments{comments.length ? ` (${comments.length})` : ""}
          </h2>

          <form onSubmit={postComment} className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add a comment…"
              className="min-w-0 flex-1 rounded-md border border-border bg-surface px-3.5 py-2.5 text-[13px] text-ink outline-none placeholder:text-ink-muted"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Post comment"
              className="grid size-10.5 shrink-0 place-items-center rounded-md bg-primary text-on-primary disabled:opacity-40"
            >
              <Icon name="send" size={16} />
            </button>
          </form>

          {comments.map((c) => (
            <div key={c.comment_id} className="flex gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-[11px] font-semibold text-ink-muted">
                {initials(c.author.display_name || c.author.username)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-ink">
                  {c.author.display_name || c.author.username}
                </span>
                <span className="block text-[13px] leading-relaxed text-ink-muted">
                  {c.content}
                </span>
              </span>
            </div>
          ))}
        </section>
      </div>

      {/* Sticky action bar — the primary intent of the screen. */}
      <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex items-center gap-2.5 border-t border-border bg-surface px-4 pb-5 pt-3.5 lg:static lg:border-0 lg:bg-transparent lg:px-0 lg:pt-2">
        <button
          type="button"
          onClick={() => setPledgeOpen(true)}
          aria-label="Make a pledge"
          className="grid size-13 shrink-0 place-items-center rounded-md bg-surface-2 text-ink"
        >
          <Icon name="heart" size={20} />
        </button>
        <button
          onClick={join}
          disabled={joining || issue.status === "resolved"}
          className="flex h-13 flex-1 items-center justify-center gap-2 rounded-md bg-primary text-[15px] font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Icon name="users" size={18} />
          {issue.status === "resolved"
            ? "Already resolved"
            : joining
              ? "Joining…"
              : "Join cleanup"}
        </button>
      </div>

      {pledgeOpen && (
        <PledgeDialog
          issueId={issueId}
          onClose={() => setPledgeOpen(false)}
          onCreated={load}
        />
      )}
    </div>
  );
}

const PLEDGE_TYPES = ["money", "equipment", "volunteer", "other"] as const;

/** Bottom sheet on mobile, centred dialog from `sm` up. */
function PledgeDialog({
  issueId,
  onClose,
  onCreated,
}: {
  issueId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [type, setType] = useState<(typeof PLEDGE_TYPES)[number]>("money");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await pledgesApi.create(issueId, {
        pledge_type: type,
        description,
        ...(type === "money" && amount ? { amount: Number(amount) } : {}),
      });
      toast.success("Pledge recorded. Thank you.");
      onCreated();
      onClose();
    } catch (err) {
      toast.error(apiError(err, "Could not create that pledge."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Make a pledge"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-md space-y-4 rounded-t-xl bg-surface p-5 sm:rounded-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">
            Make a pledge
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-full bg-surface-2 text-ink"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {PLEDGE_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={type === t}
              onClick={() => setType(t)}
              className={cn(
                "rounded-md border py-2.5 text-xs font-semibold capitalize transition-colors",
                type === t
                  ? "border-primary bg-primary-soft text-primary-ink"
                  : "border-border bg-surface text-ink-muted",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {type === "money" && (
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold tracking-[0.04em] text-ink-muted">
              AMOUNT (GHS)
            </span>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-md border border-border bg-surface px-3.5 py-3 text-sm text-ink outline-none"
            />
          </label>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold tracking-[0.04em] text-ink-muted">
            DESCRIPTION
          </span>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you pledging?"
            className="resize-none rounded-md border border-border bg-surface px-3.5 py-3 text-sm text-ink outline-none placeholder:text-ink-muted"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="h-12 w-full rounded-md bg-primary text-sm font-semibold text-on-primary disabled:opacity-60"
        >
          {saving ? "Saving…" : "Confirm pledge"}
        </button>
      </form>
    </div>
  );
}

const swatch = (s: { text: string; dot: string; soft: string }) => ({
  text: s.text,
  dot: s.dot,
  soft: s.soft,
});

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // `params` is a promise in this version — unwrapped with React's `use`.
  const { id } = use(params);
  return (
    <AuthGuard>
      <AppShell>
        <IssueDetail issueId={id} />
      </AppShell>
    </AuthGuard>
  );
}
