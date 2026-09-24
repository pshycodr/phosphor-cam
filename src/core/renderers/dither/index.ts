import { type RendererFactory } from "@/types";
import { adjustColor, getLuminance } from "@/utils/asciiUtils";
import {
  ensureFloat,
  ensureUint8,
  floydSteinbergDither,
  getRgbString,
  hexToRgb,
  packRgb,
} from "@/utils/ditherUtils";

/**
 * Floyd-Steinberg Error-Diffusion Dithering
 *
 * Floyd-Steinberg dithering is an error-diffusion algorithm that converts
 * grayscale or color images into a limited set of output colors, commonly
 * black and white, while preserving the perceived brightness of the image.
 *
 * For each pixel, the algorithm:
 *
 * 1. Quantizes the current pixel to the nearest available output value.
 * 2. Calculates the quantization error:
 *      error = originalValue - quantizedValue
 * 3. Distributes this error to neighboring pixels using fixed weights:
 *
 *        Current   7/16 →
 *        3/16      5/16      1/16
 *
 * The distributed error modifies pixels that have not been processed yet.
 * This causes later pixels to compensate for errors introduced by earlier
 * quantization decisions.
 *
 * The result uses only the available output values, but the spatial
 * distribution of pixels creates the perception of intermediate shades.
 *
 * Floyd-Steinberg dithering is widely used for reducing color depth and
 * producing visually smoother images when the target output has fewer
 * available colors.
 */
