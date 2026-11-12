import type { ComponentPropsWithRef, ReactNode } from "react";

import { cx } from "./cx";

type Variant = "primary" | "signal" | "outline" | "ghost" | "quiet";
type Size = "sm" | "md" | "lg";

const BASE =
  "press inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap disabled:pointer-events-none disabled:opacity-40";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-paper text-ink hover:bg-white",
  signal: "bg-signal text-ink hover:bg-signal-soft",
  outline:
    "border border-line text-paper hover:border-line-strong hover:bg-ink-3",
  ghost: "text-muted hover:bg-ink-3 hover:text-paper",
  quiet: "text-faint hover:text-paper",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
};

interface ButtonProps extends ComponentPropsWithRef<"button"> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function Button({
  variant = "outline",
  size = "md",
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(BASE, VARIANTS[variant], SIZES[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

interface IconButtonProps extends ComponentPropsWithRef<"button"> {
  label: string;
  variant?: Variant;
  size?: "sm" | "md";
  children: ReactNode;
}

const ICON_SIZES = {
  sm: "size-9",
  md: "size-11",
};

export function IconButton({
  label,
  variant = "ghost",
  size = "md",
  className,
  children,
  type = "button",
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        BASE,
        VARIANTS[variant],
        ICON_SIZES[size],
        "rounded-full",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
