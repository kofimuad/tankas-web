"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/ui/icon";
import { adminApi } from "@/lib/api";
import { TIER, type Tier } from "@/lib/design";
import { cn } from "@/lib/utils";

type AdminUser = {
  id: string;
  username: string;
  display_name: string | null;
  email: string;
  role: string;
  badge_tier: Tier;
  total_points: number;
};

function apiError(err: unknown, fallback: string) {
  return (
    (err as { response?: { data?: { detail?: string } } })?.response?.data
      ?.detail ?? fallback
  );
}

function AdminUsers() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["admin-users", search],
    queryFn: () => adminApi.getUsers({ search: search || undefined, limit: 50 }),
  });

  const users: AdminUser[] = data?.users ?? [];

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const ban = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.banUser(id, reason),
    onSuccess: () => {
      toast.success("User banned.");
      invalidate();
    },
    onError: (e) => toast.error(apiError(e, "Could not ban that user.")),
  });

  const unban = useMutation({
    mutationFn: (id: string) => adminApi.unbanUser(id),
    onSuccess: () => {
      toast.success("User unbanned.");
      invalidate();
    },
    onError: (e) => toast.error(apiError(e, "Could not unban that user.")),
  });

  const promote = useMutation({
    mutationFn: (id: string) => adminApi.makeAdmin(id),
    onSuccess: () => {
      toast.success("User promoted to admin.");
      invalidate();
    },
    onError: (e) => toast.error(apiError(e, "Could not promote that user.")),
  });

  const busy = ban.isPending || unban.isPending || promote.isPending;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 px-4 py-4 lg:px-8 lg:py-7">
      <header>
        <h1 className="font-display text-[26px] font-bold text-ink">Users</h1>
        <p className="text-xs text-ink-muted">
          Ban, restore and promote accounts.
        </p>
      </header>

      <label className="flex items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-3">
        <Icon name="search" size={17} className="shrink-0 text-ink-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username or email…"
          className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
        />
      </label>

      {isPending ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-18" />
          ))}
        </div>
      ) : users.length ? (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          {users.map((u) => {
            const banned = u.role === "banned";
            return (
              <div
                key={u.id}
                className="flex flex-wrap items-center gap-3 border-b border-border px-3.5 py-3 last:border-b-0"
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-[11px] font-semibold text-ink-muted ring-2",
                    TIER[u.badge_tier]?.ring ?? TIER.bronze.ring,
                  )}
                >
                  {initials(u.display_name || u.username)}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[13px] font-semibold text-ink">
                      {u.display_name || u.username}
                    </span>
                    {u.role === "admin" && (
                      <span className="shrink-0 rounded-full bg-primary-soft px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary-ink">
                        Admin
                      </span>
                    )}
                    {banned && (
                      <span className="shrink-0 rounded-full bg-danger/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-danger">
                        Banned
                      </span>
                    )}
                  </span>
                  <span className="block truncate text-[11px] text-ink-muted">
                    {u.email} · {u.total_points?.toLocaleString() ?? 0} pts
                  </span>
                </span>

                <span className="flex shrink-0 gap-1.5">
                  {banned ? (
                    <button
                      onClick={() => unban.mutate(u.id)}
                      disabled={busy}
                      className="rounded-full bg-surface-2 px-3 py-1.5 text-[11px] font-semibold text-ink disabled:opacity-50"
                    >
                      Unban
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const reason = window.prompt("Reason for ban?");
                        if (reason) ban.mutate({ id: u.id, reason });
                      }}
                      disabled={busy}
                      className="rounded-full bg-danger/10 px-3 py-1.5 text-[11px] font-semibold text-danger disabled:opacity-50"
                    >
                      Ban
                    </button>
                  )}
                  {u.role !== "admin" && !banned && (
                    <button
                      onClick={() => promote.mutate(u.id)}
                      disabled={busy}
                      className="rounded-full bg-surface-2 px-3 py-1.5 text-[11px] font-semibold text-ink disabled:opacity-50"
                    >
                      Make admin
                    </button>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface px-6 py-14 text-center">
          <Icon name="users" size={26} className="text-ink-muted" />
          <p className="text-sm text-ink-muted">No users match that search.</p>
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

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <AppShell>
        <AdminUsers />
      </AppShell>
    </AdminGuard>
  );
}
