import { memo, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { Check, Clipboard, Download, FileText, Loader2, X } from "lucide-react";

import { RENDERERS } from "@/core/renderers/registry";
import { SliderField } from "@/shared/components/settings/common/EditorSlider";
import { usePresence } from "@/shared/hooks/usePresence";
import type { Codecs } from "@/shared/types";
import { Button, IconButton } from "@/shared/ui/buttons";
import { Segmented } from "@/shared/ui/controls";
import { saveImage } from "@/shared/utils/saveImage";

import { useStudioStore } from "../../store/studioStore";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const MIN_SCALE = 1;
const MAX_SCALE = 20;
const WARN_SCALE = 12;
const CODECS = [
  { key: "png", label: "PNG" },
  { key: "jpeg", label: "JPEG" },
  { key: "webp", label: "WEBP" },
] as const satisfies readonly { key: Codecs; label: string }[];

const clampScale = (value: number) =>
  Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round(value)));

function ExportModal() {
  const isOpen = useStudioStore((s) => s.isExportModalOpen);
  const setIsOpen = useStudioStore((s) => s.setIsExportModalOpen);
  const image = useStudioStore((s) => s.image);
  const settings = useStudioStore((s) => s.settings);
  const updateSettings = useStudioStore((s) => s.updateSettings);
  const commitHistory = useStudioStore((s) => s.commitHistory);
  const mounted = usePresence(isOpen, 180);

  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedAscii, setCopiedAscii] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previous = document.activeElement as HTMLElement | null;
    const focusTimer = requestAnimationFrame(() =>
      closeRef.current?.focus({ preventScroll: true })
    );

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        return;
      }

      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const nodes = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((node) => node.offsetParent !== null);

      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (!panel.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus({ preventScroll: true });
    };
  }, [isOpen, setIsOpen]);

  if (!mounted || !image) return null;

  const currentScale = clampScale(settings.captureScale || 4);
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
      data-state={isOpen ? "open" : "closed"}
      aria-hidden={!isOpen}
      className={`modal-shell fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm ${
        isOpen ? "" : "pointer-events-none"
      }`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-title"
        aria-describedby="export-desc"
        className="modal-panel w-full max-w-[400px] overflow-hidden rounded-2xl border border-line bg-ink-2 shadow-[0_30px_80px_rgba(0,0,0,0.65)]"
      >
        <header className="flex h-14 items-center justify-between border-b border-line/80 pr-4 pl-5">
          <div className="flex items-center gap-2.5">
            <Download
              size={15}
              strokeWidth={1.75}
              aria-hidden="true"
              className="text-signal"
            />
            <h2
              id="export-title"
              className="text-[11px] font-semibold tracking-[0.18em] text-paper uppercase"
            >
              Export
            </h2>
          </div>
          <IconButton
            ref={closeRef}
            label="Close export"
            size="md"
            onClick={() => setIsOpen(false)}
          >
            <X size={17} strokeWidth={1.75} aria-hidden="true" />
          </IconButton>
        </header>

        <div className="space-y-2.5 px-5 pt-4">
          <p id="export-desc" className="sr-only">
            Choose a capture format and scale, then save the current render,
            copy it to the clipboard, or copy its ASCII text.
          </p>

          <div className="space-y-3 rounded-xl border border-line/80 bg-ink-3/40 px-3.5 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[11px] text-paper">Capture</p>
              <span className="font-mono text-[11px] text-faint tabular-nums">
                {exportWidth} × {exportHeight}
              </span>
            </div>

            <Segmented
              label="Image format"
              options={CODECS}
              value={currentCodec}
              onChange={(codec) => updateSettings({ captureCodec: codec })}
            />

            <SliderField
              label="Scale"
              display={`${currentScale}x`}
              min={MIN_SCALE}
              max={MAX_SCALE}
              step={1}
              value={currentScale}
              accent={currentScale > WARN_SCALE ? "#ff6b5a" : "#38f370"}
              marks={[WARN_SCALE]}
              onChange={(value) =>
                updateSettings({ captureScale: clampScale(value) }, false)
              }
              onCommit={() => commitHistory()}
            />

            {currentScale > WARN_SCALE && (
              <p className="text-[10px] leading-relaxed text-alert">
                Above {WARN_SCALE}x takes longer and may fail on large canvases.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2 px-5 pt-4 pb-5">
          <Button
            variant="primary"
            className="w-full"
            onClick={handleSaveImage}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2
                size={16}
                aria-hidden="true"
                className="animate-spin motion-reduce:animate-none"
              />
            ) : (
              <Download size={15} strokeWidth={2} aria-hidden="true" />
            )}
            Save image
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleCopyImageToClipboard}
              disabled={isProcessing}
            >
              {copiedImage ? (
                <Check size={13} aria-hidden="true" className="text-signal" />
              ) : (
                <Clipboard size={13} aria-hidden="true" />
              )}
              {copiedImage ? "Copied" : "Copy image"}
            </Button>

            {settings.renderMode === "ascii" ? (
              <Button
                variant="outline"
                onClick={handleCopyAsciiText}
                disabled={isProcessing}
              >
                {copiedAscii ? (
                  <Check size={13} aria-hidden="true" className="text-signal" />
                ) : (
                  <FileText size={13} aria-hidden="true" />
                )}
                {copiedAscii ? "Copied" : "Copy ASCII"}
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ExportModal);
