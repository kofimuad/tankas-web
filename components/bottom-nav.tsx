"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

// Five destinations plus the centre action. Map earns a slot because finding
// nearby work is the core loop, and it is otherwise only reachable from a
// small icon in the Issues header.
const items: { href: string; icon: IconName; label: string }[] = [
  { href: "/dashboard", icon: "home", label: "Home" },
  { href: "/issues", icon: "list", label: "Issues" },
  { href: "/map", icon: "map", label: "Map" },
  { href: "/leaderboard", icon: "trophy", label: "Ranks" },
  { href: "/profile", icon: "user", label: "Profile" },
];

/** Floating capsule tab bar. Report sits in the middle as a raised action. */
export function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const tab = (item: (typeof items)[number]) => {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-3xl transition-colors",
          active ? "bg-primary-soft" : "hover:bg-surface-2",
        )}
      >
        <Icon
          name={item.icon}
          size={20}
          className={active ? "text-primary-ink" : "text-ink-muted"}
        />
        <span
          className={cn(
            "text-[9px] leading-none",
            active ? "font-semibold text-primary-ink" : "text-ink-muted",
          )}
        >
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <nav
      aria-label="Primary"
      className="safe-bottom fixed inset-x-0 bottom-0 z-50 px-4 pb-3 lg:hidden"
    >
      <div className="glass mx-auto flex h-15 max-w-md items-center gap-0.5 rounded-full border border-border p-1.5 shadow-[0_6px_20px_-4px_rgb(14_26_19/0.22)]">
        {items.slice(0, 2).map(tab)}

        <div className="flex h-full flex-1 items-center justify-center">
          <Link
            href="/report"
            aria-label="Report an issue"
            className="grid size-11 place-items-center rounded-full bg-primary shadow-[0_4px_12px_-2px_rgb(56_224_123/0.4)] transition-transform active:scale-95"
          >
            <Icon name="plus" size={22} className="text-on-primary" />
          </Link>
        </div>

        {items.slice(2).map(tab)}
      </div>
    </nav>
  );
}
