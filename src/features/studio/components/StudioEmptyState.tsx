import { memo, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { Clipboard, Upload } from "lucide-react";

import { Button } from "@/shared/ui/buttons";

import { useStudioStore } from "../store/studioStore";
import { loadBoundedStudioImage } from "../utils/imageSource";

interface StudioEmptyStateProps {
  onOpenFilePicker: () => void;
  onFileSelected: (file: File) => void;
  onSampleLoaded: () => void;
}

const SAMPLES = [
  { title: "Clock Tower", url: "/studio/img1.jpg" },
  { title: "Flower", url: "/studio/img2.jpg" },
  { title: "People sitting", url: "/studio/img3.jpg" },
];

function StudioEmptyState({
  onOpenFilePicker,
  onFileSelected,
  onSampleLoaded,
}: StudioEmptyStateProps) {
  const loadImage = useStudioStore((s) => s.loadImage);
  const [isDragging, setIsDragging] = useState(false);
  const dragDepth = useRef(0);

  const acceptFile = (file: File | undefined | null) => {
    if (!file) return false;
    if (file.type.startsWith("image/")) {
      onFileSelected(file);
      return true;
    }
    toast.error(
      file.type.startsWith("video/")
        ? "Video editing is coming soon. Please choose an image."
        : "Please choose an image file."
    );
    return false;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);
    acceptFile(e.dataTransfer.files[0]);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragDepth.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) setIsDragging(false);
  };

  const handlePasteButton = async () => {
    try {
      for (const item of await navigator.clipboard.read()) {
        const type = item.types.find((t) => t.startsWith("image/"));
        if (type) {
          const blob = await item.getType(type);
          onFileSelected(
            new File([blob], `pasted-${Date.now()}.png`, { type })
          );
          return;
        }
      }
      toast.error("No image found in clipboard");
    } catch {
      toast.error("Clipboard access was denied or not supported");
    }
  };

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = e.clipboardData?.files?.[0];
      if (file?.type.startsWith("image/")) onFileSelected(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onFileSelected]);

  const loadSample = async (url: string, title: string) => {
    try {
      const source = await loadBoundedStudioImage(url);
      loadImage(null, source.url, `${title}.png`, source.width, source.height);
      onSampleLoaded();
    } catch {
      toast.error("Could not load sample image");
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="flex h-full w-full items-center justify-center overflow-y-auto px-4 py-10 select-none"
    >
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="font-mono text-[9px] tracking-[0.24em] text-faint uppercase">
            Phosphor Cam · Studio
          </p>
          <h2 className="mt-3 text-xl font-medium tracking-tight text-paper">
            Open an image to begin
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-[11px] leading-relaxed text-muted">
            ASCII, dither, halftone, lines, and voxel renders, tuned live.
          </p>
        </div>

        <div
          className={`rounded-2xl border border-dashed px-6 py-8 text-center transition-colors ${
            isDragging
              ? "border-signal/60 bg-signal/5"
              : "border-line-strong bg-ink-2/40"
          }`}
        >
          <span
            className={`mx-auto flex size-11 items-center justify-center rounded-full border ${
              isDragging
                ? "border-signal/50 bg-signal/10 text-signal"
                : "border-line/80 bg-ink-3/60 text-muted"
            }`}
          >
            <Upload size={18} aria-hidden="true" />
          </span>

          <p className="mt-3 text-xs text-paper">
            {isDragging ? "Release to load" : "Drop an image here"}
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-faint">
            PNG · JPEG · WEBP
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button variant="primary" size="sm" onClick={onOpenFilePicker}>
              <Upload size={14} aria-hidden="true" />
              Select image
            </Button>
            <Button variant="outline" size="sm" onClick={handlePasteButton}>
              <Clipboard size={14} aria-hidden="true" />
              Paste
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[9px] tracking-[0.18em] text-faint uppercase">
              Sample frames
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-line/70" />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {SAMPLES.map(({ title, url }) => (
              <button
                key={url}
                type="button"
                onClick={() => loadSample(url, title)}
                className="press group overflow-hidden rounded-lg border border-line/80 bg-ink-2/60 p-1 text-left hover:border-line-strong"
              >
                <img
                  src={url}
                  alt=""
                  className="h-16 w-full rounded object-cover opacity-70 transition-opacity group-hover:opacity-100"
                />
                <span className="mt-1.5 block truncate px-0.5 text-[9px] text-faint group-hover:text-muted">
                  {title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(StudioEmptyState);
