interface ColorSwitchProps {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function ColorSwitch({
  label,
  value,
  disabled,
  onChange,
}: ColorSwitchProps) {
  return (
    <label
      className={`flex items-center justify-between rounded-lg border border-green-500/40 bg-black/40 px-3 py-2.5 ${
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
      }`}
    >
      <span className="text-xs font-semibold tracking-wider text-green-400 uppercase">
        {label}
      </span>
      <span className="flex items-center gap-2">
        <span className="font-mono text-xs text-green-300/80">
          {value.toUpperCase()}
        </span>
        <span
          className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border-2 border-green-500/50 shadow-[0_0_8px_rgba(34,197,94,0.35)]"
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
}
