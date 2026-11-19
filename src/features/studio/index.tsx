import { useCallback } from "react";
import { useNavigate } from "react-router";

import { Toaster } from "@/shared/ui/toaster";

import StudioEmptyState from "./components/StudioEmptyState";
import StudioHeader from "./components/StudioHeader";
import { useStudioImagePicker } from "./hooks/useStudioImagePicker";

export default function StudioPage() {
  const navigate = useNavigate();
  const openEditor = useCallback(() => navigate("/studio/edit"), [navigate]);
  const { fileInputRef, openFilePicker, processFile, handleFileInputChange } =
    useStudioImagePicker(openEditor);

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

      <StudioHeader />

      <main className="relative flex min-h-0 flex-1 overflow-hidden">
        <StudioEmptyState
          onOpenFilePicker={openFilePicker}
          onFileSelected={processFile}
          onSampleLoaded={openEditor}
        />
      </main>
    </div>
  );
}
