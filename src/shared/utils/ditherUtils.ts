/**
 * Threshold below which a value is quantized to 0 (black) during dithering.
 * Anything >= this becomes 255 (white).
 */
export const DITHER_THRESHOLD = 128;

/**
 * This implementation:
 *
 * - Processes the image from left to right and top to bottom.
 * - Thresholds every pixel to either 0 or 255.
 * - Stores the quantized value in `output`.
 * - Calculates the difference between the original and quantized value.
 * - Distributes that error to the right, bottom-left, bottom, and
 *   bottom-right pixels using the Floyd-Steinberg weights.
 * - Mutates `data` in place so each subsequent pixel receives the
 *   accumulated error from previously processed pixels.
 *
 * Boundary checks prevent error from being written outside the image.
 *
 * `data` contains the working grayscale values.
 * `output` contains the final binary image.
 */
export function floydSteinbergDither(
  data: Float32Array<ArrayBuffer>,
  width: number,
  height: number,
  output: Uint8Array<ArrayBuffer>
): void {
  const w = width;
  const h = height;

  for (let y = 0, idx = 0; y < h; y++) {
    for (let x = 0; x < w; x++, idx++) {
      const oldVal = data[idx];
      const newVal = oldVal < DITHER_THRESHOLD ? 0 : 255;
      output[idx] = newVal;

      const error = oldVal - newVal;

      // Precompute the weighted error terms
      const e7 = error * (7 / 16);
      const e3 = error * (3 / 16);
      const e5 = error * (5 / 16);
      const e1 = error * (1 / 16);

      // Right
      if (x + 1 < w) data[idx + 1] += e7;

      // Row below
      if (y + 1 < h) {
        const below = idx + w;
        if (x > 0) data[below - 1] += e3;
        data[below] += e5;
        if (x + 1 < w) data[below + 1] += e1;
      }
    }
  }
}

/** Packs a 0/255-per-channel RGB triplet into a single 24-bit integer. */
export function packRgb(r: number, g: number, b: number): number {
  return (r << 16) | (g << 8) | b;
}

/** Returns a Float32Array of the requested size, reusing `buf` when possible. */
export function ensureFloat(
  buf: Float32Array<ArrayBuffer>,
  size: number
): Float32Array<ArrayBuffer> {
  return buf.length === size ? buf : new Float32Array(size);
}

/** Returns a Uint8Array of the requested size, reusing `buf` when possible. */
export function ensureUint8(
  buf: Uint8Array<ArrayBuffer>,
  size: number
): Uint8Array<ArrayBuffer> {
  return buf.length === size ? buf : new Uint8Array(size);
}

// Cache for `rgb(r,g,b)` strings — at most 8 combinations in the typical
// 0/255-per-channel case after dithering.
export const getRgbString = (packed: number): string => {
  const rgbStringCache = new Map<number, string>();

  let s = rgbStringCache.get(packed);
  if (s === undefined) {
    const r = (packed >> 16) & 0xff;
    const g = (packed >> 8) & 0xff;
    const b = packed & 0xff;
    s = `rgb(${r},${g},${b})`;
    rgbStringCache.set(packed, s);
  }
  return s;
};

/**
 * Parses a `#rgb` or `#rrggbb` hex color into an [r, g, b] tuple.
 * Falls back to black for malformed input.
 */
export function hexToRgb(hex: string): [number, number, number] {
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
  if (Number.isNaN(n)) return [0, 0, 0];
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}
