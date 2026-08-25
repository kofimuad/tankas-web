"use client";

import { use, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth-context";
import {
  completionApi,
  issuesApi,
  volunteersApi,
  type Group,
} from "@/lib/api";
import { cn } from "@/lib/utils";

function apiError(err: unknown, fallback: string) {
  return (
    (err as { response?: { data?: { detail?: string } } })?.response?.data
      ?.detail ?? fallback
  );
}

function GroupContent({ groupId }: { groupId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const photoInput = useRef<HTMLInputElement>(null);

  const [verified, setVerified] = useState<string[]>([]);
  const [transferTo, setTransferTo] = useState<string | null>(null);

  const { data: group, isPending } = useQuery({
    queryKey: ["group", groupId],
    queryFn: async (): Promise<Group> => {
      const res = await volunteersApi.getGroup(groupId);
      return res?.data ?? res;
    },
  });

  const { data: issue } = useQuery({
    queryKey: ["issue", group?.issue_id],
    queryFn: () => issuesApi.getById(group!.issue_id),
    enabled: Boolean(group?.issue_id),
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["group", groupId] });

  const confirm = useMutation({
    mutationFn: () => completionApi.confirmParticipation(group!.issue_id, groupId),
    onSuccess: () => {
      toast.success("Participation confirmed.");
      refresh();
    },
    onError: (e) => toast.error(apiError(e, "Could not confirm participation.")),
  });

  const complete = useMutation({
    mutationFn: (file: File) =>
      completionApi.completeIssue(group!.issue_id, groupId, file),
    onSuccess: () => {
      toast.success("Cleanup submitted for verification.");
      refresh();
    },
    onError: (e) => toast.error(apiError(e, "Could not submit the cleanup.")),
  });

  const verify = useMutation({
    mutationFn: () =>
      completionApi.verifyVolunteers(group!.issue_id, groupId, verified),
    onSuccess: () => {
      toast.success("Volunteers verified — points distributed.");
      refresh();
    },
    onError: (e) => toast.error(apiError(e, "Could not verify volunteers.")),
  });

  const transfer = useMutation({
    mutationFn: (newLeaderUserId: string) => {
      const me = group!.members.find((m) => m.user_id === user?.id);
      return volunteersApi.transferLeadership(me!.volunteer_id, newLeaderUserId);
    },
    onSuccess: () => {
      toast.success("Leadership transferred.");
      setTransferTo(null);
      refresh();
    },
    onError: (e) => toast.error(apiError(e, "Could not transfer leadership.")),
  });

  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4 p-4">
        <div className="skeleton h-24" />
        <div className="skeleton h-40" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-4 py-20 text-center">
        <Icon name="users" size={28} className="text-ink-muted" />
        <p className="text-sm text-ink-muted">That group could not be found.</p>
      </div>
    );
  }

  const isLeader = group.leader_id === user?.id;
  const busy =
    confirm.isPending ||
    complete.isPending ||
    verify.isPending ||
    transfer.isPending;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-4 lg:px-8 lg:py-7">
      <header className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="grid size-9.5 shrink-0 place-items-center rounded-full border border-border bg-surface text-ink"
        >
          <Icon name="back" size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-bold text-ink">
            {issue?.title ?? "Cleanup group"}
          </h1>
          <p className="text-xs text-ink-muted">
            {group.member_count} volunteer{group.member_count === 1 ? "" : "s"}
            {isLeader ? " · you lead this group" : ""}
          </p>
        </div>
        {group.issue_id && (
          <Link
            href={`/issues/${group.issue_id}`}
            aria-label="Open the issue"
            className="grid size-9.5 shrink-0 place-items-center rounded-full border border-border bg-surface text-ink"
          >
            <Icon name="forward" size={16} />
          </Link>
        )}
      </header>

      <section className="overflow-hidden rounded-lg border border-border bg-surface">
        <p className="border-b border-border px-3.5 py-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
          Members
        </p>
        {group.members.map((m) => {
          const checked = verified.includes(m.volunteer_id);
          return (
            <div
              key={m.volunteer_id}
              className="flex items-center gap-3 border-b border-border px-3.5 py-3 last:border-b-0"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-[11px] font-semibold text-ink-muted">
                {initials(m.display_name || m.username)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-ink">
                  {m.user_id === user?.id ? "You" : m.display_name || m.username}
                </span>
                <span className="block text-[11px] text-ink-muted">
                  @{m.username}
                </span>
              </span>

              {m.is_leader && (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary-soft px-2 py-1 text-[10px] font-semibold text-primary-ink">
                  <Icon name="medal" size={11} />
                  Leader
                </span>
              )}

              {/* Leaders tick off who actually turned up; points split across
                  exactly this list. */}
              {isLeader && !m.is_leader && (
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  aria-label={`Verify ${m.display_name || m.username}`}
                  onClick={() =>
                    setVerified((prev) =>
                      checked
                        ? prev.filter((v) => v !== m.volunteer_id)
                        : [...prev, m.volunteer_id],
                    )
                  }
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-sm border transition-colors",
                    checked
                      ? "border-primary bg-primary text-on-primary"
                      : "border-border bg-surface text-transparent",
                  )}
                >
                  <Icon name="check" size={14} />
                </button>
              )}
            </div>
          );
        })}
      </section>

      {!isLeader && (
        <button
          onClick={() => confirm.mutate()}
          disabled={busy}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-md bg-primary text-[15px] font-semibold text-on-primary disabled:opacity-60"
        >
          <Icon name="check" size={18} />
          {confirm.isPending ? "Confirming…" : "Confirm I took part"}
        </button>
      )}

      {isLeader && (
        <div className="space-y-3">
          <input
            ref={photoInput}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) =>
              e.target.files?.[0] && complete.mutate(e.target.files[0])
            }
          />

          <button
            onClick={() => photoInput.current?.click()}
            disabled={busy}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-md bg-primary text-[15px] font-semibold text-on-primary disabled:opacity-60"
          >
            <Icon name="camera" size={18} />
            {complete.isPending ? "Uploading…" : "Upload proof & complete"}
          </button>

          <button
            onClick={() => verify.mutate()}
            disabled={busy || verified.length === 0}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface text-[15px] font-semibold text-ink disabled:opacity-50"
          >
            <Icon name="users" size={18} />
            {verify.isPending
              ? "Verifying…"
              : `Verify ${verified.length} volunteer${verified.length === 1 ? "" : "s"}`}
          </button>

          <details className="rounded-lg border border-border bg-surface">
            <summary className="cursor-pointer px-3.5 py-3 text-[13px] font-semibold text-ink">
              Transfer leadership
            </summary>
            <div className="space-y-2 px-3.5 pb-3.5">
              {group.members
                .filter((m) => !m.is_leader)
                .map((m) => (
                  <button
                    key={m.user_id}
                    onClick={() => setTransferTo(m.user_id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md border px-3 py-2.5 text-left text-[13px] transition-colors",
                      transferTo === m.user_id
                        ? "border-primary bg-primary-soft text-primary-ink"
                        : "border-border text-ink",
                    )}
                  >
                    <Icon name="user" size={15} />
                    {m.display_name || m.username}
                  </button>
                ))}
              <button
                onClick={() => transferTo && transfer.mutate(transferTo)}
                disabled={!transferTo || busy}
                className="h-11 w-full rounded-md bg-surface-2 text-xs font-semibold text-ink disabled:opacity-50"
              >
                {transfer.isPending ? "Transferring…" : "Confirm transfer"}
              </button>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AuthGuard>
      <AppShell>
        <GroupContent groupId={id} />
      </AppShell>
    </AuthGuard>
  );
}
