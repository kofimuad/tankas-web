"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { AppNavbar } from "@/components/app-navbar";
import { BottomNav } from "@/components/bottom-nav";
import { BadgeTier } from "@/components/badge-tier";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

function ProfileContent() {
  const { user, logout, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put("/users/me", { display_name: displayName });
      await refreshUser();
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const tierProgress =
    user.badge_tier === "bronze"
      ? { current: user.total_points, max: 100, next: "Silver" }
      : user.badge_tier === "silver"
        ? { current: user.total_points - 100, max: 400, next: "Gold" }
        : { current: 1, max: 1, next: null };

  const progressPct = Math.min(
    (tierProgress.current / tierProgress.max) * 100,
    100,
  );

  return (
    <div className="min-h-screen bg-[#0e1a13] pb-24 md:pb-8">
      <AppNavbar />

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Profile header */}
        <div className="bg-gradient-to-br from-[#38e07b]/10 to-transparent border border-white/8 rounded-2xl p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-[#38e07b]/20 border-2 border-[#38e07b]/40 flex items-center justify-center text-3xl font-display font-700 text-[#38e07b] mx-auto mb-4">
            {user.display_name?.[0]?.toUpperCase() ||
              user.username[0].toUpperCase()}
          </div>

          {editing ? (
            <div className="flex items-center gap-2 justify-center mb-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-white text-center focus:outline-none focus:border-[#38e07b]/50 text-lg font-display"
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-[#38e07b] text-sm font-600 hover:underline"
              >
                {saving ? "..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setDisplayName(user.display_name || "");
                }}
                className="text-white/30 text-sm hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="font-display text-2xl font-700 text-white">
                {user.display_name || user.username}
              </h1>
              <button
                onClick={() => setEditing(true)}
                className="text-white/20 hover:text-white/50 text-sm transition-colors"
              >
                ✏️
              </button>
            </div>
          )}

          <p className="text-white/40 text-sm mb-4">@{user.username}</p>
          <BadgeTier tier={user.badge_tier} size="md" />

          {/* Progress to next tier */}
          {tierProgress.next && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/30 mb-1.5">
                <span>{user.total_points} pts</span>
                <span>→ {tierProgress.next}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#38e07b] rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Total Points",
              value: user.total_points.toLocaleString(),
              icon: "⭐",
            },
            {
              label: "Issues Reported",
              value: user.issues_reported ?? 0,
              icon: "📸",
            },
            {
              label: "Tasks Completed",
              value: user.tasks_completed ?? 0,
              icon: "✅",
            },
            {
              label: "Email",
              value: user.email_verified ? "Verified ✓" : "Not verified",
              icon: "📧",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/4 border border-white/8 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{stat.icon}</span>
                <span className="text-white/40 text-xs">{stat.label}</span>
              </div>
              <p className="font-display font-700 text-white text-lg">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Links */}
        <div className="space-y-2">
          {[
            {
              href: "/redeem",
              icon: "💰",
              label: "Redeem Points",
              sub: `${user.total_points} pts available`,
            },
            {
              href: "/payments",
              icon: "📊",
              label: "Payment History",
              sub: "Redemptions and withdrawals",
            },
            {
              href: "/profile/pledges",
              icon: "🤝",
              label: "My Pledges",
              sub: "Track your contributions",
            },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex items-center justify-between bg-white/4 border border-white/8 rounded-2xl p-4 hover:bg-white/6 hover:border-white/12 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {item.label}
                    </p>
                    <p className="text-white/30 text-xs">{item.sub}</p>
                  </div>
                </div>
                <span className="text-white/20">→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Email verification */}
        {!user.email_verified && (
          <Link href={`/verify-email?email=${encodeURIComponent(user.email)}`}>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex items-center justify-between">
              <p className="text-yellow-300 text-sm">
                Verify your email to unlock all features
              </p>
              <span className="text-yellow-300 text-sm font-600">→</span>
            </div>
          </Link>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full bg-white/4 border border-white/8 text-white/50 font-medium py-3 rounded-xl hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all"
        >
          Log out
        </button>
      </div>
      <BottomNav />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
