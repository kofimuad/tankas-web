"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { BadgeTier } from "@/components/badge-tier";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/issues", label: "Issues" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/report", label: "Report Issue" },
];

export function AppNavbar() {
  const path = usePathname();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#0e1a13]/90 backdrop-blur-md border-b border-white/8">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="font-display font-800 text-lg text-white"
        >
          🌍 Tankas
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                path === link.href
                  ? "text-[#38e07b] font-600"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User info */}
        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="hidden md:flex items-center gap-3">
                <BadgeTier tier={user.badge_tier} size="sm" />
                <span className="text-[#38e07b] font-display font-600 text-sm">
                  {user.total_points.toLocaleString()} pts
                </span>
              </div>
              <Link href="/profile">
                <div className="w-9 h-9 rounded-full bg-[#38e07b]/20 border border-[#38e07b]/30 flex items-center justify-center text-[#38e07b] font-display font-700 text-sm hover:bg-[#38e07b]/30 transition-colors">
                  {user.display_name?.[0]?.toUpperCase() ||
                    user.username[0].toUpperCase()}
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
