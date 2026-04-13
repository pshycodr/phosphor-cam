import { memo } from "react";

import { ProcessingStats } from "../types/types";

interface HeaderProps extends ProcessingStats {
  width: number;
  height: number;
}

function Header({ fps, renderTime, width, height }: HeaderProps) {
  return (
    <div className="fixed top-4 left-4 z-10 flex max-w-[calc(100vw-100px)] flex-col gap-2">
      <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-black/40 px-3 py-2 shadow-lg backdrop-blur-sm">
        <img
          src="/assets/logo.webp"
          alt="Phosphor Cam Logo"
          className="h-8 w-8 object-contain"
        />
        <h1 className="text-lg leading-none font-bold tracking-tight text-green-400 md:text-xl">
          PHOSPHOR CAM
        </h1>
      </div>

      <div className="flex gap-3 rounded-lg border border-green-500/30 bg-black/40 px-3 py-2 font-mono text-[10px] text-green-400 shadow-lg backdrop-blur-sm md:text-xs">
        <span className="flex items-center gap-1">
          <span className="opacity-60">FPS:</span>
          <span className="font-semibold">{Math.floor(fps)}</span>
        </span>
        <span className="text-green-600">|</span>
        <span className="flex items-center gap-1">
          <span className="opacity-60">RENDER:</span>
          <span className="font-semibold">{Math.floor(renderTime)}ms</span>
        </span>
        <span className="text-green-600">|</span>
        <span className="flex items-center gap-1">
          <span className="opacity-60">RES:</span>
          <span className="font-semibold">
            {width} × {height}
          </span>
        </span>
      </div>
    </div>
  );
}

export default memo(Header);
