import { useCallback, useRef } from "react";
import toast from "react-hot-toast";

import { Toaster } from "@/shared/ui/toaster";

import ExportModal from "./components/controls/ExportModal";
import StudioEmptyState from "./components/StudioEmptyState";
import StudioHeader from "./components/StudioHeader";
import StudioInspector from "./components/StudioInspector";
import StudioViewport from "./components/StudioViewport";
import { useStudioStore } from "./store/studioStore";
import { loadBoundedStudioImage } from "./utils/imageSource";

export default function StudioPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const image = useStudioStore((s) => s.image);
  const loadImage = useStudioStore((s) => s.loadImage);

  const handleOpenFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileProcess = useCallback(
    async (file: File) => {
      if (file.type.startsWith("video/")) {
        toast(
          "Video editing is coming soon in the next update! Please select an image for now.",
          { icon: "🎬", duration: 4500 }
        );
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Unsupported file type. Please select an image.");
        return;
      }

      try {
        const source = await loadBoundedStudioImage(file);

        loadImage(file, source.url, file.name, source.width, source.height);
        toast.success(`Loaded ${file.name}`);
      } catch (err) {
        console.error("Error loading image file", err);
        toast.error("Failed to load image. The file may be corrupted.");
      }
    },
    [loadImage]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileProcess(file);
      }
      e.target.value = "";
    },
    [handleFileProcess]
  );

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-ink text-paper select-none">
      <Toaster duration={2400} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <StudioHeader onOpenFilePicker={handleOpenFilePicker} />

      <main className="relative flex min-h-0 flex-1 overflow-hidden">
        {image ? (
          <>
            <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
              <StudioViewport />
            </div>
            <StudioInspector />
          </>
        ) : (
          <StudioEmptyState
            onOpenFilePicker={handleOpenFilePicker}
            onFileSelected={handleFileProcess}
          />
        )}
      </main>

      <ExportModal />
    </div>
  );
}
