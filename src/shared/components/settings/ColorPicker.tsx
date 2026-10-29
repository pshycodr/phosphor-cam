import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* ------------------------------ color math ------------------------------ */

type RGB = { r: number; g: number; b: number };
type HSV = { h: number; s: number; v: number };

function hsvToRgb({ h, s, v }: HSV): RGB {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r, g, b;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function rgbToHsv({ r, g, b }: RGB): HSV {
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  const n =
    h.length === 3
      ? parseInt(
          h
            .split("")
            .map((c) => c + c)
            .join(""),
          16
        )
      : parseInt(h, 16);
  if (Number.isNaN(n)) return { r: 0, g: 0, b: 0 };
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

function rgbToHex({ r, g, b }: RGB): string {
  const to = (v: number) => v.toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** Accepts "abc", "#abc", "aabbcc", "#AABBCC" -> "#aabbcc", or null. */
function normalizeHex(raw: string): string | null {
  let h = raw.trim().toLowerCase();
  if (!h.startsWith("#")) h = "#" + h;
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(h)) return null;
  return rgbToHex(hexToRgb(h));
}

/* ------------------------------ the wheel ------------------------------- */

/** Drawing buffer size. The canvas is displayed smaller (CSS), so it stays
 *  sharp on high-density phone screens. */
const WHEEL_PX = 480;

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  /** Optional heading. Leave out when the parent already labels the picker. */
  title?: string;
}

const ColorPicker = memo(function ColorPicker({
  value,
  onChange,
  title,
}: ColorPickerProps) {
  const wheelRef = useRef<HTMLCanvasElement>(null);
  const [hsv, setHsv] = useState<HSV>(() => rgbToHsv(hexToRgb(value)));
  const [hexInput, setHexInput] = useState(value);
  const [dragging, setDragging] = useState(false);

  // Sync external value (presets, random, swap) -> internal HSV.
  useEffect(() => {
    const currentHex = rgbToHex(hsvToRgb(hsv));
    if (value.toLowerCase() !== currentHex.toLowerCase()) {
      setHsv(rgbToHsv(hexToRgb(value)));
      setHexInput(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  /* Draw the hue/saturation wheel ONCE at full brightness.
     Brightness is applied with a black overlay (see JSX): rgb * v is exactly
     the same as multiplying by (1 - overlay opacity), so no redraws while the
     slider moves. */
  useLayoutEffect(() => {
    const canvas = wheelRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const radius = WHEEL_PX / 2;
    const img = ctx.createImageData(WHEEL_PX, WHEEL_PX);
    const data = img.data;

    for (let y = 0; y < WHEEL_PX; y++) {
      for (let x = 0; x < WHEEL_PX; x++) {
        const dx = x + 0.5 - radius;
        const dy = y + 0.5 - radius;
        const dist = Math.hypot(dx, dy);
        // 1px soft edge instead of a jagged circle
        const alpha = Math.min(1, Math.max(0, radius - dist));
        if (alpha === 0) continue;

        let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        if (angle < 0) angle += 360;
        const { r, g, b } = hsvToRgb({
          h: angle,
          s: Math.min(1, dist / radius),
          v: 1,
        });

        const i = (y * WHEEL_PX + x) * 4;
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = alpha * 255;
      }
    }

    ctx.putImageData(img, 0, 0);
  }, []);

  /* -------- commit helpers -------- */
  const commit = useCallback(
    (hex: string) => {
      setHsv(rgbToHsv(hexToRgb(hex)));
      setHexInput(hex);
      onChange(hex);
    },
    [onChange]
  );

  const emit = useCallback(
    (next: HSV) => {
      setHsv(next);
      const hex = rgbToHex(hsvToRgb(next));
      setHexInput(hex);
      onChange(hex);
    },
    [onChange]
  );

  /* -------- pointer handling on the wheel -------- */
  const setFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = wheelRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const radius = rect.width / 2;
      const dx = clientX - rect.left - radius;
      const dy = clientY - rect.top - radius;
      const dist = Math.min(radius, Math.hypot(dx, dy));
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (angle < 0) angle += 360;
      emit({ h: angle, s: dist / radius, v: hsv.v });
    },
    [emit, hsv.v]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
      setFromPointer(e.clientX, e.clientY);
    },
    [setFromPointer]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (dragging) setFromPointer(e.clientX, e.clientY);
    },
    [dragging, setFromPointer]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      setDragging(false);
    },
    []
  );

  /* -------- marker position (percent, so it scales with the wheel) -------- */
  const marker = useMemo(() => {
    const rad = (hsv.h * Math.PI) / 180;
    return {
      left: 50 + Math.cos(rad) * hsv.s * 50,
      top: 50 + Math.sin(rad) * hsv.s * 50,
    };
  }, [hsv.h, hsv.s]);

  const currentHex = useMemo(() => rgbToHex(hsvToRgb(hsv)), [hsv]);

  return (
    <div className="flex w-full flex-col gap-4">
      {title ? (
        <p className="text-xs font-semibold text-green-400">{title}</p>
      ) : null}

      {/* Wheel */}
      <div className="relative mx-auto aspect-square w-full max-w-60">
        <canvas
          ref={wheelRef}
          width={WHEEL_PX}
          height={WHEEL_PX}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          role="img"
          aria-label="Hue and saturation wheel"
          className="size-full cursor-crosshair touch-none rounded-full"
        />
        {/* Brightness overlay */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full bg-black"
          style={{ opacity: 1 - hsv.v }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.6)]"
          style={{
            left: `${marker.left}%`,
            top: `${marker.top}%`,
            backgroundColor: currentHex,
          }}
        />
      </div>

      {/* Brightness */}
      <div>
        <div className="mb-1.5 flex justify-between text-[11px] text-green-500/70">
          <span>Brightness</span>
          <span className="tabular-nums">{Math.round(hsv.v * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={hsv.v}
          onChange={(e) => emit({ ...hsv, v: +e.target.value })}
          className="settings-slider w-full"
          aria-label="Brightness"
        />
      </div>

      <div className="flex items-center gap-2">
        <span
          className="size-9 shrink-0 rounded-full border-2 border-green-500/40"
          style={{ backgroundColor: currentHex }}
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
          onChange={(e) => {
            const raw = e.target.value;
            setHexInput(raw);
            if (/^#?[0-9a-f]{6}$/i.test(raw.trim())) {
              const hex = normalizeHex(raw);
              if (hex) commit(hex);
            }
          }}
          onBlur={(e) => {
            const hex = normalizeHex(e.target.value);
            if (hex) commit(hex);
            else setHexInput(value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          className="h-10 min-w-0 flex-1 rounded-md border border-green-500/40 bg-black/40 px-3 font-mono text-base text-green-300 uppercase outline-none focus:border-green-400 sm:text-sm"
          aria-label="Hex color"
        />
      </div>
    </div>
  );
});

export default ColorPicker;
