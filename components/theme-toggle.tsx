"use client";

import { useTheme } from "next-themes";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * Which glyph shows is decided by CSS off the `.dark` class on <html>, not by
 * React state — so there is no mount flag, no hydration mismatch and no
 * cascading render. `resolvedTheme` is only read inside the click handler.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle colour theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "grid size-10 place-items-center rounded-full bg-surface-2 text-ink transition-colors hover:bg-border",
        className,
      )}
    >
      <Icon name="moon" size={17} className="block dark:hidden" />
      <Icon name="sun" size={17} className="hidden dark:block" />
    </button>
  );
}
