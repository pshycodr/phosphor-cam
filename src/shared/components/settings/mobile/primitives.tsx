import type { ReactNode } from "react";

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-green-400/70";

/** Horizontal strip that scrolls edge to edge inside the panel padding. */
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
  /** Use for chips that toggle a setting; omit for plain actions. */
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
      className={`flex min-h-10 shrink-0 snap-start items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold whitespace-nowrap transition-colors disabled:opacity-40 ${FOCUS} ${
        active
          ? "border-green-400 bg-green-500 text-black"
          : "border-green-500/30 bg-black/40 text-green-300 active:bg-green-900/40"
      }`}
    >
      {children}
    </button>
  );
}

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors motion-reduce:transition-none ${FOCUS} ${
        checked
          ? "border-green-400 bg-green-500"
          : "border-green-500/40 bg-black/50"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-[2px] left-[2px] size-5.5 rounded-full transition-transform motion-reduce:transition-none ${
          checked ? "translate-x-5 bg-black" : "translate-x-0 bg-green-400"
        }`}
      />
    </button>
  );
}

interface SegmentedProps<T extends string> {
  label: string;
  options: readonly { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
}

export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex gap-1 rounded-full border border-green-500/30 bg-black/40 p-1"
    >
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.key)}
            className={`min-h-10 flex-1 rounded-full px-3 text-xs font-bold tracking-wide uppercase transition-colors ${FOCUS} ${
              active
                ? "bg-green-500 text-black"
                : "text-green-400 active:bg-green-900/40"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
