"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Icon, type IconName } from "@/components/ui/icon";
import { TIER, tierForPoints } from "@/lib/design";
import { cn } from "@/lib/utils";

type NavItem = { href: string; icon: IconName; label: string };
type NavGroup = { label: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    label: "Discover",
    items: [
      { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
      { href: "/issues", icon: "list", label: "Issues" },
      { href: "/map", icon: "map", label: "Map" },
    ],
  },
  {
    label: "Act",
    items: [
      { href: "/report", icon: "camera", label: "Report" },
      { href: "/collections", icon: "package", label: "Collections" },
    ],
  },
  {
    label: "Earn",
    items: [
      { href: "/leaderboard", icon: "trophy", label: "Leaderboards" },
      { href: "/redeem", icon: "gift", label: "Rewards" },
    ],
  },
];

// TODO: an Admin group belongs here, gated on `user.role === "admin"` to mirror
// the backend's `require_admin`. Omitted until the /admin routes are built.

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const visible = groups;
  const tier = tierForPoints(user?.total_points ?? 0);

  return (
    <aside className="sticky top-0 hidden h-screen w-65 shrink-0 flex-col gap-6 border-r border-border bg-surface px-4 py-5 lg:flex">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-1.5">
        <span className="grid size-8 place-items-center rounded-sm bg-primary">
          <Icon name="leaf" size={18} className="text-on-primary" />
        </span>
        <span className="font-display text-[19px] font-extrabold tracking-[-0.02em] text-ink">
          Tankas
        </span>
      </Link>

      <nav aria-label="Primary" className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {visible.map((group) => (
          <div key={group.label} className="flex flex-col gap-[3px]">
            <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-sm px-2.5 py-2.5 text-[13px] transition-colors",
                    active
                      ? "bg-primary-soft font-semibold text-primary-ink"
                      : "font-medium text-ink hover:bg-surface-2",
                  )}
                >
                  <Icon
                    name={item.icon}
                    size={17}
                    className={active ? "text-primary-ink" : "text-ink-muted"}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {user && (
        <Link
          href="/profile"
          className="flex items-center gap-2.5 rounded-md bg-surface-2 p-2.5 transition-colors hover:bg-border"
        >
          <span
            className={cn(
              "grid size-8.5 shrink-0 place-items-center rounded-full bg-surface font-display text-xs font-bold text-ink-muted ring-2",
              TIER[tier].ring,
            )}
          >
            {initials(user.display_name || user.username)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-ink">
              {user.display_name || user.username}
            </span>
            <span className="block text-[10px] text-ink-muted">
              {TIER[tier].label} · {user.total_points.toLocaleString()} pts
            </span>
          </span>
        </Link>
      )}
    </aside>
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
