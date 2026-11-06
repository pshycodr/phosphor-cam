import type { Ctx2D, SpriteAtlas } from "@/shared/types";

import { adjustColor, getLuminance } from "./asciiUtils";

/** Draws one white dot: solid core with a short fade at the edge. */
export function paintDot(ctx: Ctx2D, cx: number, cy: number, radius: number) {
  const g = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.75, "rgba(255,255,255,1)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}

/** Pre-renders every dot size into one horizontal strip of sprites. Level 0 is empty. */
export function buildWhiteAtlas(cell: number, DOT_LEVELS: number): SpriteAtlas {
  // Biggest dots overlap neighbours slightly, like ink bleed.
  const radiusMax = cell * 0.62;

  // Room around the dot for the soft edge and antialiasing.
  const padding = Math.max(2, Math.ceil(cell * 0.15));

  // Sprite must fit the biggest dot plus padding.
  const spriteSize = Math.ceil(
    Math.max(cell + padding * 2, radiusMax * 2 + padding * 2)
  );
  const center = spriteSize / 2;

  const canvas = new OffscreenCanvas(spriteSize * DOT_LEVELS, spriteSize);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("halftone: atlas ctx");

  const radii = new Float32Array(DOT_LEVELS);
  const xs = new Int32Array(DOT_LEVELS);

  for (let i = 0; i < DOT_LEVELS; i++) {
    const t = i / (DOT_LEVELS - 1);
    const r = t * radiusMax;
    radii[i] = r;
    const x = i * spriteSize;
    xs[i] = x;
    // Skip invisible specks.
    if (r > 0.1) {
      paintDot(ctx, x + center, center, r);
    }
  }

  return { canvas, radii, cell: spriteSize, xs, padding };
}

/** Recolors a whole white atlas once, keeping drawImage cheap during render. */
export function tintAtlasSolid(
  source: SpriteAtlas,
  color: string
): SpriteAtlas {
  const canvas = new OffscreenCanvas(source.canvas.width, source.canvas.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("halftone: tint ctx");

  ctx.drawImage(source.canvas, 0, 0);
  // source-in keeps alpha but swaps color.
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "source-over";

  return {
    canvas,
    radii: source.radii,
    cell: source.cell,
    xs: source.xs,
    padding: source.padding,
  };
}

// Module-level caches: must persist across calls.
// Keys use cellSize only since DOT_LEVELS is constant.
const whiteAtlasCache = new Map<number, SpriteAtlas>();
const tintedAtlasCache = new Map<string, SpriteAtlas>();
let colorLut: (string | undefined)[] | null = null;

/** Gets the cached white atlas for a cell size, building it if needed. */
export const getWhiteAtlas = (cellSize: number, DOT_LEVELS: number) => {
  let atlas = whiteAtlasCache.get(cellSize);
  if (!atlas) {
    atlas = buildWhiteAtlas(cellSize, DOT_LEVELS);
    whiteAtlasCache.set(cellSize, atlas);
  }
  return atlas;
};

/** Gets a cached solid-color atlas, keyed by size + color. Never evicted. */
export const getTintedAtlas = (
  cellSize: number,
  color: string,
  DOT_LEVELS: number
): SpriteAtlas => {
  const key = `${cellSize}|${color}`;
  let atlas = tintedAtlasCache.get(key);
  if (!atlas) {
    atlas = tintAtlasSolid(getWhiteAtlas(cellSize, DOT_LEVELS), color);
    tintedAtlasCache.set(key, atlas);
  }
  return atlas;
};

/** Returns a cached "rgb(r,g,b)" string with channels quantized to COLOR_LUT_BITS. */
export const getColorString = (
  r: number,
  g: number,
  b: number,
  COLOR_LUT_SIZE: number,
  COLOR_LUT_SHIFT: number,
  COLOR_LUT_BITS: number
): string => {
  if (!colorLut || colorLut.length !== COLOR_LUT_SIZE) {
    colorLut = new Array<string | undefined>(COLOR_LUT_SIZE);
  }

  const qr = r >> COLOR_LUT_SHIFT;
  const qg = g >> COLOR_LUT_SHIFT;
  const qb = b >> COLOR_LUT_SHIFT;
  const idx = (qr << (COLOR_LUT_BITS * 2)) | (qg << COLOR_LUT_BITS) | qb;

  let s = colorLut[idx];
  if (s === undefined) {
    const er = qr << COLOR_LUT_SHIFT;
    const eg = qg << COLOR_LUT_SHIFT;
    const eb = qb << COLOR_LUT_SHIFT;
    s = `rgb(${er},${eg},${eb})`;
    colorLut[idx] = s;
  }
  return s;
};

// Scratch canvas for the legacy per-dot tint path (still used by capture).
const tintCanvas = new OffscreenCanvas(1, 1);
const tintCtx = tintCanvas.getContext("2d");

/* ------------------------- colorMode layers ---------------------------- */

// Dots are drawn here as a white alpha mask, then recolored in one pass.
let maskCanvas: OffscreenCanvas | null = null;
let maskCtx: OffscreenCanvasRenderingContext2D | null = null;

// The low-res frame, kept so it can be stretched over the dot mask.
let gridCanvas: OffscreenCanvas | null = null;
let gridCtx: OffscreenCanvasRenderingContext2D | null = null;

/** Returns a cleared, full-frame alpha mask sized to the output. */
export const getMaskLayer = (width: number, height: number) => {
  if (
    !maskCanvas ||
    maskCanvas.width !== width ||
    maskCanvas.height !== height
  ) {
    maskCanvas = new OffscreenCanvas(width, height);
    maskCtx = maskCanvas.getContext("2d");
  }
  if (!maskCtx) throw new Error("halftone: mask ctx");

  maskCtx.setTransform(1, 0, 0, 1, 0, 0);
  maskCtx.globalAlpha = 1;
  maskCtx.globalCompositeOperation = "source-over";
  maskCtx.clearRect(0, 0, width, height);

  return { canvas: maskCanvas, ctx: maskCtx };
};

/** Returns the cached grid canvas holding this frame's pixels. */
export const getGridLayer = (imageData: ImageData) => {
  if (
    !gridCanvas ||
    gridCanvas.width !== imageData.width ||
    gridCanvas.height !== imageData.height
  ) {
    gridCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    gridCtx = gridCanvas.getContext("2d");
  }
  if (!gridCtx) throw new Error("halftone: grid ctx");

  gridCtx.putImageData(imageData, 0, 0);

  return gridCanvas;
};

/**
 * Recolors an alpha dot mask in one pass: the frame is drawn with
 * `source-in`, so it only lands where a dot exists. Nearest-neighbor keeps
 * each dot flat-tinted by its own source pixel (matching the old per-dot
 * tint) and avoids interpolation work.
 */
export const colorizeMask = (
  ctx: OffscreenCanvasRenderingContext2D,
  frame: CanvasImageSource,
  width: number,
  height: number
) => {
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-in";
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(frame, 0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";
  ctx.imageSmoothingEnabled = true;
};

/** Fast path: copies an already-correctly-colored sprite, offset by padding. */
export const blitSprite = (
  ctx: Ctx2D,
  atlas: SpriteAtlas,
  level: number,
  dx: number,
  dy: number
) => {
  const sx = atlas.xs[level];
  const px = dx - atlas.padding;
  const py = dy - atlas.padding;
  ctx.drawImage(
    atlas.canvas,
    sx,
    0,
    atlas.cell,
    atlas.cell,
    px,
    py,
    atlas.cell,
    atlas.cell
  );
};

/** Slow path: copies white sprite to scratch, tints it, then draws it. */
export const blitTintedSprite = (
  ctx: Ctx2D,
  whiteAtlas: SpriteAtlas,
  level: number,
  dx: number,
  dy: number,
  color: string
) => {
  if (!tintCtx) return;
  const sx = whiteAtlas.xs[level];
  const px = dx - whiteAtlas.padding;
  const py = dy - whiteAtlas.padding;

  if (
    tintCanvas.width !== whiteAtlas.cell ||
    tintCanvas.height !== whiteAtlas.cell
  ) {
    tintCanvas.width = whiteAtlas.cell;
    tintCanvas.height = whiteAtlas.cell;
  }

  tintCtx.globalCompositeOperation = "source-over";
  tintCtx.clearRect(0, 0, whiteAtlas.cell, whiteAtlas.cell);
  tintCtx.drawImage(
    whiteAtlas.canvas,
    sx,
    0,
    whiteAtlas.cell,
    whiteAtlas.cell,
    0,
    0,
    whiteAtlas.cell,
    whiteAtlas.cell
  );

  tintCtx.globalCompositeOperation = "source-in";
  tintCtx.fillStyle = color;
  tintCtx.fillRect(0, 0, whiteAtlas.cell, whiteAtlas.cell);
  tintCtx.globalCompositeOperation = "source-over";

  ctx.drawImage(tintCanvas, px, py);
};

/** Converts a pixel to a dot level, shared by render and capture. */
export const computeLevel = (
  r: number,
  g: number,
  b: number,
  contrast: number,
  brightness: number,
  invert: boolean,
  DOT_LEVELS: number
): number => {
  const l = adjustColor(getLuminance(r, g, b), contrast, brightness);
  let t = l / 255;
  if (invert) t = 1 - t;
  return Math.min(
    DOT_LEVELS - 1,
    Math.max(0, Math.round(t * (DOT_LEVELS - 1)))
  );
};
