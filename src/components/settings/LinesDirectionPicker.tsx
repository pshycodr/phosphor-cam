import { memo, type ReactNode, useCallback } from "react";
import { LuColumns3, LuRows3 } from "react-icons/lu";

import { useSettingsStore } from "@/store/settingsStore";

const FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-green-400/70";
const SIDE_SIZE = "size-14";
const ACTIVE_LABEL = "text-green-400";
const IDLE_LABEL = "text-gray-500 group-hover:text-green-400/80";

const Label = ({
  className = IDLE_LABEL,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <span
    className={`text-[10px] font-semibold tracking-wide transition-colors ${className}`}
  >
    {children}
  </span>
);

const SideButton = ({
  ariaLabel,
  caption,
  captionClassName = IDLE_LABEL,
  active = false,
  onClick,
  children,
}: {
  ariaLabel: string;
  caption: string;
  captionClassName?: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    className={`group flex flex-col items-center gap-1.5 rounded-2xl ${FOCUS_RING}`}
  >
    <span
      className={`flex items-center justify-center rounded-full border backdrop-blur transition-all group-active:scale-95 ${SIDE_SIZE} ${
        active
          ? "scale-110 border-green-400 bg-green-900/40 text-green-400"
          : "border-green-500/30 bg-black/40 text-green-500/60 group-hover:border-green-400 group-hover:bg-green-900/30 group-hover:text-green-400"
      }`}
    >
      {children}
    </span>
    <Label className={captionClassName}>
      <span aria-live="polite">{caption}</span>
    </Label>
  </button>
);

const LinesDirectionPicker = () => {
  const lineDirection = useSettingsStore((s) => s.settings.lineDirection);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const setHorizontal = useCallback(
    () => updateSettings({ lineDirection: "horizontal" }),
    [updateSettings]
  );
  const setVertical = useCallback(
    () => updateSettings({ lineDirection: "vertical" }),
    [updateSettings]
  );

  return (
    <div
      role="group"
      aria-label="Line direction"
      className="flex items-center justify-center gap-8 py-2"
    >
      <SideButton
        ariaLabel="Horizontal lines"
        caption="Horizontal"
        captionClassName={
          lineDirection === "horizontal" ? ACTIVE_LABEL : IDLE_LABEL
        }
        active={lineDirection === "horizontal"}
        onClick={setHorizontal}
      >
        <LuRows3 size={20} />
      </SideButton>

      <SideButton
        ariaLabel="Vertical lines"
        caption="Vertical"
        captionClassName={
          lineDirection === "vertical" ? ACTIVE_LABEL : IDLE_LABEL
        }
        active={lineDirection === "vertical"}
        onClick={setVertical}
      >
        <LuColumns3 size={20} />
      </SideButton>
    </div>
  );
};

export default memo(LinesDirectionPicker);
