import { Icon } from "@/components/ui/icon";
import {
  formatPoints,
  nextTierLabel,
  pointsToNextTier,
  tierForPoints,
  TIER,
  tierProgress,
} from "@/lib/design";

/**
 * The points headline. Doubles as the tier-progress meter, so the two numbers
 * that drive the whole reward loop sit in one place.
 */
export function TierHero({ points }: { points: number }) {
  const tier = tierForPoints(points);
  const remaining = pointsToNextTier(points);
  const next = nextTierLabel(points);
  const pct = tierProgress(points);

  return (
    <section
      className="flex flex-col gap-3.5 rounded-xl p-[18px]"
      style={{
        background: "linear-gradient(160deg, #38e07b 0%, #12a85b 100%)",
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-on-primary/70">
            {TIER[tier].label} tier
          </p>
          <p className="flex items-baseline gap-1.5">
            <span className="numeric text-[34px] font-bold leading-none text-on-primary">
              {formatPoints(points)}
            </span>
            <span className="text-[13px] font-medium text-on-primary/70">pts</span>
          </p>
        </div>
        <span className="grid size-13 place-items-center rounded-full bg-on-primary/12">
          <Icon name="medal" size={26} className="text-on-primary" />
        </span>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-on-primary/15"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={next ? `Progress to ${next} tier` : "Highest tier reached"}
      >
        <div
          className="h-full rounded-full bg-on-primary transition-[width] duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs font-medium text-on-primary/75">
        {remaining && next
          ? `${formatPoints(remaining)} pts to ${next} tier`
          : "Highest tier reached"}
      </p>
    </section>
  );
}
