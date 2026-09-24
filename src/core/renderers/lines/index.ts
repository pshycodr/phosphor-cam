import { runEffectPipeline } from "@/core/pipeline/effects";
import type { AsciiSettings, RendererFactory } from "@/types";
import { sample, traceSmoothPath } from "@/utils/liensutils";

/**
 * LINES renderer (horizontal / vertical scanline halftone).
 *
 * Each row/column is one continuous ribbon whose thickness tracks source
 * luminance. Edges are Catmull-Rom splines converted to Béziers so the
 * ribbon flows instead of stepping between samples. Color mode paints
 * per-cell true RGB instead of one ribbon fill.
 */
export const createLinesRenderer: RendererFactory = (canvas) => {
  const drawScanlines = (
    ctx: CanvasRenderingContext2D,
    pixels: Uint8ClampedArray,
    gridW: number,
    gridH: number,
    cellSize: number,
    settings: AsciiSettings
  ) => {
    const { contrast, brightness, invert, colorMode, lineDirection } = settings;
    const { foreground, background } = settings.color;

    const outW = gridW * cellSize;
    const outH = gridH * cellSize;
    const bg = invert ? foreground : background;
    const fg = invert ? background : foreground;

    const maxThickness = cellSize * 0.95;
    const minThickness = Math.max(0.6, cellSize * 0.06);

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, outW, outH);

    if (lineDirection === "horizontal") {
      for (let gy = 0; gy < gridH; gy++) {
        const yCenter = gy * cellSize + cellSize / 2;
        const xs: number[] = new Array(gridW);
        const topYs: number[] = new Array(gridW);
        const botYs: number[] = new Array(gridW);
        const cols: { r: number; g: number; b: number }[] = new Array(gridW);

        for (let gx = 0; gx < gridW; gx++) {
          const s = sample(
            pixels,
            gridW,
            gx,
            gy,
            contrast,
            brightness,
            invert,
            minThickness,
            maxThickness
          );
          xs[gx] = gx * cellSize + cellSize / 2;
          topYs[gx] = yCenter - s.thickness / 2;
          botYs[gx] = yCenter + s.thickness / 2;
          cols[gx] = { r: s.r, g: s.g, b: s.b };
        }

        if (colorMode) {
          for (let gx = 0; gx < gridW; gx++) {
            const c = cols[gx];
            const x0 = gx === 0 ? 0 : (xs[gx - 1] + xs[gx]) / 2;
            const x1 = gx === gridW - 1 ? outW : (xs[gx] + xs[gx + 1]) / 2;
            const x0e = gx === 0 ? 0 : x0 - 0.5;
            const x1e = gx === gridW - 1 ? outW : x1 + 0.5;

            ctx.fillStyle = `rgb(${c.r | 0},${c.g | 0},${c.b | 0})`;
            ctx.beginPath();
            ctx.moveTo(x0e, topYs[gx]);
            ctx.lineTo(x1e, topYs[gx]);
            ctx.lineTo(x1e, botYs[gx]);
            ctx.lineTo(x0e, botYs[gx]);
            ctx.closePath();
            ctx.fill();
          }
        } else {
          ctx.fillStyle = fg;
          ctx.beginPath();
          traceSmoothPath(ctx, xs, topYs, true);
          const rxs = [...xs].reverse();
          const rys = [...botYs].reverse();
          ctx.lineTo(rxs[0], rys[0]);
          traceSmoothPath(ctx, rxs, rys, false);
          ctx.closePath();
          ctx.fill();
        }
      }
      return;
    }

    // Anything other than "horizontal" renders as vertical (diagonal not implemented).
    for (let gx = 0; gx < gridW; gx++) {
      const xCenter = gx * cellSize + cellSize / 2;
      const ys: number[] = new Array(gridH);
      const leftXs: number[] = new Array(gridH);
      const rightXs: number[] = new Array(gridH);
      const cols: { r: number; g: number; b: number }[] = new Array(gridH);

      for (let gy = 0; gy < gridH; gy++) {
        const s = sample(
          pixels,
          gridW,
          gx,
          gy,
          contrast,
          brightness,
          invert,
          minThickness,
          maxThickness
        );
        ys[gy] = gy * cellSize + cellSize / 2;
        leftXs[gy] = xCenter - s.thickness / 2;
        rightXs[gy] = xCenter + s.thickness / 2;
        cols[gy] = { r: s.r, g: s.g, b: s.b };
      }

      if (colorMode) {
        for (let gy = 0; gy < gridH; gy++) {
          const c = cols[gy];
          const y0 = gy === 0 ? 0 : (ys[gy - 1] + ys[gy]) / 2;
          const y1 = gy === gridH - 1 ? outH : (ys[gy] + ys[gy + 1]) / 2;
          const y0e = gy === 0 ? 0 : y0 - 0.5;
          const y1e = gy === gridH - 1 ? outH : y1 + 0.5;

          ctx.fillStyle = `rgb(${c.r | 0},${c.g | 0},${c.b | 0})`;
          ctx.beginPath();
          ctx.moveTo(leftXs[gy], y0e);
          ctx.lineTo(rightXs[gy], y0e);
          ctx.lineTo(rightXs[gy], y1e);
          ctx.lineTo(leftXs[gy], y1e);
          ctx.closePath();
          ctx.fill();
        }
      } else {
        ctx.fillStyle = fg;
        ctx.beginPath();
        traceSmoothPath(ctx, leftXs, ys, true);
        const rys = [...ys].reverse();
        const rxs = [...rightXs].reverse();
        ctx.lineTo(rxs[0], rys[0]);
        traceSmoothPath(ctx, rxs, rys, false);
        ctx.closePath();
        ctx.fill();
      }
    }
  };

  return {
    render(imageDataIn, ctx, settings, cellSize) {
      const { width: srcW, height: srcH, data: pixels } = imageDataIn;
      const outW = srcW * cellSize;
      const outH = srcH * cellSize;
      if (canvas.width !== outW || canvas.height !== outH) {
        canvas.width = outW;
        canvas.height = outH;
      }
      drawScanlines(ctx, pixels, srcW, srcH, cellSize, settings);
    },

    captureImage(frame, settings, outputSize) {
      const scaleFactor = 4;
      const codec = settings.captureCodec;
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

      const outCanvas = document.createElement("canvas");
      outCanvas.width = gridW * cellSize;
      outCanvas.height = gridH * cellSize;
      const outCtx = outCanvas.getContext("2d", { alpha: false });
      if (!outCtx) throw new Error("Canvas init failed");

      drawScanlines(outCtx, pixels, gridW, gridH, cellSize, settings);

      runEffectPipeline(outCanvas, outCtx, settings);

      return outCanvas.toDataURL(`image/${codec}`);
    },
  };
};