export const createDitherRenderer: RendererFactory = (canvas) => {
  // Reusable buffers to avoid per-frame allocations
  let lumBuffer = new Float32Array(0) as Float32Array<ArrayBuffer>;
  let rBuffer = new Float32Array(0) as Float32Array<ArrayBuffer>;
  let gBuffer = new Float32Array(0) as Float32Array<ArrayBuffer>;
  let bBuffer = new Float32Array(0) as Float32Array<ArrayBuffer>;

  let lumOut = new Uint8Array(0) as Uint8Array<ArrayBuffer>;
  let rOut = new Uint8Array(0) as Uint8Array<ArrayBuffer>;
  let gOut = new Uint8Array(0) as Uint8Array<ArrayBuffer>;
  let bOut = new Uint8Array(0) as Uint8Array<ArrayBuffer>;

  let imageData: ImageData | null = null;
  let imageDataW = 0;
  let imageDataH = 0;

  const scratch = document.createElement("canvas");

  return {
    render(imageDataIn, ctx, settings, cellSize) {
      const { width: srcW, height: srcH, data: pixels } = imageDataIn;
      const cellCount = srcW * srcH;

      const {
        contrast,
        brightness: brightnessOffset,
        colorMode,
        invert,
      } = settings;

      const { foreground, background } = settings.color;
      const bgColor = invert ? foreground : background;
      const fgColor = invert ? background : foreground;

      const outW = srcW * cellSize;
      const outH = srcH * cellSize;
      if (canvas.width !== outW || canvas.height !== outH) {
        canvas.width = outW;
        canvas.height = outH;
      }

      if (!imageData || imageDataW !== srcW || imageDataH !== srcH) {
        imageData = ctx.createImageData(srcW, srcH);
        imageDataW = srcW;
        imageDataH = srcH;
      }
      const out = imageData.data; // Uint8ClampedArray, RGBA

      if (colorMode) {
        rBuffer = ensureFloat(rBuffer, cellCount);
        gBuffer = ensureFloat(gBuffer, cellCount);
        bBuffer = ensureFloat(bBuffer, cellCount);
        rOut = ensureUint8(rOut, cellCount);
        gOut = ensureUint8(gOut, cellCount);
        bOut = ensureUint8(bOut, cellCount);

        for (let i = 0, p = 0; i < cellCount; i++, p += 4) {
          rBuffer[i] = adjustColor(pixels[p], contrast, brightnessOffset);
          gBuffer[i] = adjustColor(pixels[p + 1], contrast, brightnessOffset);
          bBuffer[i] = adjustColor(pixels[p + 2], contrast, brightnessOffset);
        }

        floydSteinbergDither(rBuffer, srcW, srcH, rOut);
        floydSteinbergDither(gBuffer, srcW, srcH, gOut);
        floydSteinbergDither(bBuffer, srcW, srcH, bOut);

        // colorMode draws the true per-pixel dithered RGB. `invert` still
        // applies as a 0/255 flip so the semantics match the mono branch.
        if (invert) {
          for (let i = 0, p = 0; i < cellCount; i++, p += 4) {
            out[p] = 255 - rOut[i];
            out[p + 1] = 255 - gOut[i];
            out[p + 2] = 255 - bOut[i];
            out[p + 3] = 255;
          }
        } else {
          for (let i = 0, p = 0; i < cellCount; i++, p += 4) {
            out[p] = rOut[i];
            out[p + 1] = gOut[i];
            out[p + 2] = bOut[i];
            out[p + 3] = 255;
          }
        }
      } else {
        lumBuffer = ensureFloat(lumBuffer, cellCount);
        lumOut = ensureUint8(lumOut, cellCount);

        for (let i = 0, p = 0; i < cellCount; i++, p += 4) {
          const l = getLuminance(pixels[p], pixels[p + 1], pixels[p + 2]);
          lumBuffer[i] = adjustColor(l, contrast, brightnessOffset);
        }

        floydSteinbergDither(lumBuffer, srcW, srcH, lumOut);

        // Palette-driven monochrome output
        const [fr, fg, fb] = hexToRgb(fgColor);
        const [br, bg, bb] = hexToRgb(bgColor);

        for (let i = 0, p = 0; i < cellCount; i++, p += 4) {
          const on = lumOut[i] === 255;
          out[p] = on ? fr : br;
          out[p + 1] = on ? fg : bg;
          out[p + 2] = on ? fb : bb;
          out[p + 3] = 255;
        }
      }

      // Blit the low-res ImageData to a scratch canvas, then scale up
      // because putImageData ignores transforms.
      if (scratch.width !== srcW || scratch.height !== srcH) {
        scratch.width = srcW;
        scratch.height = srcH;
      }
      const scratchCtx = scratch.getContext("2d", { alpha: false });
      if (!scratchCtx) return;
      scratchCtx.putImageData(imageData, 0, 0);

      // Scale up with nearest-neighbor for crisp blocks
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(scratch, 0, 0, srcW, srcH, 0, 0, outW, outH);
      ctx.imageSmoothingEnabled = true;
    },

    captureImage(frame, settings, outputSize) {
      const scaleFactor = settings.captureScale;
      const blockSize = settings.fontSize;
      const codec = settings.captureCodec;

      const gridW = Math.floor(outputSize.width / blockSize);
      const gridH = Math.floor(outputSize.height / blockSize);
      if (gridW <= 0 || gridH <= 0) {
        throw new Error("Invalid capture dimensions");
      }

      const imageSpecs = {
        width: outputSize.width * scaleFactor,
        height: outputSize.height * scaleFactor,
        blockSize: blockSize * scaleFactor,
      };

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = imageSpecs.width;
      tempCanvas.height = imageSpecs.height;
      const tempCtx = tempCanvas.getContext("2d", { alpha: false });
      if (!tempCtx) throw new Error("Canvas initialization failed");

      const analysisCanvas = document.createElement("canvas");
      analysisCanvas.width = gridW;
      analysisCanvas.height = gridH;
      const analysisCtx = analysisCanvas.getContext("2d");
      if (!analysisCtx) throw new Error("Canvas initialization failed");

      analysisCtx.drawImage(frame, 0, 0, gridW, gridH);
      const pixels = analysisCtx.getImageData(0, 0, gridW, gridH).data;

      const { foreground, background } = settings.color;
      const bgColor = settings.invert ? foreground : background;
      const fgColor = settings.invert ? background : foreground;

      tempCtx.fillStyle = bgColor;
      tempCtx.fillRect(0, 0, imageSpecs.width, imageSpecs.height);

      const cellCount = gridW * gridH;
      const bs = imageSpecs.blockSize;

      if (settings.colorMode) {
        const rBuf = new Float32Array(cellCount);
        const gBuf = new Float32Array(cellCount);
        const bBuf = new Float32Array(cellCount);

        for (let i = 0; i < cellCount; i++) {
          rBuf[i] = adjustColor(
            pixels[i * 4],
            settings.contrast,
            settings.brightness
          );
          gBuf[i] = adjustColor(
            pixels[i * 4 + 1],
            settings.contrast,
            settings.brightness
          );
          bBuf[i] = adjustColor(
            pixels[i * 4 + 2],
            settings.contrast,
            settings.brightness
          );
        }

        const rO = new Uint8Array(cellCount);
        const gO = new Uint8Array(cellCount);
        const bO = new Uint8Array(cellCount);
        floydSteinbergDither(rBuf, gridW, gridH, rO);
        floydSteinbergDither(gBuf, gridW, gridH, gO);
        floydSteinbergDither(bBuf, gridW, gridH, bO);

        // colorMode draws true per-pixel colors
        for (let i = 0; i < cellCount; i++) {
          const xPos = (i % gridW) * bs;
          const yPos = Math.floor(i / gridW) * bs;
          let r = rO[i];
          let g = gO[i];
          let b = bO[i];
          if (settings.invert) {
            r = 255 - r;
            g = 255 - g;
            b = 255 - b;
          }
          tempCtx.fillStyle = getRgbString(packRgb(r, g, b));
          tempCtx.fillRect(xPos, yPos, bs, bs);
        }
      } else {
        const lumBuf = new Float32Array(cellCount);
        for (let i = 0; i < cellCount; i++) {
          const l = getLuminance(
            pixels[i * 4],
            pixels[i * 4 + 1],
            pixels[i * 4 + 2]
          );
          lumBuf[i] = adjustColor(l, settings.contrast, settings.brightness);
        }

        const out = new Uint8Array(cellCount);
        floydSteinbergDither(lumBuf, gridW, gridH, out);

        // Palette-driven monochrome blocks
        for (let i = 0; i < cellCount; i++) {
          const xPos = (i % gridW) * bs;
          const yPos = Math.floor(i / gridW) * bs;
          const on = out[i] === 255;
          tempCtx.fillStyle = on ? fgColor : bgColor;
          tempCtx.fillRect(xPos, yPos, bs, bs);
        }
      }

      return tempCanvas.toDataURL(`image/${codec}`);
    },
  };
};
