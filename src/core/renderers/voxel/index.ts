import type { AsciiSettings, RendererFactory } from "@/types";
import {
  adjustPixel,
  type Atlas,
  BAYER4,
  buildAtlas,
  buildPalette,
  buildThemeRamp,
  DITHER_STRENGTH,
  fillQuantized,
  lookupColor,
  type Palette,
  VOXEL_COLORS,
} from "@/utils/voxelUtils";

/**
 * VOXEL renderer.
 *
 * Two visual modes, selected by settings.voxel3d:
 *  - flat: solid color blocks via a single ImageData blit at grid
 *          resolution, scaled up with nearest-neighbor. Very fast -
 *          ~2 GPU blits per frame regardless of cell count.
 *  - 3D:   raised cubes with top/right/bottom faces, drawn from a
 *          pre-rendered sprite atlas (one sprite per palette color).
 *          Slower but chunkier.
 *
 * Palette: a 16-step ramp between settings.color.background and
 * settings.color.foreground by default, LEGO colors when settings.colorMode
 * is on. Both are pre-quantized into 5-bit/channel LUTs (voxelUtils).
 *
 * Unlike ascii/dither/halftone, voxel has no single foreground/background
 * pair to swap on invert - every cell is always filled from a discrete
 * palette, and adjustPixel() already inverts every RGB channel before
 * palette lookup, which is a full negative on its own. settings.color also
 * drives the mono-mode ramp itself (rebuilt only when the colors change,
 * see getThemePalette/ensureAtlases) and the 3D mode's canvas backdrop.
 */
