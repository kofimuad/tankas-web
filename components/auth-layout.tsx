import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/theme-toggle";

/** Shared chrome for the signed-out screens: brand mark, title, card body. */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-7 px-6 pb-16">
        <div className="flex flex-col items-center gap-3.5">
          <Link
            href="/"
            aria-label="Tankas home"
            className="grid size-16 place-items-center rounded-2xl bg-primary"
          >
            <Icon name="leaf" size={32} className="text-on-primary" />
          </Link>
          <h1 className="font-display text-[30px] font-extrabold tracking-[-0.02em] text-ink">
            {title}
          </h1>
          <p className="text-center text-[13px] text-ink-muted">{subtitle}</p>
        </div>

        {children}

        {footer && (
          <div className="flex items-center justify-center gap-1.5 text-[13px]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function AuthField({
  label,
  icon,
  children,
  trailing,
}: {
  label: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold tracking-[0.04em] text-ink-muted">
        {label}
      </span>
      <span className="flex items-center gap-2.5 rounded-md border border-border bg-surface px-3.5 py-3.5 focus-within:border-primary">
        <Icon name={icon} size={17} className="shrink-0 text-ink-muted" />
        {children}
        {trailing}
      </span>
    </label>
  );
}

export const authInputClass =
  "min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted";

export const authButtonClass =
  "flex h-13 w-full items-center justify-center rounded-md bg-primary text-[15px] font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60";
