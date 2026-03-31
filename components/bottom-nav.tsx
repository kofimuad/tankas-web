"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", icon: "⬛", label: "Home" },
  { href: "/issues", icon: "📍", label: "Issues" },
  { href: "/report", icon: "➕", label: "Report", primary: true },
  { href: "/leaderboard", icon: "🏆", label: "Ranks" },
  { href: "/profile", icon: "👤", label: "Profile" },
];

export function BottomNav() {
  const path = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0e1a13]/95 backdrop-blur-md border-t border-white/8 flex items-center justify-around px-2 py-2 md:hidden">
      {navItems.map((item) => {
        const active = path === item.href;
        if (item.primary) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center -mt-5"
            >
              <div className="w-14 h-14 bg-[#38e07b] rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-[#38e07b]/30 hover:scale-105 transition-transform active:scale-95">
                {item.icon}
              </div>
              <span className="text-[10px] text-white/40 mt-1">
                {item.label}
              </span>
            </Link>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 px-3 py-1"
          >
            <span className={`text-xl ${active ? "" : "opacity-40"}`}>
              {item.icon}
            </span>
            <span
              className={`text-[10px] font-medium transition-colors ${
                active ? "text-[#38e07b]" : "text-white/40"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
