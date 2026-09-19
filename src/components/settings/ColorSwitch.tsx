import { memo } from "react";

interface ColorSwitchProps {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

const ColorSwitch = ({
  label,
  value,
  disabled,
  onChange,
}: ColorSwitchProps) => {
  return (
    <label
      className={`flex items-center justify-between rounded-lg border border-green-500/30 bg-black/30 px-3 py-2.5 ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <span className="text-xs font-medium text-green-400">{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-mono text-xs text-green-300/70">
          {value.toUpperCase()}
        </span>
        <span
          className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border-2 border-green-500/40"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            aria-label={`${label} color`}
          />
        </span>
      </span>
    </label>
  );
};

export default memo(ColorSwitch);
