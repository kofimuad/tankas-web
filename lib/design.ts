/**
 * Design-system lookups shared by every screen.
 *
 * The tier thresholds and points formula mirror the backend
 * (`app/utils/points_calculator.py`) — keep them in sync if that file changes.
 */

export type Tier = "bronze" | "silver" | "gold";
export type Priority = "low" | "medium" | "high";
export type Difficulty = "easy" | "medium" | "hard";
export type IssueStatus = "open" | "pending_review" | "resolved" | "rejected";

type Swatch = { text: string; dot: string; soft: string; label: string };

export const STATUS: Record<IssueStatus, Swatch> = {
  open: {
    text: "text-status-open",
    dot: "bg-status-open",
    soft: "bg-primary-soft",
    label: "Open",
  },
  pending_review: {
    text: "text-status-review",
    dot: "bg-status-review",
    soft: "bg-surface-2",
    label: "In review",
  },
  resolved: {
    text: "text-status-resolved",
    dot: "bg-status-resolved",
    soft: "bg-surface-2",
    label: "Resolved",
  },
  rejected: {
    text: "text-status-rejected",
    dot: "bg-status-rejected",
    soft: "bg-surface-2",
    label: "Rejected",
  },
};

export const PRIORITY: Record<Priority, Swatch> = {
  low: { text: "text-prio-low", dot: "bg-prio-low", soft: "bg-surface-2", label: "Low" },
  medium: { text: "text-prio-med", dot: "bg-prio-med", soft: "bg-surface-2", label: "Medium" },
  high: { text: "text-prio-high", dot: "bg-prio-high", soft: "bg-surface-2", label: "High" },
};

export const DIFFICULTY: Record<Difficulty, Swatch> = {
  easy: { text: "text-diff-easy", dot: "bg-diff-easy", soft: "bg-surface-2", label: "Easy" },
  medium: { text: "text-diff-med", dot: "bg-diff-med", soft: "bg-surface-2", label: "Medium" },
  hard: { text: "text-diff-hard", dot: "bg-diff-hard", soft: "bg-surface-2", label: "Hard" },
};

export const TIER: Record<Tier, { label: string; ring: string; text: string }> = {
  bronze: { label: "Bronze", ring: "ring-tier-bronze", text: "text-tier-bronze" },
  silver: { label: "Silver", ring: "ring-tier-silver", text: "text-tier-silver" },
  gold: { label: "Gold", ring: "ring-tier-gold", text: "text-tier-gold" },
};

const TIER_FLOOR: Record<Tier, number> = { bronze: 0, silver: 101, gold: 501 };
const TIER_CEIL: Record<Tier, number | null> = { bronze: 101, silver: 501, gold: null };

export function tierForPoints(points: number): Tier {
  if (points >= 501) return "gold";
  if (points >= 101) return "silver";
  return "bronze";
}

/** Points still needed for the next tier, or null at gold. */
export function pointsToNextTier(points: number): number | null {
  const ceil = TIER_CEIL[tierForPoints(points)];
  return ceil === null ? null : Math.max(ceil - points, 0);
}

/** 0–100 progress through the current tier band. */
export function tierProgress(points: number): number {
  const tier = tierForPoints(points);
  const ceil = TIER_CEIL[tier];
  if (ceil === null) return 100;
  const floor = TIER_FLOOR[tier];
  return Math.min(Math.max(((points - floor) / (ceil - floor)) * 100, 0), 100);
}

export function nextTierLabel(points: number): string | null {
  const tier = tierForPoints(points);
  if (tier === "bronze") return "Silver";
  if (tier === "silver") return "Gold";
  return null;
}

export const formatPoints = (n: number) => n.toLocaleString();

export const formatKg = (n: number) =>
  n >= 100 ? n.toFixed(1) : n.toFixed(n % 1 === 0 ? 0 : 1);