export const createVoxelRenderer: RendererFactory = (canvas) => {
  let themePalette: Palette | null = null;
  let themePaletteKey = "";
  let colorPalette: Palette | null = null;
  const getThemePalette = (foreground: string, background: string) => {
    const key = `${foreground}|${background}`;
    if (themePaletteKey !== key || !themePalette) {
      themePalette = buildPalette(buildThemeRamp(foreground, background));
      themePaletteKey = key;
    }
    return themePalette;
  };
  const getColorPalette = () => (colorPalette ??= buildPalette(VOXEL_COLORS));

  // 3D-mode cube sprite atlases - rebuilt when cellSize OR theme colors change.
  let themeAtlas: Atlas | null = null;
  let colorAtlas: Atlas | null = null;
  let atlasSize = 0;
  let atlasThemeKey = "";
  const ensureAtlases = (
    size: number,
    foreground: string,
    background: string
  ) => {
    const rounded = Math.max(4, Math.round(size));
    const themeKey = `${foreground}|${background}`;
    if (
      atlasSize === rounded &&
      atlasThemeKey === themeKey &&
      themeAtlas &&
      colorAtlas
    ) {
      return { theme: themeAtlas, color: colorAtlas };
    }
    themeAtlas = buildAtlas(rounded, buildThemeRamp(foreground, background));
    colorAtlas = buildAtlas(rounded, VOXEL_COLORS);
    atlasSize = rounded;
    atlasThemeKey = themeKey;
    return { theme: themeAtlas, color: colorAtlas };
  };

  // Flat-path reusable ImageData + scratch canvas for the upscale blit.
  let imageData: ImageData | null = null;
  let imageDataW = 0;
  let imageDataH = 0;
  const scratch = document.createElement("canvas");

  /** Shared 3D-path drawing, used by both render() and captureImage(). */
  const render3D = (
    ctx: CanvasRenderingContext2D,
    pixels: Uint8ClampedArray,
    srcW: number,
    srcH: number,
    cellSize: number,
    settings: AsciiSettings,
    bgColor: string
  ) => {
    const outW = srcW * cellSize;
    const outH = srcH * cellSize;
    if (ctx.canvas.width !== outW || ctx.canvas.height !== outH) {
      ctx.canvas.width = outW;
      ctx.canvas.height = outH;
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, outW, outH);

    const { foreground, background: bg } = settings.color;
    const { theme, color } = ensureAtlases(cellSize, foreground, bg);
    const palette = settings.colorMode
      ? getColorPalette()
      : getThemePalette(foreground, bg);
    const atlas = settings.colorMode ? color : theme;

    const { contrast, brightness, invert } = settings;
    const ditherAmp = DITHER_STRENGTH / 15;
    const ditherHalf = DITHER_STRENGTH / 2;
    const spriteSize = atlas.sprite;
    const tmp: [number, number, number] = [0, 0, 0];

    for (let y = 0; y < srcH; y++) {
      const bayerRow = (y & 3) << 2;
      const yBase = y * cellSize;

      for (let x = 0; x < srcW; x++) {
        const p = (y * srcW + x) * 4;
        adjustPixel(
          pixels[p],
          pixels[p + 1],
          pixels[p + 2],
          contrast,
          brightness,
          invert,
          tmp
        );
        const bayer = BAYER4[bayerRow + (x & 3)] * ditherAmp - ditherHalf;
        const colorIdx = lookupColor(
          palette.lut,
          tmp[0],
          tmp[1],
          tmp[2],
          bayer
        );

        ctx.drawImage(
          atlas.canvas,
          colorIdx * spriteSize,
          0,
          spriteSize,
          spriteSize,
          x * cellSize,
          yBase,
          cellSize,
          cellSize
        );
      }
    }
  };

  return {
    render(imageDataIn, ctx, settings, cellSize) {
      const { width: srcW, height: srcH, data: pixels } = imageDataIn;
      const { foreground, background } = settings.color;

      if (settings.voxel3d) {
        render3D(ctx, pixels, srcW, srcH, cellSize, settings, background);
        return;
      }

      if (!imageData || imageDataW !== srcW || imageDataH !== srcH) {
        imageData = new ImageData(srcW, srcH);
        imageDataW = srcW;
        imageDataH = srcH;
      }

      const palette = settings.colorMode
        ? getColorPalette()
        : getThemePalette(foreground, background);
      fillQuantized(
        imageData.data,
        pixels,
        srcW,
        srcH,
        palette,
        settings.contrast,
        settings.brightness,
        settings.invert
      );

      if (scratch.width !== srcW || scratch.height !== srcH) {
        scratch.width = srcW;
        scratch.height = srcH;
      }
      const scratchCtx = scratch.getContext("2d", { alpha: false });
      if (!scratchCtx) return;
      scratchCtx.putImageData(imageData, 0, 0);

      const outW = srcW * cellSize;
      const outH = srcH * cellSize;
      if (canvas.width !== outW || canvas.height !== outH) {
        canvas.width = outW;
        canvas.height = outH;
      }
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(scratch, 0, 0, srcW, srcH, 0, 0, outW, outH);
      ctx.imageSmoothingEnabled = true;
    },

    captureImage(frame, settings, outputSize) {
      const scaleFactor = settings.captureScale;
      const cellSize = settings.fontSize * scaleFactor;
      const gridW = Math.floor(outputSize.width / settings.fontSize);
      const gridH = Math.floor(outputSize.height / settings.fontSize);
      if (gridW <= 0 || gridH <= 0 || cellSize <= 0) {
        throw new Error("Invalid capture dimensions");
      }

      const analysisCanvas = document.createElement("canvas");
      analysisCanvas.width = gridW;
      analysisCanvas.height = gridH;
      const analysisCtx = analysisCanvas.getContext("2d");
      if (!analysisCtx) throw new Error("Canvas init failed");
      analysisCtx.drawImage(frame, 0, 0, gridW, gridH);
      const pixels = analysisCtx.getImageData(0, 0, gridW, gridH).data;

      const width = gridW * cellSize;
      const height = gridH * cellSize;
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext("2d", { alpha: false });
      if (!tempCtx) throw new Error("Canvas init failed");

      if (settings.voxel3d) {
        render3D(
          tempCtx,
          pixels,
          gridW,
          gridH,
          cellSize,
          settings,
          settings.color.background
        );
      } else {
        const lowCanvas = document.createElement("canvas");
        lowCanvas.width = gridW;
        lowCanvas.height = gridH;
        const lowCtx = lowCanvas.getContext("2d");
        if (!lowCtx) throw new Error("Canvas init failed");

        const imgData = lowCtx.createImageData(gridW, gridH);
        const palette = settings.colorMode
          ? getColorPalette()
          : getThemePalette(
              settings.color.foreground,
              settings.color.background
            );
        fillQuantized(
          imgData.data,
          pixels,
          gridW,
          gridH,
          palette,
          settings.contrast,
          settings.brightness,
          settings.invert
        );
        lowCtx.putImageData(imgData, 0, 0);

        tempCtx.imageSmoothingEnabled = false;
        tempCtx.drawImage(lowCanvas, 0, 0, gridW, gridH, 0, 0, width, height);
      }

      return tempCanvas.toDataURL("image/png");
    },
  };
};
