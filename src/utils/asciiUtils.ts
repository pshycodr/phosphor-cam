/**
 * Pre-calculates a lookup table for brightness to character mapping
 */
export const createBrightnessMap = (chars: string): string[] => {
  const map: string[] = [];
  const len = chars.length;
  for (let i = 0; i < 256; i++) {
    const index = Math.floor((i / 256) * len);
    map[i] = chars[Math.min(index, len - 1)];
  }
  return map;
};

/**
 * Returns a cached brightness map for the given ramp, building it on first use.
 */
export const getBrightnessMap = (ramp: string) => {
  const brightnessMapCache = new Map<string, string[]>();
  let map = brightnessMapCache.get(ramp);
  if (!map) {
    map = createBrightnessMap(ramp);
    brightnessMapCache.set(ramp, map);
  }
  return map;
};

/**
 * Adjusts color values based on brightness and contrast settings.
 *
 * formula: factor * (color - 128) + 128 + brightness
 */
export const adjustColor = (
  val: number,
  contrast: number,
  brightness: number
): number => {
  const v = contrast * (val - 128) + 128 + brightness;
  return Math.max(0, Math.min(255, v));
};

/**
 * Maps a brightness value to its character, optionally inverting the ramp.
 */
export const getChar = (
  brightness: number,
  map: string[],
  invert: boolean
): string => {
  const index = invert ? 255 - brightness : brightness;
  // Clamp index just in case
  const safeIndex = Math.max(0, Math.min(255, Math.floor(index)));
  return map[safeIndex];
};

/**
 * Converts RGB to Grayscale Luminance
 */
export const getLuminance = (r: number, g: number, b: number): number => {
  return 0.299 * r + 0.587 * g + 0.114 * b;
};

interface GlyphAtlas {
  canvas: HTMLCanvasElement;
  cellSize: number;
  columnOf: Map<string, number>;
}

/**
 * Renders each unique glyph in a ramp into a single-row atlas canvas.
 */
function rasterizeAtlas(
  ramp: string,
  cellSize: number,
  fillStyle: string
): GlyphAtlas {
  const chars = Array.from(new Set(ramp));
  const atlas = document.createElement("canvas");
  atlas.width = Math.max(1, chars.length * cellSize);
  atlas.height = cellSize;

  const actx = atlas.getContext("2d");
  const columnOf = new Map<string, number>();
  if (!actx) return { canvas: atlas, cellSize, columnOf };

  actx.font = `${cellSize}px 'Fira Code', monospace`;
  actx.textBaseline = "top";
  actx.fillStyle = fillStyle;

  chars.forEach((ch, i) => {
    columnOf.set(ch, i);
    actx.fillText(ch, i * cellSize, 0);
  });

  return { canvas: atlas, cellSize, columnOf };
}

/**
 * Returns a cached atlas of glyphs tinted with the given color.
 */
export const getTintedAtlas = (
  ramp: string,
  cellSize: number,
  color: string
) => {
  const tintedAtlasCache = new Map<string, GlyphAtlas>();
  const key = `${ramp}|${cellSize}|${color}`;
  let atlas = tintedAtlasCache.get(key);
  if (!atlas) {
    atlas = rasterizeAtlas(ramp, cellSize, color);
    tintedAtlasCache.set(key, atlas);
  }
  return atlas;
};

/**
 * Returns a cached atlas of white glyphs for later runtime tinting.
 */
export const getWhiteAtlas = (ramp: string, cellSize: number) => {
  const whiteAtlasCache = new Map<string, GlyphAtlas>();
  const key = `${ramp}|${cellSize}`;
  let atlas = whiteAtlasCache.get(key);
  if (!atlas) {
    atlas = rasterizeAtlas(ramp, cellSize, "#ffffff");
    whiteAtlasCache.set(key, atlas);
  }
  return atlas;
};

/**
 * Draws a single glyph tinted to the given RGB color using the white atlas.
 */
export const drawTintedGlyph = (
  ctx: CanvasRenderingContext2D,
  whiteAtlas: GlyphAtlas,
  char: string,
  r: number,
  g: number,
  b: number,
  x: number,
  y: number,
  cellSize: number
) => {
  const scratch = document.createElement("canvas");
  const scratchCtx = scratch.getContext("2d");

  if (!scratchCtx) return;
  const col = whiteAtlas.columnOf.get(char);
  if (col === undefined) return;

  if (scratch.width !== cellSize || scratch.height !== cellSize) {
    scratch.width = cellSize;
    scratch.height = cellSize;
  }

  scratchCtx.globalCompositeOperation = "source-over";
  scratchCtx.clearRect(0, 0, cellSize, cellSize);
  scratchCtx.drawImage(
    whiteAtlas.canvas,
    col * cellSize,
    0,
    cellSize,
    cellSize,
    0,
    0,
    cellSize,
    cellSize
  );

  scratchCtx.globalCompositeOperation = "source-in";
  scratchCtx.fillStyle = `rgb(${r},${g},${b})`;
  scratchCtx.fillRect(0, 0, cellSize, cellSize);

  ctx.drawImage(scratch, x, y);
};
