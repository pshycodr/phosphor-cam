import { memo, type RefObject } from "react";
import { Link } from "react-router";

import { SlidersHorizontal, Sparkles } from "lucide-react";

import { useStatsStore } from "../store/statsStore";

interface HeaderProps {
  width: number;
  height: number;
  settingsButtonRef: RefObject<HTMLButtonElement | null>;
  onOpenSettings: () => void;
  settingsOpen: boolean;
}

const FPSValue = memo(function FPSValue() {
  const fps = useStatsStore((s) => s.fps);
  return <>{Math.floor(fps)}</>;
});

const RenderTimeValue = memo(function RenderTimeValue() {
  const renderTime = useStatsStore((s) => s.renderTime);
  return <>{Math.floor(renderTime)}</>;
});

const Divider = () => (
  <span aria-hidden="true" className="h-4 w-px shrink-0 bg-line" />
);

function Header({
  width,
  height,
  settingsButtonRef,
  onOpenSettings,
  settingsOpen,
}: HeaderProps) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-2 pt-[max(0.75rem,env(safe-area-inset-top))] pr-[max(0.75rem,env(safe-area-inset-right))] pl-[max(0.75rem,env(safe-area-inset-left))] select-none">
      <div className="pointer-events-auto flex h-11 min-w-0 items-center gap-3 rounded-full border border-line/80 bg-ink-2/80 pr-3.5 pl-2.5 backdrop-blur-xl">
        <img
          src="/assets/logo.png"
          alt=""
          width={26}
          height={26}
          draggable={false}
          className="size-6 object-contain"
        />

        <span className="truncate text-[11px] font-semibold tracking-[0.16em] text-paper uppercase">
          Phosphor Cam
        </span>

        <Divider />

        <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted">
          <span
            aria-hidden="true"
            className="recording-dot size-1.5 rounded-full bg-signal"
          />
          LIVE
        </span>

        <span
          className="hidden font-mono text-[10px] text-faint tabular-nums min-[420px]:inline"
          aria-label="Live frame rate"
        >
          <FPSValue />
          <span className="ml-1 text-[9px] tracking-wide">FPS</span>
        </span>
      </div>

      <div
        className={`${
          settingsOpen ? "hidden lg:flex" : "hidden md:flex"
        } pointer-events-auto h-11 items-center gap-3 rounded-full border border-line/80 bg-ink-2/80 px-3.5 font-mono text-[10px] text-faint tabular-nums backdrop-blur-xl`}
      >
        <span>
          <span className="text-faint">render</span>{" "}
          <span className="text-paper">
            <RenderTimeValue />
            ms
          </span>
        </span>
        <Divider />
        <span>
          <span className="text-faint">frame</span>{" "}
          <span className="text-paper">
            {width}×{height}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to="/studio"
          aria-label="Open Phosphor Studio"
          className="press pointer-events-auto flex h-11 items-center gap-2 rounded-full border border-line/80 bg-ink-2/80 px-4 text-[11px] font-medium tracking-wide text-paper uppercase backdrop-blur-xl hover:border-line-strong hover:bg-ink-3"
        >
          <Sparkles size={14} strokeWidth={1.75} aria-hidden="true" />
          <span className="hidden min-[380px]:inline">Studio</span>
        </Link>

        <button
          ref={settingsButtonRef}
          type="button"
          aria-label="Open settings"
          title="Open settings"
          onClick={onOpenSettings}
          className="press pointer-events-auto hidden size-11 items-center justify-center rounded-full border border-line/80 bg-ink-2/80 text-muted backdrop-blur-xl hover:border-line-strong hover:bg-ink-3 hover:text-paper sm:flex"
        >
          <SlidersHorizontal size={16} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

export default memo(Header);
