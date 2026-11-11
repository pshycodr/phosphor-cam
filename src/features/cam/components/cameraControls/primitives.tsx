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
    className={`text-[10px] font-bold tracking-widest transition-colors md:text-[11px] ${HIDE_WHEN_SHORT} ${className}`}
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
    className={`group flex flex-col items-center gap-1.5 rounded-2xl disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING} ${className}`}
  >
    <span
      className={`flex items-center justify-center rounded-full border backdrop-blur transition-all group-active:scale-95 ${SIDE_SIZE} ${
        active
          ? "scale-110 border-green-400 bg-green-900/40"
          : "border-green-500/30 bg-black/40 group-hover:border-green-400 group-hover:bg-green-900/30"
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
    className={`flex size-11 items-center justify-center rounded-full border border-green-500/30 bg-black/60 text-white backdrop-blur transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING}`}
  >
    {children}
  </button>
);
