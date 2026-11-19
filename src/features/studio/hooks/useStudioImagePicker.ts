import { useCallback, useRef } from "react";
import toast from "react-hot-toast";

import { useStudioStore } from "../store/studioStore";
import { loadBoundedStudioImage } from "../utils/imageSource";

/**
 * Loads an uploaded image into Studio. `onLoaded` runs after the store has the
 * image, so the empty screen can push /studio/edit without a separate effect.
 */
export function useStudioImagePicker(onLoaded?: () => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadImage = useStudioStore((s) => s.loadImage);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const processFile = useCallback(
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
        onLoaded?.();
      } catch (err) {
        console.error("Error loading image file", err);
        toast.error("Failed to load image. The file may be corrupted.");
      }
    },
    [loadImage, onLoaded]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void processFile(file);
      e.target.value = "";
    },
    [processFile]
  );

  return { fileInputRef, openFilePicker, processFile, handleFileInputChange };
}
