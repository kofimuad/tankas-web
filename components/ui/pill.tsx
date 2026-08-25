import { cn } from "@/lib/utils";

/** A dot + label chip. Colour always travels with text, never alone. */
export function Pill({
  label,
  text,
  dot,
  soft,
  className,
}: {
  label: string;
  text: string;
  dot: string;
  soft: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-[5px] text-[11px] font-semibold tracking-[0.01em]",
        soft,
        text,
        className,
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", dot)} />
      {label}
    </span>
  );
}
