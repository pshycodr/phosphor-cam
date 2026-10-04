import { CHAR_SETS } from "@/constants/characterSets";
import { runEffectPipeline } from "@/core/pipeline/effects"; // must be worker-safe
import { type RendererFactory } from "@/types";
import {
  adjustColor,
  getBrightnessMap,
  getChar,
  getLuminance,
} from "@/utils/asciiUtils";

export const createAsciiRenderer: RendererFactory = (canvas) => {
  return {
    render(imageData, ctx, settings, cellSize) {
      const { width: srcW, height: srcH, data: pixels } = imageData;
      const ramp = CHAR_SETS[settings.characterSet];
      const brightnessMap = getBrightnessMap(ramp);

      canvas.width = srcW * cellSize;
      canvas.height = srcH * cellSize;

      const { foreground, background } = settings.color;
      const bgColor = settings.invert ? foreground : background;
      const fgColor = settings.invert ? background : foreground;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${cellSize}px 'JetBrainsMono-Bold', monospace`;
      ctx.textBaseline = "top";

      const pixelCount = srcW * srcH;
      for (let i = 0; i < pixelCount; i++) {
        const r = pixels[i * 4];
        const g = pixels[i * 4 + 1];
        const b = pixels[i * 4 + 2];

        let l = getLuminance(r, g, b);
        if (settings.contrast !== 1 || settings.brightness !== 0) {
          l = adjustColor(l, settings.contrast, settings.brightness);
        }

        const char = getChar(l, brightnessMap, settings.invert);
        const x = (i % srcW) * cellSize;
        const y = Math.floor(i / srcW) * cellSize;

        ctx.fillStyle = settings.colorMode ? `rgb(${r},${g},${b})` : fgColor;
        ctx.fillText(char, x, y);
      }
    },

    async captureImage(frame, settings, outputSize) {
      const scaleFactor = settings.captureScale;
      const fontSize = settings.fontSize;
      const codec = settings.captureCodec;

      const charsX = Math.floor(outputSize.width / fontSize);
      const charsY = Math.floor(outputSize.height / fontSize);
      if (charsX <= 0 || charsY <= 0) {
        throw new Error("Invalid capture dimensions");
      }

      const { foreground, background } = settings.color;
      const bgColor = settings.invert ? foreground : background;
      const fgColor = settings.invert ? background : foreground;

      const analysisCanvas = new OffscreenCanvas(charsX, charsY);
      const analysisCtx = analysisCanvas.getContext("2d", {
        willReadFrequently: true,
      });
      if (!analysisCtx) throw new Error("Canvas initialization failed");
      analysisCtx.drawImage(frame, 0, 0, charsX, charsY);
      const { data: pixels } = analysisCtx.getImageData(0, 0, charsX, charsY);

      const hiResFont = fontSize * scaleFactor;
      const outCanvas = new OffscreenCanvas(
        charsX * hiResFont,
        charsY * hiResFont
      );
      const outCtx = outCanvas.getContext("2d", { alpha: false });
      if (!outCtx) throw new Error("Canvas initialization failed");

      outCtx.fillStyle = bgColor;
      outCtx.fillRect(0, 0, outCanvas.width, outCanvas.height);
      outCtx.font = `${hiResFont}px 'Fira Code', monospace`;
      outCtx.textBaseline = "top";

      const ramp = CHAR_SETS[settings.characterSet];
      const brightnessMap = getBrightnessMap(ramp);

      for (let i = 0; i < charsX * charsY; i++) {
        const r = pixels[i * 4];
        const g = pixels[i * 4 + 1];
        const b = pixels[i * 4 + 2];

        let l = getLuminance(r, g, b);
        l = adjustColor(l, settings.contrast, settings.brightness);
        const char = getChar(l, brightnessMap, settings.invert);

        const x = (i % charsX) * hiResFont;
        const y = Math.floor(i / charsX) * hiResFont;

        outCtx.fillStyle = settings.colorMode ? `rgb(${r},${g},${b})` : fgColor;
        outCtx.fillText(char, x, y);
      }

      runEffectPipeline(outCanvas, outCtx, settings);

      return outCanvas.convertToBlob({ type: `image/${codec}` });
    },

    getAsciiText(frame, settings) {
      const standardWidth = 150;

      const naturalWidth =
        "videoWidth" in frame
          ? (frame as HTMLVideoElement).videoWidth
          : (frame as HTMLImageElement | ImageBitmap).width;
      const naturalHeight =
        "videoHeight" in frame
          ? (frame as HTMLVideoElement).videoHeight
          : (frame as HTMLImageElement | ImageBitmap).height;

      if (!naturalWidth || !naturalHeight) return "";

      const aspectRatio = naturalHeight / naturalWidth;
      const standardHeight = Math.max(
        1,
        Math.floor(standardWidth * aspectRatio * 0.55)
      );

      const tempCanvas = new OffscreenCanvas(standardWidth, standardHeight);
      const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
      if (!tempCtx) return "";

      tempCtx.drawImage(frame, 0, 0, standardWidth, standardHeight);
      const { data: pixels } = tempCtx.getImageData(
        0,
        0,
        standardWidth,
        standardHeight
      );

      const ramp = CHAR_SETS[settings.characterSet];
      const brightnessMap = getBrightnessMap(ramp);

      const totalChars = standardWidth * standardHeight + standardHeight;
      const buffer = new Array<string>(totalChars);
      let i = 0;

      for (let y = 0; y < standardHeight; y++) {
        for (let x = 0; x < standardWidth; x++) {
          const idx = (y * standardWidth + x) * 4;
          const l = getLuminance(pixels[idx], pixels[idx + 1], pixels[idx + 2]);
          const adjL = adjustColor(l, settings.contrast, settings.brightness);
          buffer[i++] = getChar(adjL, brightnessMap, settings.invert);
        }
        buffer[i++] = "\n";
      }

      return buffer.join("");
    },
  };
};
