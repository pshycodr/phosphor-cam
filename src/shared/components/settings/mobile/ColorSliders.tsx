import { memo, useState } from "react";

import { type HSV, hexToHsv, hsvToHex, normalizeHex } from "./colorMath";
import EditorSlider from "./EditorSlider";

const HUE_GRADIENT =
  "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)";

interface ColorSlidersProps {
  value: string;
  onChange: (hex: string) => void;
  onCommit?: () => void;
}

/** Compact HSB picker: three gradient sliders and a hex field. */
const ColorSliders = ({ value, onChange, onCommit }: ColorSlidersProps) => {
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(value));
  const [hexInput, setHexInput] = useState(value);
  const [seen, setSeen] = useState(value);

  // External change (preset, swap, random): re-sync, but keep our hue when the
  // new value is just the color we emitted ourselves.
  if (value.toLowerCase() !== seen.toLowerCase()) {
    setSeen(value);
    if (value.toLowerCase() !== hsvToHex(hsv)) {
      setHsv(hexToHsv(value));
      setHexInput(value);
    }
  }

  const emit = (next: HSV) => {
    setHsv(next);
    const hex = hsvToHex(next);
    setHexInput(hex);
    onChange(hex);
  };

  const current = hsvToHex(hsv);

  const rows = [
    {
      key: "h",
      label: "H",
      name: "Hue",
      min: 0,
      max: 360,
      value: Math.round(hsv.h),
      text: `${Math.round(hsv.h)}°`,
      track: HUE_GRADIENT,
      set: (n: number) => emit({ ...hsv, h: n }),
    },
    {
      key: "s",
      label: "S",
      name: "Saturation",
      min: 0,
      max: 100,
      value: Math.round(hsv.s * 100),
      text: `${Math.round(hsv.s * 100)}`,
      track: `linear-gradient(to right, ${hsvToHex({ ...hsv, s: 0 })}, ${hsvToHex({ ...hsv, s: 1 })})`,
      set: (n: number) => emit({ ...hsv, s: n / 100 }),
    },
    {
      key: "v",
      label: "B",
      name: "Brightness",
      min: 0,
      max: 100,
      value: Math.round(hsv.v * 100),
      text: `${Math.round(hsv.v * 100)}`,
      track: `linear-gradient(to right, #000, ${hsvToHex({ ...hsv, v: 1 })})`,
      set: (n: number) => emit({ ...hsv, v: n / 100 }),
    },
  ];

  return (
    <div className="space-y-1">
      {rows.map((r) => (
        <div
          key={r.key}
          className="grid grid-cols-[1rem_1fr_2.5rem] items-center gap-2"
        >
          <span className="text-[11px] font-bold text-green-500/70">
            {r.label}
          </span>
          <EditorSlider
            label={r.name}
            min={r.min}
            max={r.max}
            value={r.value}
            valueText={r.text}
            trackBackground={r.track}
            accent={current}
            onChange={r.set}
            onCommit={onCommit}
          />
          <span className="text-right font-mono text-[11px] text-green-300/80 tabular-nums">
            {r.text}
          </span>
        </div>
      ))}

      <div className="flex items-center gap-2 pt-1">
        <span
          className="size-9 shrink-0 rounded-full border-2 border-green-500/40"
          style={{ backgroundColor: current }}
        />
        <input
          type="text"
          value={hexInput}
          maxLength={7}
          inputMode="text"
          enterKeyHint="done"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Hex color"
          onChange={(e) => {
            const raw = e.target.value;
            setHexInput(raw);
            if (/^#?[0-9a-f]{6}$/i.test(raw.trim())) {
              const hex = normalizeHex(raw);
              if (hex) {
                setHsv(hexToHsv(hex));
                onChange(hex);
              }
            }
          }}
          onBlur={(e) => {
            const hex = normalizeHex(e.target.value);
            if (hex) {
              setHsv(hexToHsv(hex));
              setHexInput(hex);
              onChange(hex);
              onCommit?.();
            } else {
              setHexInput(value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          className="h-10 min-w-0 flex-1 rounded-lg border border-green-500/40 bg-black/40 px-3 font-mono text-base text-green-300 uppercase outline-none focus:border-green-400"
        />
      </div>
    </div>
  );
};

export default memo(ColorSliders);
