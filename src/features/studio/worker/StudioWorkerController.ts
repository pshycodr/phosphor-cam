import type { AsciiSettings, Size } from "@/shared/types";

import type { FromStudioWorker, ToStudioWorker } from "./studio.worker";

type Pending<T> = { resolve: (v: T) => void; reject: (e: Error) => void };

export class StudioWorkerController {
  private worker: Worker;
  private ready = false;
  private destroyed = false;
  private nextId = 1;
  private pendingAscii = new Map<number, Pending<string>>();
  private pendingCapture = new Map<number, Pending<Blob | null>>();
  private onRendered?: () => void;

  constructor(
    canvas: HTMLCanvasElement,
    options: { onRendered?: () => void } = {}
  ) {
    if (typeof canvas.transferControlToOffscreen !== "function") {
      throw new Error(
        "OffscreenCanvas is not supported in this browser/environment."
      );
    }
    this.onRendered = options.onRendered;

    this.worker = new Worker(new URL("./studio.worker.ts", import.meta.url), {
      type: "module",
    });

    this.worker.onmessage = (e: MessageEvent<FromStudioWorker>) =>
      this.onMessage(e.data);
    this.worker.onerror = (err) =>
      console.error("[StudioWorkerController] Worker error:", err);

    const offscreen = canvas.transferControlToOffscreen();
    this.send({ type: "init", canvas: offscreen }, [offscreen]);
  }

  private send(msg: ToStudioWorker, transfer: Transferable[] = []) {
    if (this.destroyed) return;
    this.worker.postMessage(msg, transfer);
  }

  private onMessage(msg: FromStudioWorker) {
    switch (msg.type) {
      case "ready":
        this.ready = true;
        break;
      case "rendered":
        this.onRendered?.();
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
        console.error("[StudioWorker]", msg.message);
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

  async setImage(bitmap: ImageBitmap) {
    if (this.destroyed) return bitmap.close();
    this.send({ type: "setImage", bitmap }, [bitmap]);
  }

  setSettings(settings: AsciiSettings) {
    this.send({
      type: "settings",
      settings: JSON.parse(JSON.stringify(settings)),
    });
  }

  resize(width: number, height: number) {
    this.send({ type: "resize", width, height });
  }

  async capture(outputSize: Size): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      if (this.destroyed) return reject(new Error("Worker destroyed"));
      const id = this.nextId++;
      this.pendingCapture.set(id, {
        resolve: (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Capture produced null"));
        },
        reject,
      });
      this.send({ type: "capture", id, outputSize });
    });
  }

  async getAsciiText(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (this.destroyed) return reject(new Error("Worker destroyed"));
      const id = this.nextId++;
      this.pendingAscii.set(id, { resolve, reject });
      this.send({ type: "getAscii", id });
    });
  }

  destroy() {
    this.destroyed = true;
    const err = new Error("Worker destroyed");
    this.pendingAscii.forEach((p) => p.reject(err));
    this.pendingCapture.forEach((p) => p.reject(err));
    this.pendingAscii.clear();
    this.pendingCapture.clear();
    this.worker.terminate();
  }
}
