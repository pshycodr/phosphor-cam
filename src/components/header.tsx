import { memo } from "react";

import { useStatsStore } from "../store/statsStore";

interface HeaderProps {
  width: number;
  height: number;
}

const FPSValue = memo(function FPSValue() {
  const fps = useStatsStore((s) => s.fps);

  return <span className="font-semibold tabular-nums">{Math.floor(fps)}</span>;
});

const RenderTimeValue = memo(function RenderTimeValue() {
  const renderTime = useStatsStore((s) => s.renderTime);

  return (
    <span className="font-semibold tabular-nums">
      {Math.floor(renderTime)}ms
    </span>
  );
});

const Divider = () => (
  <span aria-hidden="true" className="h-3 w-px shrink-0 bg-green-500/40" />
);

function Header({ width, height }: HeaderProps) {
  return (
    <div className="pointer-events-none fixed top-[max(1rem,env(safe-area-inset-top))] left-[max(1rem,env(safe-area-inset-left))] z-10 flex max-w-[calc(100vw-5.5rem)] flex-col items-start gap-2 select-none">
      <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-black/40 px-3 py-2 shadow-lg backdrop-blur-sm">
        <img
          src="/assets/logo.webp"
          alt=""
          width={32}
          height={32}
          draggable={false}
          className="size-7 object-contain md:size-8"
        />

        <h1 className="text-base leading-none font-bold tracking-tight whitespace-nowrap text-green-400 sm:text-lg md:text-xl">
          PHOSPHOR CAM
        </h1>
      </div>

      <div
        className="flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-lg border border-green-500/30 bg-black/40 px-3 py-2 font-mono text-[10px] text-green-400 shadow-lg backdrop-blur-sm sm:gap-x-3 md:text-xs"
        aria-label="Live stats"
      >
        <span className="flex items-center gap-1">
          <span className="opacity-60">FPS</span>
          <FPSValue />
        </span>

        <Divider />

        <span className="flex items-center gap-1">
          <span className="hidden opacity-60 sm:inline">RENDER</span>
          <RenderTimeValue />
        </span>

        <Divider />

        <span className="flex items-center gap-1 whitespace-nowrap">
          <span className="hidden opacity-60 sm:inline">RES</span>
          <span className="font-semibold tabular-nums">
            {width}×{height}
          </span>
        </span>
      </div>
    </div>
  );
}

export default memo(Header);
