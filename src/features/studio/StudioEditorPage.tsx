import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate } from "react-router";

import { useBackHandler } from "@/shared/hooks/useBackHandler";
import { Toaster } from "@/shared/ui/toaster";

import ExportModal from "./components/controls/ExportModal";
import DiscardDialog from "./components/DiscardDialog";
import StudioHeader from "./components/StudioHeader";
import StudioInspector from "./components/StudioInspector";
import StudioViewport from "./components/StudioViewport";
import { useStudioImagePicker } from "./hooks/useStudioImagePicker";
import { selectIsDirty, useStudioStore } from "./store/studioStore";

export default function StudioEditorPage() {
  const navigate = useNavigate();
  const image = useStudioStore((s) => s.image);
  const isDirty = useStudioStore(selectIsDirty);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hadImage] = useState(image !== null);

  const { fileInputRef, openFilePicker, handleFileInputChange } =
    useStudioImagePicker();

  const leaveToStudio = useCallback(() => {
    if ((window.history.state?.idx ?? 0) > 0) {
      navigate(-1);
      return;
    }

    navigate("/studio", { replace: true });
  }, [navigate]);

  const openDiscardDialog = useCallback(() => {
    if (useStudioStore.getState().isExporting) {
      toast("Export in progress");
      return;
    }

    setConfirmOpen(true);
  }, []);

  useBackHandler(isDirty, openDiscardDialog);

  const requestExit = useCallback(() => {
    if (useStudioStore.getState().isExporting) {
      toast("Export in progress");
      return;
    }

    if (isDirty) {
      setConfirmOpen(true);
      return;
    }

    leaveToStudio();
  }, [isDirty, leaveToStudio]);

  const discardAndLeave = useCallback(() => {
    setConfirmOpen(false);

    const controller = useStudioStore.getState().workerController;
    useStudioStore.getState().discardSession();
    controller?.destroy();

    leaveToStudio();
  }, [leaveToStudio]);

  const keepEditing = useCallback(() => setConfirmOpen(false), []);

  if (!image) {
    // A discard clears the image before its history entry is popped. Only a
    // fresh load with no session should redirect.
    return hadImage ? null : <Navigate to="/studio" replace />;
  }

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

      <StudioHeader
        editing
        onBack={requestExit}
        onOpenFilePicker={openFilePicker}
      />

      <main className="relative flex min-h-0 flex-1 overflow-hidden">
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <StudioViewport />
        </div>
        <StudioInspector />
      </main>

      <ExportModal />

      <DiscardDialog
        open={confirmOpen}
        onKeepEditing={keepEditing}
        onDiscard={discardAndLeave}
      />
    </div>
  );
}
