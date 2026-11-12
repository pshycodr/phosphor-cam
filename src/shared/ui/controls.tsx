import type { CSSProperties, ComponentPropsWithRef, ReactNode } from "react";

import { cx } from "./cx";

export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={cx(
        "relative h-6 w-10 shrink-0 rounded-full border transition-colors duration-150 before:absolute before:-inset-2.5 before:content-[''] disabled:opacity-40",
        checked
          ? "border-signal bg-signal"
          : "border-line-strong bg-ink-3 hover:border-faint"
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          "absolute top-1/2 left-[3px] size-4 -translate-y-1/2 rounded-full transition-transform duration-200 ease-[var(--ease-out)]",
          checked ? "translate-x-4 bg-ink" : "translate-x-0 bg-muted"
        )}
      />
    </button>
  );
}

interface SegmentedOption<T extends string> {
  key: T;
  label: ReactNode;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (key: T) => void;
  label: string;
  className?: string;
}) {
  const index = Math.max(
    0,
    options.findIndex((option) => option.key === value)
  );

  return (
    <div
      role="group"
      aria-label={label}
      className={cx(
        "relative grid rounded-full border border-line bg-ink-2 p-1",
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 rounded-full bg-paper transition-transform duration-200 ease-[var(--ease-out)]"
        style={{
          width: `calc((100% - 0.5rem) / ${options.length})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((option) => {
        const active = option.key === value;
        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.key)}
            className={cx(
              "relative z-10 flex min-h-9 items-center justify-center rounded-full px-3 text-xs font-medium transition-colors duration-150",
              active ? "text-ink" : "text-muted hover:text-paper"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function Field({
  label,
  value,
  children,
  hint,
  className,
}: {
  label: string;
  value?: ReactNode;
  children: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-muted">{label}</span>
        {value !== undefined && (
          <span className="font-mono text-[11px] text-paper tabular-nums">
            {value}
          </span>
        )}
      </div>
      {children}
      {hint && <p className="text-xs leading-relaxed text-faint">{hint}</p>}
    </div>
  );
}

export function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-faint">{children}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
    </div>
  );
}

interface RangeProps extends Omit<ComponentPropsWithRef<"input">, "type"> {
  value: number;
  min: number;
  max: number;
}

export function Range({ value, min, max, className, ...rest }: RangeProps) {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      className={cx("range", className)}
      style={{ "--range-pct": `${pct}%` } as CSSProperties}
      {...rest}
    />
  );
}
