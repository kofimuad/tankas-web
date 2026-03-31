import Link from "next/link";
import { Issue } from "@/lib/api";

const difficultyStyle = {
  easy: "bg-green-500/15 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  hard: "bg-red-500/15 text-red-400 border-red-500/30",
};

const priorityStyle = {
  low: "bg-blue-500/15 text-blue-400",
  medium: "bg-orange-500/15 text-orange-400",
  high: "bg-red-500/15 text-red-400",
};

const statusStyle = {
  open: "bg-[#38e07b]/15 text-[#38e07b]",
  resolved: "bg-slate-500/15 text-slate-400",
  pending_review: "bg-yellow-500/15 text-yellow-400",
  rejected: "bg-red-500/15 text-red-400",
};

interface IssueCardProps {
  issue: Issue;
  compact?: boolean;
}

export function IssueCard({ issue, compact = false }: IssueCardProps) {
  return (
    <Link href={`/issues/${issue.id}`}>
      <div className="group bg-white/4 border border-white/8 rounded-2xl overflow-hidden hover:border-[#38e07b]/30 hover:bg-white/6 transition-all duration-300 cursor-pointer h-full">
        {/* Image */}
        <div
          className={`relative overflow-hidden ${compact ? "h-36" : "h-48"}`}
        >
          <img
            src={issue.picture_url || "/placeholder.jpg"}
            alt={issue.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

          {/* Bottom badges */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex gap-1.5">
              <span
                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                  difficultyStyle[issue.difficulty]
                }`}
              >
                {issue.difficulty}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  priorityStyle[issue.priority]
                }`}
              >
                {issue.priority}
              </span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#38e07b]/20 text-[#38e07b] font-600 border border-[#38e07b]/30">
              +{issue.points_assigned} pts
            </span>
          </div>
        </div>

        {/* Content */}
        <div className={`${compact ? "p-3" : "p-4"}`}>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-display font-600 text-white text-sm leading-snug line-clamp-2 flex-1">
              {issue.title}
            </h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                statusStyle[issue.status]
              }`}
            >
              {issue.status.replace("_", " ")}
            </span>
          </div>
          {!compact && (
            <p className="text-white/40 text-xs line-clamp-2 mt-1">
              {issue.description}
            </p>
          )}
          <p className="text-white/20 text-xs mt-2">
            {new Date(issue.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </Link>
  );
}
