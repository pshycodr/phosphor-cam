import { runEffectPipeline } from "@/core/pipeline/effects";
import type { Ctx2D, RendererFactory, SpriteAtlas } from "@/shared/types";
import {
  blitSprite,
  blitTintedSprite,
  colorizeMask,
  computeLevel,
  getColorString,
  getGridLayer,
  getMaskLayer,
  getTintedAtlas,
  getWhiteAtlas,
} from "@/shared/utils/halftoneUtils";

// Number of dot sizes in the atlas. Level 0 means no dot and is skipped.
const DOT_LEVELS = 64;

// colorMode strings are built from 5 bits per channel, which caps the
// cache at 32k entries instead of 16M.
const COLOR_LUT_BITS = 5;
const COLOR_LUT_SHIFT = 8 - COLOR_LUT_BITS;
const COLOR_LUT_SIZE = 1 << (COLOR_LUT_BITS * 3);

/**
 * Halftone Renderer
 *
 * Recreates an image as a grid of dots whose size encodes pixel brightness,
 * like a printed halftone screen. Brighter pixels produce larger dots and
 * darker pixels produce smaller ones (flipped when `invert` is on).
 *
 * How it works:
 * - The source image is sampled once per dot cell (one pixel per dot).
 * - Each pixel's luminance is adjusted by contrast/brightness, then mapped
 *   to one of DOT_LEVELS dot sizes (0 = no dot, drawn as background only).
 * - Dots are laid out in a brick pattern: odd rows are shifted right by half
 *   a cell, which breaks up visible vertical seams.
 * - Dot sprites are pre-rendered into a shared atlas (see halftoneUtils) so
 *   drawing is just a drawImage per dot.
 * - In solid mode the whole atlas is tinted once for the foreground color.
 * - In colorMode the dots are drawn once into an alpha mask, then the frame
 *   is painted through that mask in a single pass. That keeps each dot's real
 *   color without tinting thousands of sprites per frame.
 * - `invert` swaps the foreground/background colors as well as the dot
 *   mapping, so the result reads as a true negative.
 */

/** Draws every visible dot sprite from an atlas at the brick layout. */
function drawDots(
  ctx: Ctx2D,
  atlas: SpriteAtlas,
  pixels: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  cellSize: number,
  contrast: number,
  brightness: number,
  invert: boolean
) {
  const rowOffset = cellSize * 0.5;

  for (let y = 0; y < srcH; y++) {
    const yOff = (y & 1) === 1 ? rowOffset : 0;
    const yBase = y * cellSize;

    for (let x = 0; x < srcW; x++) {
      const i = y * srcW + x;
      const p = i * 4;
      const r = pixels[p];
      const g = pixels[p + 1];
      const b = pixels[p + 2];

      const level = computeLevel(
        r,
        g,
        b,
        contrast,
        brightness,
        invert,
        DOT_LEVELS
      );
      // Background fill already covers level 0.
      if (level === 0) continue;

      blitSprite(ctx, atlas, level, x * cellSize + yOff, yBase);
    }
  }
}

export const createHalftoneRenderer: RendererFactory = (canvas) => {
  return {
    render(imageData, ctx, settings, cellSize) {
      const { width: srcW, height: srcH, data: pixels } = imageData;
      const { contrast, brightness, colorMode, invert } = settings;
      const { foreground, background } = settings.color;

      // Invert swaps the colors too, so it reads as a real negative.
      const bgColor = invert ? foreground : background;
      const dotColor = invert ? background : foreground;

      // Odd rows shift right by half a cell (brick layout), so add room.
      const outW = srcW * cellSize + Math.ceil(cellSize * 0.5);
      const outH = srcH * cellSize;

      // Setting width/height wipes the canvas and resets ctx state.
      if (canvas.width !== outW || canvas.height !== outH) {
        canvas.width = outW;
        canvas.height = outH;
      }

      if (colorMode) {
        // Draw the dots once as an alpha mask, colorize it with the frame,
        // then lay it over the background. Three full-frame draws total.
        const { canvas: maskCanvas, ctx: maskCtx } = getMaskLayer(outW, outH);
        drawDots(
          maskCtx,
          getWhiteAtlas(cellSize, DOT_LEVELS),
          pixels,
          srcW,
          srcH,
          cellSize,
          contrast,
          brightness,
          invert
        );

        colorizeMask(maskCtx, getGridLayer(imageData), outW, outH);

        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, outW, outH);
        ctx.drawImage(maskCanvas, 0, 0);
        return;
      }

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, outW, outH);

      drawDots(
        ctx,
        getTintedAtlas(cellSize, dotColor, DOT_LEVELS),
        pixels,
        srcW,
        srcH,
        cellSize,
        contrast,
        brightness,
        invert
      );
    },

    async captureImage(frame, settings, outputSize) {
      const scaleFactor = settings.captureScale;
      const codec = settings.captureCodec;
      const gridW = Math.floor(outputSize.width / settings.fontSize);
      const gridH = Math.floor(outputSize.height / settings.fontSize);
      if (gridW <= 0 || gridH <= 0) {
        throw new Error("Invalid capture dimensions");
      }

      const cellSize = settings.fontSize * scaleFactor;
      const width = outputSize.width * scaleFactor;
      const height = outputSize.height * scaleFactor;

      // One pixel per dot: shrink the frame to the grid for analysis.
      const analysisCanvas = new OffscreenCanvas(gridW, gridH);
      const analysisCtx = analysisCanvas.getContext("2d", {
        willReadFrequently: true,
      });
      if (!analysisCtx) throw new Error("Canvas init failed");
      analysisCtx.drawImage(frame, 0, 0, gridW, gridH);
      const { data: pixels } = analysisCtx.getImageData(0, 0, gridW, gridH);

      const outCanvas = new OffscreenCanvas(width, height);
      const outCtx = outCanvas.getContext("2d", { alpha: false });
      if (!outCtx) throw new Error("Canvas init failed");

      const { contrast, brightness, colorMode, invert } = settings;
      const { foreground, background } = settings.color;
      const bgColor = invert ? foreground : background;
      const dotColor = invert ? background : foreground;

      outCtx.fillStyle = bgColor;
      outCtx.fillRect(0, 0, width, height);

      const whiteAtlas = getWhiteAtlas(cellSize, DOT_LEVELS);
      const tintedAtlas = colorMode
        ? null
        : getTintedAtlas(cellSize, dotColor, DOT_LEVELS);

      const rowOffset = cellSize * 0.5;

      for (let y = 0; y < gridH; y++) {
        const yOff = (y & 1) === 1 ? rowOffset : 0;

        for (let x = 0; x < gridW; x++) {
          const i = y * gridW + x;
          const p = i * 4;
          const r = pixels[p];
          const g = pixels[p + 1];
          const b = pixels[p + 2];

          const level = computeLevel(
            r,
            g,
            b,
            contrast,
            brightness,
            invert,
            DOT_LEVELS
          );
          if (level === 0) continue;

          const dx = x * cellSize + yOff;
          const dy = y * cellSize;

          if (colorMode) {
            const colorString = getColorString(
              r,
              g,
              b,
              COLOR_LUT_SIZE,
              COLOR_LUT_SHIFT,
              COLOR_LUT_BITS
            );
            blitTintedSprite(outCtx, whiteAtlas, level, dx, dy, colorString);
          } else {
            blitSprite(outCtx, tintedAtlas!, level, dx, dy);
          }
        }
      }

      runEffectPipeline(outCanvas, outCtx, settings);

      return outCanvas.convertToBlob({ type: `image/${codec}` });
    },
  };
};
