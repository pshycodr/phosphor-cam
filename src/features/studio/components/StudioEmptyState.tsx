import { memo, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { Clipboard, Upload } from "lucide-react";

import { useStudioStore } from "../store/studioStore";
import { loadBoundedStudioImage } from "../utils/imageSource";

interface StudioEmptyStateProps {
  onOpenFilePicker: () => void;
  onFileSelected: (file: File) => void;
}

const SAMPLES = [
  { title: "Synth Banner", url: "/assets/banner.png" },
  { title: "Phosphor Icon", url: "/assets/icon-foreground.png" },
  { title: "Terminal Badge", url: "/assets/icon-only.png" },
];

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-green-400/70 focus-visible:outline-none";

function StudioEmptyState({
  onOpenFilePicker,
  onFileSelected,
}: StudioEmptyStateProps) {
  const loadImage = useStudioStore((s) => s.loadImage);
  const [isDragging, setIsDragging] = useState(false);
  const dragDepth = useRef(0);

  // Accepts images only; videos aren't supported yet.
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

  // Ctrl/Cmd+V anywhere on the page
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
      className={`flex h-full w-full flex-col items-center justify-center overflow-y-auto px-4 py-8 select-none ${
        isDragging
          ? "bg-green-950/20 outline-2 -outline-offset-8 outline-green-400 outline-dashed"
          : "bg-black"
      }`}
    >
      <div className="flex max-w-md flex-col items-center text-center">
        <h2 className="mb-2 text-2xl font-bold text-white">
          Phosphor <span className="text-green-400">Studio</span>
        </h2>
        <p className="mb-6 text-sm text-zinc-400">
          Drop a photo here to turn it into ASCII, dithering, halftone, lines or
          3D voxels.
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={onOpenFilePicker}
            className={`flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-green-400 ${focusRing}`}
          >
            <Upload size={16} />
            Select image
          </button>
          <button
            type="button"
            onClick={handlePasteButton}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white ${focusRing}`}
          >
            <Clipboard size={16} />
            Paste
          </button>
        </div>

        <div className="mt-10 w-full border-t border-zinc-900 pt-6">
          <p className="mb-3 text-xs text-zinc-500">Or try a demo image</p>
          <div className="grid grid-cols-3 gap-2">
            {SAMPLES.map(({ title, url }) => (
              <button
                key={url}
                type="button"
                onClick={() => loadSample(url, title)}
                className={`group flex flex-col items-center gap-2 rounded-lg p-2 transition-colors hover:bg-zinc-900 ${focusRing}`}
              >
                <img
                  src={url}
                  alt={title}
                  className="h-20 w-full rounded bg-zinc-950 object-contain p-1"
                />
                <span className="text-xs text-zinc-400 group-hover:text-white">
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
