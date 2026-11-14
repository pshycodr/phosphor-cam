import type { ReactNode } from "react";

import { Segmented, Switch } from "@/shared/ui/controls";

export { Segmented, Switch };

export function ScrollRow({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  );
}

interface ChipProps {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
  pressed?: boolean;
  ariaLabel?: string;
}

export function Chip({
  active = false,
  disabled,
  onClick,
  children,
  pressed,
  ariaLabel,
}: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      aria-label={ariaLabel}
      className={`press flex min-h-11 shrink-0 snap-start items-center gap-1.5 rounded-full border px-3.5 text-[11px] font-medium whitespace-nowrap disabled:opacity-40 ${
        active
          ? "border-signal/60 bg-signal/10 text-signal"
          : "border-line/80 bg-ink-3/60 text-muted hover:border-line-strong hover:text-paper"
      }`}
    >
      {children}
    </button>
  );
}
