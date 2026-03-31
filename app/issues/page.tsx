"use client";

import { useState, useEffect } from "react";
import { AppNavbar } from "@/components/app-navbar";
import { BottomNav } from "@/components/bottom-nav";
import { IssueCard } from "@/components/issue-card";
import { AuthGuard } from "@/components/auth-guard";
import { issuesApi, Issue } from "@/lib/api";

const STATUSES = ["all", "open", "resolved", "pending_review"] as const;
const DIFFICULTIES = ["all", "easy", "medium", "hard"] as const;

function IssuesContent() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filtered, setFiltered] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [diffFilter, setDiffFilter] = useState<string>("all");

  useEffect(() => {
    issuesApi
      .getAll()
      .then((data) => {
        setIssues(data);
        setFiltered(data.filter((i) => i.status === "open"));
      })
      .catch(() => setIssues([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...issues];
    if (statusFilter !== "all")
      result = result.filter((i) => i.status === statusFilter);
    if (diffFilter !== "all")
      result = result.filter((i) => i.difficulty === diffFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q),
      );
    }
    setFiltered(result);
  }, [issues, statusFilter, diffFilter, search]);

  return (
    <div className="min-h-screen bg-[#0e1a13] pb-24 md:pb-8">
      <AppNavbar />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-700 text-white mb-1">
            All Issues
          </h1>
          <p className="text-white/40">
            {filtered.length} issue{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#38e07b]/50 transition-colors"
          />

          <div className="flex gap-2 flex-wrap">
            {/* Status filters */}
            <div className="flex gap-2 flex-wrap">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    statusFilter === s
                      ? "bg-[#38e07b] border-[#38e07b] text-[#0e1a13] font-600"
                      : "border-white/10 text-white/40 hover:text-white hover:border-white/20"
                  }`}
                >
                  {s === "pending_review"
                    ? "Pending"
                    : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            <div className="w-px bg-white/10 hidden md:block" />

            {/* Difficulty filters */}
            <div className="flex gap-2 flex-wrap">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDiffFilter(d)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    diffFilter === d
                      ? "bg-white/15 border-white/30 text-white font-600"
                      : "border-white/10 text-white/40 hover:text-white hover:border-white/20"
                  }`}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Issues grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white/4 rounded-2xl h-64 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-white/40 text-lg">
              No issues match your filters.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setDiffFilter("all");
              }}
              className="text-[#38e07b] text-sm mt-3 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default function IssuesPage() {
  return (
    <AuthGuard>
      <IssuesContent />
    </AuthGuard>
  );
}
