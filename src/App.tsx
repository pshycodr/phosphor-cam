import { useCallback, useEffect, useRef, useState } from "react";
import { MdCancel } from "react-icons/md";

import CameraControls from "@/components/cameraControls";
import Header from "@/components/header";
import Settings from "@/components/settings";
import type { CameraFacingMode } from "@/types";

import Viewport, { type ViewportHandle } from "./components/viewport";
import { getSupportedMediaRecorderMimeType } from "./utils/mediaRecorder";

function App() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<CameraFacingMode>("user");
  const [isRecording, setIsRecording] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [flash, setFlash] = useState(false);
  const [clipboardSuccess, setClipboardSuccess] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Only one ref into the render layer now, instead of a ref threaded
  // through AsciiView into whichever renderer happened to be mounted.
  const viewportRef = useRef<ViewportHandle>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  console.log(process.env.NODE_ENV);

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
        setStream(video);
      } catch (err) {
        console.error(err);
        setError(
          "Unable to access camera. Please ensure permissions are granted."
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
  }, [facingMode]);

  const toggleCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  const takeSnapshot = useCallback(async () => {
    if (!viewportRef.current) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    try {
      const imageUrl = await viewportRef.current.captureImage();
      const a = document.createElement("a");
      a.href = imageUrl;
      a.download = `ascii-capture-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Capture failed", err);
      setError("Capture isn't supported for this render mode yet.");
    }
  }, []);

  const copyToClipboard = useCallback(() => {
    if (!viewportRef.current) return;
    try {
      const copyContent = viewportRef.current.getAsciiText();
      if (!copyContent) throw new Error();
      navigator.clipboard.writeText(copyContent).then(() => {
        setClipboardSuccess(true);
        setTimeout(() => setClipboardSuccess(false), 2000);
      });
    } catch (err) {
      console.log("Copy Failed:", err);
      setError("Failed to Copy. Please try again");
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
      setError("Renderer not ready for recording.");
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

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ascii-video-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setRecordingTime(0);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (err) {
      console.error("Recording failed to start", err);
      setError(
        "Failed to start recording. Browser might not support this format."
      );
    }
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-screen w-screen overflow-hidden">
      {/* No settings/stats props - Header and Settings read straight from their stores */}
      <Header width={windowSize.width} height={windowSize.height} />
      <Settings />

      {flash && (
        <div className="animate-out fade-out pointer-events-none fixed inset-0 z-50 bg-white duration-150" />
      )}

      {clipboardSuccess && (
        <div className="animate-in zoom-in fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded border border-green-500 bg-black/80 px-6 py-3 font-bold text-green-400 backdrop-blur duration-200">
          ASCII COPIED TO CLIPBOARD
        </div>
      )}

      {error && (
        <div className="animate-in zoom-in fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded border border-red-500 bg-black/80 px-6 py-4 font-bold text-red-500 backdrop-blur duration-200">
          <button
            onClick={() => setError(null)}
            className="absolute top-3 right-3 text-xl leading-none text-red-500 hover:text-red-400"
            aria-label="Close error"
          >
            <MdCancel />
          </button>
          <div>
            <h1 className="mb-4 text-4xl">SYSTEM ERROR</h1>
            <p>{error}</p>
          </div>
        </div>
      )}

      <Viewport ref={viewportRef} stream={stream} canvasSize={windowSize} />

      <CameraControls
        onFlip={toggleCamera}
        onShot={takeSnapshot}
        onCopy={copyToClipboard}
        onToggleRecording={toggleRecording}
        isRecording={isRecording}
        formatTime={formatTime}
        recordingTime={recordingTime}
      />
    </div>
  );
}

export default App;
