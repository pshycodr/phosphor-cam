import { downsampleFrame } from "@/core/pipeline/downsample";
import { runEffectPipeline } from "@/core/pipeline/effects";
import { RENDERERS } from "@/core/renderers/registry";
import type {
  AsciiSettings,
  FromWorker,
  RendererInstance,
  RenderMode,
  Size,
  ToWorker,
} from "@/types";

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
const scratch = new OffscreenCanvas(1, 1);

let settings: AsciiSettings | null = null;
let targetSize: Size = { width: 0, height: 0 }; // old canvasSize

const instances = new Map<RenderMode, RendererInstance>();

let frameCount = 0;
let statsWindowStart = 0;

const post = (msg: FromWorker) => self.postMessage(msg);

function getRenderer(mode: RenderMode): RendererInstance {
  let instance = instances.get(mode);
  if (!instance) {
    instance = RENDERERS[mode](canvas!);
    instances.set(mode, instance);
  }
  return instance;
}

function renderFrame(bitmap: ImageBitmap) {
  if (!canvas || !ctx || !settings) return;

  const start = performance.now();
  const cellSize = settings.fontSize || 10;
  const srcW = Math.floor(targetSize.width / cellSize);
  const srcH = Math.floor(targetSize.height / cellSize);
  if (srcW <= 0 || srcH <= 0) return;

  const imageData = downsampleFrame(bitmap, srcW, srcH, scratch);
  if (!imageData) return;

  getRenderer(settings.renderMode).render(imageData, ctx, settings, cellSize);
  runEffectPipeline(canvas, ctx, settings);

  const now = performance.now();
  frameCount++;
  if (statsWindowStart === 0) statsWindowStart = now;
  if (frameCount >= 20) {
    post({
      type: "stats",
      stats: {
        fps: (frameCount * 1000) / (now - statsWindowStart),
        renderTime: now - start,
      },
    });
    frameCount = 0;
    statsWindowStart = now;
  }
}

self.onmessage = async (event: MessageEvent<ToWorker>) => {
  const msg = event.data;

  try {
    switch (msg.type) {
      case "init": {
        canvas = msg.canvas;
        ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) {
          post({ type: "error", message: "failed to get 2d context" });
          return;
        }
        targetSize = { width: canvas.width, height: canvas.height };
        post({ type: "ready" });
        break;
      }

      case "settings":
        settings = msg.settings;
        break;

      case "resize":
        targetSize = { width: msg.width, height: msg.height };
        break;

      case "frame": {
        try {
          renderFrame(msg.bitmap);
        } finally {
          msg.bitmap.close();
          post({ type: "frameDone" });
        }
        break;
      }

      case "getAscii": {
        try {
          if (!settings) throw new Error("Settings not received yet");
          const text =
            getRenderer(settings.renderMode).getAsciiText?.(
              msg.bitmap,
              settings
            ) ?? "";
          post({ type: "ascii", id: msg.id, text });
        } finally {
          msg.bitmap.close();
        }
        break;
      }

      case "capture": {
        try {
          if (!settings) throw new Error("Settings not received yet");
          const renderer = getRenderer(settings.renderMode);
          if (!renderer.captureImage) {
            throw new Error("Capture not supported for this renderer");
          }
          const blob = await renderer.captureImage(
            msg.bitmap,
            settings,
            msg.outputSize
          );
          post({ type: "captured", id: msg.id, blob });
        } finally {
          msg.bitmap.close();
        }
        break;
      }
    }
  } catch (err) {
    post({
      type: "error",
      message: err instanceof Error ? err.message : String(err),
      id: "id" in msg ? msg.id : undefined,
    });
  }
};
