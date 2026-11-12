import { type ReactNode, type RefObject } from "react";

import { FOCUS_RING, HIDE_WHEN_SHORT, IDLE_LABEL, SIDE_SIZE } from "./styles";

export const Label = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={`text-[9px] font-medium tracking-[0.16em] uppercase transition-colors ${HIDE_WHEN_SHORT} ${className}`}
  >
    {children}
  </span>
);

export const SideButton = ({
  ariaLabel,
  caption,
  captionClassName = IDLE_LABEL,
  active = false,
  disabled = false,
  className = "",
  buttonRef,
  onClick,
  children,
}: {
  ariaLabel: string;
  caption: string;
  captionClassName?: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  buttonRef?: RefObject<HTMLButtonElement | null>;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    ref={buttonRef}
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    className={`group flex flex-col items-center gap-1.5 rounded-2xl disabled:opacity-40 ${FOCUS_RING} ${className}`}
  >
    <span
      className={`flex items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 group-active:scale-95 ${SIDE_SIZE} ${
        active
          ? "border-signal/70 bg-signal/10 text-signal"
          : "border-line/80 bg-ink-2/70 text-muted group-hover:border-line-strong group-hover:bg-ink-3 group-hover:text-paper"
      }`}
    >
      {children}
    </span>
    <Label className={captionClassName}>
      <span aria-live="polite">{caption}</span>
    </Label>
  </button>
);

export const MiniButton = ({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    className={`press flex size-11 items-center justify-center rounded-full border border-line/80 bg-ink-2/85 text-muted backdrop-blur-md hover:border-line-strong hover:bg-ink-3 hover:text-paper disabled:opacity-40 ${FOCUS_RING}`}
  >
    {children}
  </button>
);
