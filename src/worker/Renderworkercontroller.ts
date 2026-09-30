import type {
  AsciiSettings,
  FromWorker,
  ProcessingStats,
  Size,
  ToWorker,
} from "@/types";

type Pending<T> = { resolve: (v: T) => void; reject: (e: Error) => void };

export interface ControllerOptions {
  onStats?: (stats: ProcessingStats) => void;
}

export class RenderWorkerController {
  private worker: Worker;
  private ready = false;
  private busy = false;
  private destroyed = false;
  private nextId = 1;
  private pendingAscii = new Map<number, Pending<string>>();
  private pendingCapture = new Map<number, Pending<Blob | null>>();
  private onStats?: (stats: ProcessingStats) => void;

  constructor(canvas: HTMLCanvasElement, options: ControllerOptions = {}) {
    if (typeof canvas.transferControlToOffscreen !== "function") {
      throw new Error(
        "OffscreenCanvas is not supported in this browser/WebView."
      );
    }
    this.onStats = options.onStats;

    this.worker = new Worker(new URL("./render.worker.ts", import.meta.url), {
      type: "module",
    });
    this.worker.onmessage = (e: MessageEvent<FromWorker>) =>
      this.onMessage(e.data);
    this.worker.onerror = (err) =>
      console.error("[RenderWorkerController] worker error:", err);

    const offscreen = canvas.transferControlToOffscreen();
    this.send({ type: "init", canvas: offscreen }, [offscreen]);
  }

  private send(msg: ToWorker, transfer: Transferable[] = []) {
    if (this.destroyed) return;
    this.worker.postMessage(msg, transfer);
  }

  private onMessage(msg: FromWorker) {
    switch (msg.type) {
      case "ready":
        this.ready = true;
        break;
      case "frameDone":
        this.busy = false;
        break;
      case "stats":
        this.onStats?.(msg.stats);
        break;
      case "ascii":
        this.pendingAscii.get(msg.id)?.resolve(msg.text);
        this.pendingAscii.delete(msg.id);
        break;
      case "captured":
        this.pendingCapture.get(msg.id)?.resolve(msg.blob);
        this.pendingCapture.delete(msg.id);
        break;
      case "error": {
        console.error("[render.worker]", msg.message);
        this.busy = false;
        if (msg.id !== undefined) {
          const err = new Error(msg.message);
          this.pendingAscii.get(msg.id)?.reject(err);
          this.pendingAscii.delete(msg.id);
          this.pendingCapture.get(msg.id)?.reject(err);
          this.pendingCapture.delete(msg.id);
        }
        break;
      }
    }
  }

  isReady() {
    return this.ready;
  }

  /** Calls every animation frame. Drops the frame when the worker is busy. */
  sendFrame(frame: ImageBitmapSource) {
    if (this.destroyed || !this.ready || this.busy) return;
    this.busy = true;
    createImageBitmap(frame)
      .then((bitmap) => {
        if (this.destroyed) return bitmap.close();
        this.send({ type: "frame", bitmap }, [bitmap]);
      })
      .catch((err) => {
        this.busy = false;
        console.error(
          "[RenderWorkerController] createImageBitmap failed:",
          err
        );
      });
  }

  setSettings(settings: AsciiSettings) {
    // JSON round-trip guarantees postMessage can't hit DataCloneError.
    this.send({
      type: "settings",
      settings: JSON.parse(JSON.stringify(settings)),
    });
  }

  resize(width: number, height: number) {
    this.send({ type: "resize", width, height });
  }

  async getAsciiText(frame: ImageBitmapSource): Promise<string> {
    const bitmap = await createImageBitmap(frame);
    return new Promise<string>((resolve, reject) => {
      if (this.destroyed) {
        bitmap.close();
        return reject(new Error("Controller destroyed"));
      }
      const id = this.nextId++;
      this.pendingAscii.set(id, { resolve, reject });
      this.send({ type: "getAscii", id, bitmap }, [bitmap]);
    });
  }

  /** Hi-res capture from a raw frame. Resolves with a data URL. */
  async captureImage(
    frame: ImageBitmapSource,
    outputSize: Size
  ): Promise<string> {
    const bitmap = await createImageBitmap(frame);
    const blob = await new Promise<Blob | null>((resolve, reject) => {
      if (this.destroyed) {
        bitmap.close();
        return reject(new Error("Controller destroyed"));
      }
      const id = this.nextId++;
      this.pendingCapture.set(id, { resolve, reject });
      this.send({ type: "capture", id, bitmap, outputSize }, [bitmap]);
    });
    if (!blob) throw new Error("Capture failed");

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  destroy() {
    this.destroyed = true;
    const err = new Error("Controller destroyed");
    this.pendingAscii.forEach((p) => p.reject(err));
    this.pendingCapture.forEach((p) => p.reject(err));
    this.pendingAscii.clear();
    this.pendingCapture.clear();
    this.worker.terminate();
  }
}
