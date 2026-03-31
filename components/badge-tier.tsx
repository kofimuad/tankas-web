interface BadgeTierProps {
  tier: "bronze" | "silver" | "gold";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const tierConfig = {
  bronze: {
    gradient: "from-amber-600 to-amber-800",
    text: "text-amber-100",
    label: "Bronze",
    emoji: "🥉",
    points: "0–100 pts",
  },
  silver: {
    gradient: "from-slate-300 to-slate-500",
    text: "text-slate-900",
    label: "Silver",
    emoji: "🥈",
    points: "101–500 pts",
  },
  gold: {
    gradient: "from-yellow-300 to-yellow-600",
    text: "text-yellow-900",
    label: "Gold",
    emoji: "🥇",
    points: "501+ pts",
  },
};

const sizeConfig = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
  lg: "text-base px-4 py-2",
};

export function BadgeTier({
  tier,
  size = "md",
  showLabel = true,
}: BadgeTierProps) {
  const config = tierConfig[tier];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-display font-600 bg-gradient-to-r ${config.gradient} ${config.text} ${sizeConfig[size]}`}
    >
      {config.emoji}
      {showLabel && config.label}
    </span>
  );
}
