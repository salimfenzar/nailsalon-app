import type { ComponentProps, ReactNode } from "react";

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function Wordmark({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span
        className={cx(
          "font-display text-[1.75rem] leading-none font-light tracking-[0.3em]",
          tone === "light" ? "text-porcelain" : "text-espresso",
        )}
      >
        LUMIÈRE
      </span>
      <span
        className={cx(
          "text-[0.5rem] tracking-luxe uppercase",
          tone === "light" ? "text-porcelain/60" : "text-mocha/70",
        )}
      >
        Nail Atelier
      </span>
    </div>
  );
}

export function Eyebrow({
  children,
  tone = "dark",
  className,
}: {
  children: ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <span
      className={cx(
        "text-[0.625rem] tracking-luxe uppercase",
        tone === "light" ? "text-porcelain/65" : "text-mocha",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Hairline({ className }: { className?: string }) {
  return (
    <div
      className={cx(
        "via-champagne h-px w-full bg-gradient-to-r from-transparent to-transparent",
        className,
      )}
    />
  );
}

type ButtonProps = ComponentProps<"button"> & {
  icon?: ReactNode;
};

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
        "group bg-espresso text-porcelain relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full px-8 py-4",
        "text-[0.7rem] tracking-luxe uppercase transition-all duration-300",
        "hover:bg-ink active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45",
        "shadow-[0_18px_40px_-24px_rgba(33,26,21,0.9)]",
        className,
      )}
    >
      <span className="via-champagne/25 pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      {icon}
      <span className="relative">{children}</span>
    </button>
  );
}

export function GhostButton({
  children,
  icon,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cx(
        "text-mocha hover:text-espresso flex w-full items-center justify-center gap-2.5 rounded-full px-6 py-3.5",
        "border-sand hover:border-champagne border text-[0.65rem] tracking-luxe uppercase",
        "transition-colors duration-300 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45",
        className,
      )}
    >
      {icon}
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
