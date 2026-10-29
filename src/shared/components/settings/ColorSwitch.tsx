import { memo, useId, useState } from "react";
import { LuChevronDown } from "react-icons/lu";

import Collapse from "./Collapse";
import ColorPicker from "./ColorPicker";

interface ColorSwitchProps {
  label: string;
  value: string;
  open: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}

const ColorSwitch = ({
  label,
  value,
  open,
  onToggle,
  onChange,
}: ColorSwitchProps) => {
  const panelId = useId();

  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);

  return (
    <div
      className={`overflow-hidden rounded-lg border bg-black/30 transition-colors ${
        open ? "border-green-400/60" : "border-green-500/30"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex min-h-12 w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors outline-none hover:bg-green-900/20 focus-visible:ring-2 focus-visible:ring-green-400/70 focus-visible:ring-inset"
      >
        <span className="text-xs font-medium text-green-400">{label}</span>
        <span className="flex items-center gap-2">
          <span className="font-mono text-xs text-green-300/70 uppercase">
            {value}
          </span>
          <span
            className="size-6 shrink-0 rounded-full border-2 border-green-500/40"
            style={{ backgroundColor: value }}
          />
          <LuChevronDown
            size={14}
            aria-hidden="true"
            className={`shrink-0 text-green-500/60 transition-transform duration-200 motion-reduce:transition-none ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      <Collapse id={panelId} open={open}>
        <div className="px-3 pt-2 pb-4">
          {mounted && <ColorPicker value={value} onChange={onChange} />}
        </div>
      </Collapse>
    </div>
  );
};

export default memo(ColorSwitch);
