"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { AppNavbar } from "@/components/app-navbar";
import { BottomNav } from "@/components/bottom-nav";
import { BadgeTier } from "@/components/badge-tier";
import { leaderboardApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const TABS = [
  { key: "points", label: "Points", icon: "⭐" },
  { key: "issues_reported", label: "Issues", icon: "📸" },
  { key: "collections", label: "Collections", icon: "♻️" },
  { key: "kg_collected", label: "KG", icon: "⚖️" },
  { key: "volunteer_hours", label: "Hours", icon: "⏱️" },
];

function LeaderboardContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("points");
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    leaderboardApi
      .get(activeTab)
      .then((data) => setRankings(data?.rankings || []))
      .catch(() => setRankings([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const formatValue = (value: number) => {
    if (activeTab === "kg_collected") return `${value.toFixed(1)} kg`;
    if (activeTab === "volunteer_hours") return `${value.toFixed(1)}h`;
    return value.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-[#0e1a13] pb-24 md:pb-8">
      <AppNavbar />

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-700 text-white mb-1">
            Leaderboard
          </h1>
          <p className="text-white/40">Top performers in the community</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-[#38e07b] text-[#0e1a13] font-600"
                  : "bg-white/5 border border-white/10 text-white/50 hover:text-white"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Rankings */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white/4 rounded-2xl h-16 animate-pulse"
              />
            ))}
          </div>
        ) : rankings.length > 0 ? (
          <div className="space-y-2">
            {rankings.slice(0, 50).map((entry: any, i: number) => {
              const isCurrentUser = entry.user_id === user?.id;
              const rank = i + 1;
              const medal =
                rank === 1
                  ? "🥇"
                  : rank === 2
                    ? "🥈"
                    : rank === 3
                      ? "🥉"
                      : null;

              return (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    isCurrentUser
                      ? "bg-[#38e07b]/10 border-[#38e07b]/30"
                      : "bg-white/3 border-white/6 hover:bg-white/5"
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 text-center">
                    {medal ? (
                      <span className="text-xl">{medal}</span>
                    ) : (
                      <span className="font-display text-sm font-600 text-white/30">
                        #{rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-700 text-sm ${
                      isCurrentUser
                        ? "bg-[#38e07b]/30 text-[#38e07b]"
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    {entry.display_name?.[0]?.toUpperCase() ||
                      entry.username[0].toUpperCase()}
                  </div>

                  {/* Name + badge */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-display font-600 text-sm truncate ${isCurrentUser ? "text-white" : "text-white/80"}`}
                    >
                      {entry.display_name || entry.username}
                      {isCurrentUser && (
                        <span className="text-[#38e07b] text-xs ml-2">you</span>
                      )}
                    </p>
                    <BadgeTier
                      tier={entry.badge_tier || "bronze"}
                      size="sm"
                      showLabel={false}
                    />
                  </div>

                  {/* Value */}
                  <p
                    className={`font-display font-700 text-base ${isCurrentUser ? "text-[#38e07b]" : "text-white"}`}
                  >
                    {formatValue(entry.metric_value)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🏆</div>
            <p className="text-white/30">No rankings yet. Be the first!</p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <AuthGuard>
      <LeaderboardContent />
    </AuthGuard>
  );
}
