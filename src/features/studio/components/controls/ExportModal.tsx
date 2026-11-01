import { memo, useState } from "react";
import toast from "react-hot-toast";

import { Check, Clipboard, Download, FileText, Loader2, X } from "lucide-react";

import { RENDERERS } from "@/core/renderers/registry";
import type { Codecs } from "@/shared/types";
import { saveImage } from "@/shared/utils/saveImage";

import { useStudioStore } from "../../store/studioStore";

function ExportModal() {
  const isOpen = useStudioStore((s) => s.isExportModalOpen);
  const setIsOpen = useStudioStore((s) => s.setIsExportModalOpen);
  const image = useStudioStore((s) => s.image);
  const settings = useStudioStore((s) => s.settings);

  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedAscii, setCopiedAscii] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);

  if (!isOpen || !image) return null;

  const currentScale = settings.captureScale || 4;
  const currentCodec = settings.captureCodec || "png";

  const exportWidth = Math.round(image.width * currentScale);
  const exportHeight = Math.round(image.height * currentScale);

  const generateExportBlob = async (): Promise<Blob> => {
    const controller = useStudioStore.getState().workerController;
    if (controller?.isReady()) {
      return await controller.capture({
        width: image.width,
        height: image.height,
      });
    }

    // Fallback if controller is not yet ready
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image.url;
    await img.decode();

    const dummyCanvas = new OffscreenCanvas(1, 1);
    const renderer = RENDERERS[settings.renderMode](dummyCanvas);

    if (!renderer.captureImage) {
      throw new Error(`Capture is not implemented for ${settings.renderMode}`);
    }

    const outputSize = {
      width: image.width,
      height: image.height,
    };

    return await renderer.captureImage(img, settings, outputSize);
  };

  const handleSaveImage = async () => {
    setIsProcessing(true);
    try {
      const blob = await generateExportBlob();
      const reader = new FileReader();

      await new Promise<void>((resolve, reject) => {
        reader.onload = async () => {
          try {
            const dataUrl = reader.result as string;
            const ext = currentCodec === "jpeg" ? "jpg" : currentCodec;
            const cleanBase = image.name.replace(/\.[^/.]+$/, "");
            const filename = `${cleanBase}-phosphor-${settings.renderMode}-${Date.now()}.${ext}`;

            await saveImage(dataUrl, filename);
            toast.success("Image exported and saved!");
            setIsOpen(false);
            resolve();
          } catch (e) {
            reject(e);
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Export error", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to export image"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyImageToClipboard = async () => {
    setIsProcessing(true);
    try {
      // Clipboard API generally requires image/png
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = image.url;
      await img.decode();

      const dummyCanvas = new OffscreenCanvas(1, 1);
      const renderer = RENDERERS[settings.renderMode](dummyCanvas);
      if (!renderer.captureImage) {
        throw new Error("Capture not supported");
      }

      const pngSettings = { ...settings, captureCodec: "png" as Codecs };
      const blob = await renderer.captureImage(img, pngSettings, {
        width: image.width,
        height: image.height,
      });

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);

      setCopiedImage(true);
      toast.success("Image copied to clipboard!");
      setTimeout(() => setCopiedImage(false), 2000);
    } catch (err) {
      console.error("Copy image error", err);
      toast.error("Could not copy image to clipboard");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyAsciiText = async () => {
    try {
      const controller = useStudioStore.getState().workerController;
      if (controller?.isReady()) {
        const asciiText = await controller.getAsciiText();
        await navigator.clipboard.writeText(asciiText);
        setCopiedAscii(true);
        toast.success("Plaintext ASCII copied!");
        setTimeout(() => setCopiedAscii(false), 2000);
        return;
      }

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = image.url;
      await img.decode();

      const dummyCanvas = new OffscreenCanvas(1, 1);
      const renderer = RENDERERS.ascii(dummyCanvas);
      if (!renderer.getAsciiText) {
        throw new Error("ASCII text generation not supported");
      }

      const asciiText = renderer.getAsciiText(img, settings);
      await navigator.clipboard.writeText(asciiText);

      setCopiedAscii(true);
      toast.success("Plaintext ASCII copied!");
      setTimeout(() => setCopiedAscii(false), 2000);
    } catch (err) {
      console.error("Copy ASCII text error", err);
      toast.error("Failed to copy ASCII text");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm select-none"
    >
      <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-green-500/30 bg-zinc-950 p-6 shadow-2xl shadow-green-950/40">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Download size={18} className="text-green-400" />
            <h3 className="text-base font-bold text-white">Export & Save</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex size-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Export Dimensions Badge */}
        <div className="mb-4 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-xs">
          <div className="flex flex-col">
            <span className="font-semibold text-white">Target Dimensions</span>
            <span className="text-[11px] text-zinc-400">
              {currentScale}x scale factor
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-green-400 tabular-nums">
            {exportWidth} × {exportHeight} px
          </span>
        </div>

        <div className="mb-6 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-xs">
          <div className="flex flex-col">
            <span className="font-semibold text-white">Format</span>
            <span className="text-[11px] text-zinc-400">
              Set format and scale in the Capture & export panel.
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-green-400 uppercase tabular-nums">
            {currentCodec} · {currentScale}x
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleSaveImage}
            disabled={isProcessing}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-400 bg-green-500 py-3 text-sm font-bold text-black shadow-lg shadow-green-950/50 transition-all hover:bg-green-400 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 size={18} className="animate-spin text-black" />
            ) : (
              <Download size={18} strokeWidth={2.5} />
            )}
            <span>Save to Device / Download</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopyImageToClipboard}
              disabled={isProcessing}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
            >
              {copiedImage ? (
                <Check size={14} className="text-green-400" />
              ) : (
                <Clipboard size={14} />
              )}
              <span>{copiedImage ? "Copied!" : "Copy Image"}</span>
            </button>

            {settings.renderMode === "ascii" ? (
              <button
                type="button"
                onClick={handleCopyAsciiText}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
              >
                {copiedAscii ? (
                  <Check size={14} className="text-green-400" />
                ) : (
                  <FileText size={14} />
                )}
                <span>{copiedAscii ? "Copied Text!" : "Copy ASCII"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ExportModal);
