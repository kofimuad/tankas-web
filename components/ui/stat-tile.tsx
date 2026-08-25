import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function StatTile({
  icon,
  value,
  label,
  className,
}: {
  icon: IconName;
  value: string | number;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-lg border border-border bg-surface p-4",
        className,
      )}
    >
      <Icon name={icon} size={18} className="text-primary-ink" />
      <p className="numeric text-2xl font-bold leading-none text-ink">{value}</p>
      <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-ink-muted">
        {label}
      </p>
    </div>
  );
}
