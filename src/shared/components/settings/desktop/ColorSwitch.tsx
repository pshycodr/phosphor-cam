import { memo, useId, useState } from "react";
import { LuChevronDown } from "react-icons/lu";

import Collapse from "../common/Collapse";
import ColorSliders from "../common/ColorSliders";

interface ColorSwitchProps {
  label: string;
  value: string;
  open: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
  onCommit?: () => void;
}

const ColorSwitch = ({
  label,
  value,
  open,
  onToggle,
  onChange,
  onCommit,
}: ColorSwitchProps) => {
  const panelId = useId();

  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);

  return (
    <div
      className={`overflow-hidden rounded-lg border bg-ink-3/40 transition-colors ${
        open ? "border-line-strong" : "border-line/80"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex min-h-11 w-full items-center justify-between gap-3 px-3 text-left transition-colors hover:bg-ink-3"
      >
        <span className="text-[11px] text-muted">{label}</span>
        <span className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-faint uppercase">
            {value}
          </span>
          <span
            className="size-5 shrink-0 rounded-full border border-line-strong"
            style={{ backgroundColor: value }}
          />
          <LuChevronDown
            size={13}
            aria-hidden="true"
            className={`shrink-0 text-faint transition-transform duration-200 ease-[var(--ease-out)] motion-reduce:transition-none ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      <Collapse id={panelId} open={open}>
        <div className="px-3 pt-1 pb-3">
          {mounted && (
            <ColorSliders
              value={value}
              onChange={onChange}
              onCommit={onCommit}
            />
          )}
        </div>
      </Collapse>
    </div>
  );
};

export default memo(ColorSwitch);
