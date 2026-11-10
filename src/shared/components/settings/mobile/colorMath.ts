export type RGB = { r: number; g: number; b: number };
export type HSV = { h: number; s: number; v: number };

export function hsvToRgb({ h, s, v }: HSV): RGB {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r: number, g: number, b: number;
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

export function rgbToHsv({ r, g, b }: RGB): HSV {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
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
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

export function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return { r: 0, g: 0, b: 0 };
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const to = (v: number) => v.toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export const hsvToHex = (hsv: HSV) => rgbToHex(hsvToRgb(hsv));
export const hexToHsv = (hex: string) => rgbToHsv(hexToRgb(hex));

/** Accepts "abc", "#abc", "aabbcc", "#AABBCC" and returns "#aabbcc", or null. */
export function normalizeHex(raw: string): string | null {
  let h = raw.trim().toLowerCase();
  if (!h.startsWith("#")) h = "#" + h;
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(h)) return null;
  return rgbToHex(hexToRgb(h));
}

export const sameColor = (a: string, b: string) =>
  a.toLowerCase() === b.toLowerCase();

/** Relative luminance (0..1), for contrast checks. */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function randomHex(): string {
  return hsvToHex({
    h: Math.random() * 360,
    s: 0.55 + Math.random() * 0.45,
    v: 0.55 + Math.random() * 0.45,
  });
}

/** Two vivid colors with enough luminance gap to stay readable. */
export function randomPair(): { foreground: string; background: string } {
  const MIN_GAP = 0.35;
  for (let attempt = 0; attempt < 20; attempt++) {
    const fg = randomHex();
    const bg = randomHex();
    if (Math.abs(luminance(fg) - luminance(bg)) >= MIN_GAP) {
      return { foreground: fg, background: bg };
    }
  }
  return { foreground: "#f5f5f5", background: randomHex() };
}
