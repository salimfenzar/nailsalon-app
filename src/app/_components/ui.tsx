import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

type Tone = "dark" | "light";

const primaryClass =
  "bg-charcoal text-atelier inline-flex items-center justify-center gap-3 rounded-sm px-8 py-4 text-xs font-medium tracking-[0.2em] uppercase transition-colors duration-300 hover:bg-[#2c2926]";

const outlineClass =
  "border-charcoal text-charcoal inline-flex items-center justify-center gap-3 rounded-sm border bg-transparent px-8 py-4 text-xs font-medium tracking-[0.2em] uppercase transition-colors duration-300 hover:bg-charcoal hover:text-atelier";

export function Wordmark({
  tone = "dark",
  size = "lg",
  align = "center",
}: {
  tone?: Tone;
  size?: "sm" | "lg";
  align?: "center" | "start";
}) {
  return (
    <div
      className={cx(
        "flex flex-col gap-2",
        align === "center" ? "items-center" : "items-start",
      )}
    >
      <span
        className={cx(
          "font-display leading-none font-normal tracking-[0.32em]",
          size === "lg" ? "text-[2.15rem]" : "text-lg",
          tone === "light" ? "text-atelier" : "text-charcoal",
        )}
      >
        NAILLAB
      </span>
      <Label
        className={cx(
          size === "sm" && "text-[0.6rem]",
          tone === "light" ? "text-atelier/50" : "text-charcoal/45",
        )}
      >
        Studio
      </Label>
    </div>
  );
}

/** The house micro-caps: every label, badge and button share this treatment. */
export function Label({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx("text-xs font-medium tracking-[0.2em] uppercase", className)}
    >
      {children}
    </span>
  );
}

export function Rule({ className }: { className?: string }) {
  return <div className={cx("bg-hairline h-px w-full", className)} />;
}

type ButtonProps = ComponentProps<"button"> & {
  icon?: ReactNode;
};

/** Square-edged and flat: weight comes from the fill, never from a shadow. */
export function PrimaryButton({
  children,
  icon,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cx(
        primaryClass,
        "flex w-full disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function OutlineButton({
  children,
  icon,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cx(
        outlineClass,
        "flex w-full disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function PrimaryLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cx(primaryClass, className)}>
      {children}
    </Link>
  );
}

export function OutlineLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cx(outlineClass, className)}>
      {children}
    </Link>
  );
}

export function OutlineAnchor({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a href={href} className={cx(outlineClass, className)}>
      {children}
    </a>
  );
}

/** Square hairline button for the header affordances (back, flip, close). */
export function IconButton({
  children,
  tone = "dark",
  className,
  ...props
}: ComponentProps<"button"> & { tone?: Tone }) {
  return (
    <button
      {...props}
      className={cx(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border transition-colors duration-300",
        tone === "light"
          ? "border-atelier/30 text-atelier/80 hover:border-atelier/70 hover:text-atelier"
          : "border-hairline text-charcoal/70 hover:border-charcoal hover:text-charcoal",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Selection chip for shapes and colour categories. */
export function Chip({
  children,
  active,
  className,
  ...props
}: ComponentProps<"button"> & { active: boolean }) {
  return (
    <button
      {...props}
      aria-pressed={active}
      className={cx(
        "shrink-0 rounded-sm border px-4 py-2.5 text-xs font-medium tracking-[0.2em] whitespace-nowrap uppercase",
        "transition-colors duration-300",
        active
          ? "border-charcoal bg-charcoal text-atelier"
          : "border-hairline text-charcoal/60 hover:border-charcoal hover:text-charcoal",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Stage({
  name,
  children,
  className,
}: {
  name: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-stage={name}
      className={cx("animate-fade relative flex min-h-dvh flex-col", className)}
    >
      {children}
    </div>
  );
}
