import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Pill } from "@/components/ui/pill";
import {
  DIFFICULTY,
  PRIORITY,
  STATUS,
  type Difficulty,
  type IssueStatus,
  type Priority,
} from "@/lib/design";
import type { Issue } from "@/lib/api";
import { cn } from "@/lib/utils";

export function IssueCard({
  issue,
  distanceKm,
  className,
}: {
  issue: Issue;
  distanceKm?: number;
  className?: string;
}) {
  const status = STATUS[(issue.status as IssueStatus) ?? "open"] ?? STATUS.open;
  const priority =
    PRIORITY[(issue.priority as Priority) ?? "medium"] ?? PRIORITY.medium;
  const difficulty = DIFFICULTY[(issue.difficulty as Difficulty) ?? "medium"];

  return (
    <Link
      href={`/issues/${issue.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-primary-ink/40",
        className,
      )}
    >
      <div className="relative aspect-[358/150] w-full bg-surface-2">
        {issue.picture_url ? (
          <Image
            src={issue.picture_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 380px, 100vw"
            className="object-cover"
          />
        ) : (
          <span className="grid size-full place-items-center">
            <Icon name="leaf" size={26} className="text-ink-muted" />
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2.5 p-3.5">
        <div className="flex flex-wrap gap-1.5">
          <Pill label={status.label} {...pick(status)} />
          <Pill label={priority.label} {...pick(priority)} />
          {difficulty && <Pill label={difficulty.label} {...pick(difficulty)} />}
        </div>

        <h3 className="font-display text-base font-semibold leading-tight text-ink">
          {issue.title}
        </h3>

        <div className="flex items-center gap-3">
          {distanceKm !== undefined && (
            <span className="flex items-center gap-1 text-xs text-ink-muted">
              <Icon name="pin" size={13} />
              {distanceKm.toFixed(1)} km away
            </span>
          )}
          <span className="ml-auto flex items-center gap-1 rounded-full bg-primary-soft px-2 py-[3px] text-xs font-semibold text-primary-ink">
            <Icon name="zap" size={12} />
            {issue.points_assigned} pts
          </span>
        </div>
      </div>
    </Link>
  );
}

const pick = (s: { text: string; dot: string; soft: string }) => ({
  text: s.text,
  dot: s.dot,
  soft: s.soft,
});
