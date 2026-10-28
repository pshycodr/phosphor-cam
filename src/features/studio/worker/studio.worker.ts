import { downsampleFrame } from "@/core/pipeline/downsample";
import { runEffectPipeline } from "@/core/pipeline/effects";
import { RENDERERS } from "@/core/renderers/registry";
import type {
  AsciiSettings,
  RendererInstance,
  RenderMode,
  Size,
} from "@/shared/types";

export type ToStudioWorker =
  | { type: "init"; canvas: OffscreenCanvas }
  | { type: "setImage"; bitmap: ImageBitmap }
  | { type: "settings"; settings: AsciiSettings }
  | { type: "resize"; width: number; height: number }
  | { type: "render" }
  | { type: "capture"; id: number; outputSize: Size }
  | { type: "getAscii"; id: number };

export type FromStudioWorker =
  | { type: "ready" }
  | { type: "rendered" }
  | { type: "captured"; id: number; blob: Blob | null }
  | { type: "ascii"; id: number; text: string }
  | { type: "error"; message: string; id?: number };

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
const scratch = new OffscreenCanvas(1, 1);

let settings: AsciiSettings | null = null;
let sourceBitmap: ImageBitmap | null = null;
let targetSize: Size = { width: 0, height: 0 };

const instances = new Map<RenderMode, RendererInstance>();

const post = (msg: FromStudioWorker) => self.postMessage(msg);

function getRenderer(mode: RenderMode): RendererInstance {
  let instance = instances.get(mode);
  if (!instance) {
    instance = RENDERERS[mode](canvas!);
    instances.set(mode, instance);
  }
  return instance;
}

function renderFrame() {
  if (!canvas || !ctx || !settings || !sourceBitmap) return;
  if (targetSize.width <= 0 || targetSize.height <= 0) return;

  const imgAspect = sourceBitmap.width / sourceBitmap.height;
  const containerAspect = targetSize.width / targetSize.height;

  let fittedW: number;
  let fittedH: number;

  if (containerAspect > imgAspect) {
    fittedH = targetSize.height;
    fittedW = targetSize.height * imgAspect;
  } else {
    fittedW = targetSize.width;
    fittedH = targetSize.width / imgAspect;
  }

  const cellSize = settings.fontSize || 10;
  const srcW = Math.max(1, Math.floor(fittedW / cellSize));
  const srcH = Math.max(1, Math.floor(fittedH / cellSize));

  const imageData = downsampleFrame(sourceBitmap, srcW, srcH, scratch);
  if (!imageData) return;

  const renderer = getRenderer(settings.renderMode);
  renderer.render(imageData, ctx, settings, cellSize);
  runEffectPipeline(canvas, ctx, settings);

  post({ type: "rendered" });
}

self.onmessage = async (event: MessageEvent<ToStudioWorker>) => {
  const msg = event.data;

  try {
    switch (msg.type) {
      case "init": {
        canvas = msg.canvas;
        ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) {
          post({
            type: "error",
            message: "Failed to get 2d context for OffscreenCanvas",
          });
          return;
        }
        targetSize = { width: canvas.width, height: canvas.height };
        post({ type: "ready" });
        break;
      }

      case "setImage": {
        if (sourceBitmap) {
          sourceBitmap.close();
        }
        sourceBitmap = msg.bitmap;
        renderFrame();
        break;
      }

      case "settings": {
        settings = msg.settings;
        renderFrame();
        break;
      }

      case "resize": {
        targetSize = { width: msg.width, height: msg.height };
        renderFrame();
        break;
      }

      case "render": {
        renderFrame();
        break;
      }

      case "getAscii": {
        try {
          if (!settings || !sourceBitmap) {
            throw new Error("No image or settings available");
          }
          const text =
            getRenderer(settings.renderMode).getAsciiText?.(
              sourceBitmap,
              settings
            ) ?? "";
          post({ type: "ascii", id: msg.id, text });
        } catch (err) {
          post({
            type: "error",
            id: msg.id,
            message: err instanceof Error ? err.message : String(err),
          });
        }
        break;
      }

      case "capture": {
        try {
          if (!settings || !sourceBitmap) {
            throw new Error("No image or settings available");
          }
          const renderer = getRenderer(settings.renderMode);
          if (!renderer.captureImage) {
            throw new Error(`Capture not supported for ${settings.renderMode}`);
          }
          const blob = await renderer.captureImage(
            sourceBitmap,
            settings,
            msg.outputSize
          );
          post({ type: "captured", id: msg.id, blob });
        } catch (err) {
          post({
            type: "error",
            id: msg.id,
            message: err instanceof Error ? err.message : String(err),
          });
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
