import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { SettingsControlsProvider } from "@/shared/components/settings/common/SettingsControlsProvider";
import { Button } from "@/shared/ui/buttons";
import { Toaster } from "@/shared/ui/toaster";
import { saveImage } from "@/shared/utils/saveImage";

import CameraControls from "./components/cameraControls";
import Header from "./components/header";
import Settings from "./components/settings";
import type { ViewportHandle } from "./components/viewport";
import Viewport from "./components/viewport";
import { useSettingsControlsValue } from "./hooks/useSettingsControlsValue";
import type { CameraFacingMode } from "./types";
import { getSupportedMediaRecorderMimeType } from "./utils/mediaRecorder";
import { saveVideo } from "./utils/saveVideo";

function Cam() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<CameraFacingMode>("user");
  const [flipTurns, setFlipTurns] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [frameSize, setFrameSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [flash, setFlash] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraAttempt, setCameraAttempt] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const controls = useSettingsControlsValue();
  const viewportRef = useRef<ViewportHandle>(null);
  const desktopSettingsRef = useRef<HTMLButtonElement>(null);
  const mobileSettingsRef = useRef<HTMLButtonElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    let currentStream: MediaStream | null = null;

    const start = async () => {
      try {
        const video = await navigator.mediaDevices.getUserMedia({
          video: {
            height: { ideal: 1080 },
            width: { ideal: 1920 },
            facingMode,
          },
          audio: false,
        });
        if (!active) {
          video.getTracks().forEach((t) => t.stop());
          return;
        }
        currentStream = video;
        setCameraError(null);
        setStream(video);
      } catch (err) {
        console.error(err);
        setCameraError(
          "Allow camera access in your browser, then try again. The camera may also be in use by another app."
        );
      }
    };
    start();

    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);

    return () => {
      active = false;
      currentStream?.getTracks().forEach((t) => t.stop());
      setStream(null);
      window.removeEventListener("resize", handleResize);
    };
  }, [facingMode, cameraAttempt]);

  useEffect(
    () => () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }
    },
    []
  );

  const toggleCamera = useCallback(() => {
    setFlipTurns((turns) => turns + 1);
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const handleStageSize = useCallback(
    (size: { width: number; height: number }) => {
      setFrameSize((prev) =>
        prev.width === size.width && prev.height === size.height ? prev : size
      );
    },
    []
  );

  const takeSnapshot = useCallback(async () => {
    if (!viewportRef.current) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 220);

    try {
      const imageUrl = await viewportRef.current.captureImage();
      const fileName = `ascii-capture-${Date.now()}.png`;
      await saveImage(imageUrl, fileName);
      toast.success("Image saved");
    } catch (err) {
      console.error("Capture failed", err);
      toast.error("Capture isn't supported for this render mode yet.");
    }
  }, []);

  const copyToClipboard = useCallback(async () => {
    if (!viewportRef.current) return;
    try {
      const copyContent = await viewportRef.current.getAsciiText();
      if (!copyContent) throw new Error("No text available");
      await navigator.clipboard.writeText(copyContent);
      toast.success("ASCII copied");
    } catch (err) {
      console.log("Copy failed:", err);
      toast.error("Couldn't copy ASCII text");
    }
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      }
      setIsRecording(false);
      return;
    }

    const canvas = viewportRef.current?.getCanvas();
    if (!canvas || !canvas.width || !canvas.height) {
      toast.error("Renderer isn't ready for recording.");
      return;
    }

    const videoBitsPerSecond = 2_500_000;
    const canvasStream = canvas.captureStream(30);

    try {
      const mimeType = getSupportedMediaRecorderMimeType();
      if (!mimeType) throw new Error("No supported video codec found");

      const recorder = new MediaRecorder(canvasStream, {
        mimeType,
        videoBitsPerSecond,
      });
      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        try {
          const blob = new Blob(recordedChunksRef.current, {
            type: mimeType,
          });

          const extension = mimeType.includes("mp4") ? "mp4" : "webm";
          const fileName = `ascii-video-${Date.now()}.${extension}`;

          await saveVideo(blob, fileName);
          toast.success("Video saved");
          setRecordingTime(0);
        } catch (err) {
          console.error("Failed to save recording:", err);
          toast.error("Failed to save recording");
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (err) {
      console.error("Recording failed to start", err);
      toast.error("Recording isn't supported in this browser.");
    }
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-ink">
      <Toaster />

      <SettingsControlsProvider value={controls}>
        <Header
          width={frameSize.width}
          height={frameSize.height}
          settingsButtonRef={desktopSettingsRef}
          onOpenSettings={openSettings}
          settingsOpen={settingsOpen}
        />
        <Settings
          open={settingsOpen}
          onClose={closeSettings}
          triggerRef={mobileSettingsRef}
          desktopTriggerRef={desktopSettingsRef}
        />

        {flash && (
          <div className="flash-layer pointer-events-none fixed inset-0 z-50 bg-paper" />
        )}

        {isRecording && (
          <div
            role="status"
            className="notice-enter fixed top-[calc(env(safe-area-inset-top)+4.75rem)] left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-signal/40 bg-ink-2/90 px-3 py-1.5 font-mono text-[10px] backdrop-blur-xl"
          >
            <span
              aria-hidden="true"
              className="recording-dot size-1.5 rounded-full bg-signal"
            />
            <span className="tracking-[0.16em] text-signal">REC</span>
            <span className="text-paper tabular-nums">
              {formatTime(recordingTime)}
            </span>
          </div>
        )}

        <Viewport
          ref={viewportRef}
          stream={stream}
          canvasSize={windowSize}
          mirrored={facingMode === "user"}
          onFlip={toggleCamera}
          gesturesDisabled={isRecording}
          editorOpen={settingsOpen}
          onOpenEditor={openSettings}
          onCloseEditor={closeSettings}
          onStageSize={handleStageSize}
        />

        {!stream && !cameraError && (
          <div className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <span
                aria-hidden="true"
                className="relative h-px w-40 overflow-hidden bg-line"
              >
                <span className="request-line absolute inset-y-0 w-1/3 bg-signal" />
              </span>
              <p className="font-mono text-[10px] tracking-[0.24em] text-faint uppercase">
                Initialising camera
              </p>
            </div>
          </div>
        )}

        {cameraError && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/85 p-6 backdrop-blur-md">
            <div
              role="alertdialog"
              aria-labelledby="camera-error-title"
              aria-describedby="camera-error-copy"
              className="notice-enter w-full max-w-sm rounded-2xl border border-line bg-ink-2 p-6"
            >
              <p className="font-mono text-[10px] tracking-[0.2em] text-alert uppercase">
                Camera offline
              </p>
              <h1
                id="camera-error-title"
                className="mt-2 text-lg font-medium text-paper"
              >
                No camera signal
              </h1>
              <p
                id="camera-error-copy"
                className="mt-2 text-xs leading-relaxed text-muted"
              >
                {cameraError}
              </p>

              <div className="mt-5 flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => {
                    setCameraError(null);
                    setCameraAttempt((n) => n + 1);
                  }}
                >
                  Try again
                </Button>
                <Button variant="ghost" onClick={() => setCameraError(null)}>
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

        <CameraControls
          onFlip={toggleCamera}
          flipTurns={flipTurns}
          onShot={takeSnapshot}
          onCopy={copyToClipboard}
          onToggleRecording={toggleRecording}
          onOpenSettings={openSettings}
          isRecording={isRecording}
          formatTime={formatTime}
          recordingTime={recordingTime}
          settingsOpen={settingsOpen}
          settingsButtonRef={mobileSettingsRef}
        />
      </SettingsControlsProvider>
    </div>
  );
}

export default Cam;
