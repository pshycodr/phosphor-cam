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

interface StatsProps {
  width: number;
  height: number;
  /** Controls when the text labels (FPS / render / frame) are visible. */
  labelClassName?: string;
}

const Stats = memo(function Stats({
  width,
  height,
  labelClassName = "",
}: StatsProps) {
  return (
    <>
      <span aria-label="Live frame rate" className="whitespace-nowrap">
        <span
          className={`mr-1 text-[9px] tracking-wide text-faint ${labelClassName}`}
        >
          FPS
        </span>
        <span className="text-paper">
          <FPSValue />
        </span>
      </span>

      <Divider />

      <span className="whitespace-nowrap">
        <span className={`mr-1 text-faint ${labelClassName}`}>render</span>
        <span className="text-paper">
          <RenderTimeValue />
          ms
        </span>
      </span>

      <Divider />

      <span className="whitespace-nowrap">
        <span className={`mr-1 text-faint ${labelClassName}`}>frame</span>
        <span className="text-paper">
          {width}×{height}
        </span>
      </span>
    </>
  );
});

const MobileStats = memo(function MobileStats({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  return (
    <div className="pointer-events-auto flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-line/80 bg-ink-2/85 px-2.5 backdrop-blur-xl">
      <span className="relative grid size-7 shrink-0 place-items-center rounded-full border border-signal/25 bg-signal/10">
        <img
          src="/assets/logo.png"
          alt=""
          width={22}
          height={22}
          draggable={false}
          className="size-[22px] object-contain drop-shadow-[0_0_7px_rgba(56,243,112,0.55)]"
        />
        <span
          aria-hidden="true"
          className="recording-dot absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-signal"
        />
      </span>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-1.5 font-mono text-[10px] text-faint tabular-nums">
        <span aria-label="Live frame rate" className="whitespace-nowrap">
          <span className="mr-1 text-[9px] tracking-wide text-faint">FPS</span>
          <span className="text-paper">
            <FPSValue />
          </span>
        </span>

        <Divider />

        <span className="whitespace-nowrap">
          <span className="mr-0.5 text-[9px] text-faint">render</span>
          <span className="text-paper">
            <RenderTimeValue />
            ms
          </span>
        </span>

        <Divider />

        <span className="whitespace-nowrap">
          <span className="mr-0.5 text-[9px] text-faint">frame</span>
          <span className="text-paper">
            {width}×{height}
          </span>
        </span>
      </div>
    </div>
  );
});

const StudioLink = memo(function StudioLink({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <Link
      to="/studio"
      aria-label="Open Phosphor Studio"
      className={`press pointer-events-auto flex h-11 shrink-0 items-center gap-2 rounded-full border border-line/80 bg-ink-2/85 font-medium text-paper uppercase backdrop-blur-xl hover:bg-ink-3 ${
        compact
          ? "px-3.5 text-[10px] tracking-[0.14em] hover:border-signal/40"
          : "px-4 text-[11px] tracking-wide hover:border-line-strong"
      }`}
    >
      <Sparkles
        size={14}
        strokeWidth={1.75}
        aria-hidden="true"
        className={compact ? "text-signal" : ""}
      />
      <span className={compact ? "hidden min-[380px]:inline" : ""}>Studio</span>
    </Link>
  );
});

function Header({
  width,
  height,
  settingsButtonRef,
  onOpenSettings,
  settingsOpen,
}: HeaderProps) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-2 pt-[max(0.75rem,env(safe-area-inset-top))] pr-[max(0.75rem,env(safe-area-inset-right))] pl-[max(0.75rem,env(safe-area-inset-left))] select-none">
      <div className="flex w-full items-center gap-2 sm:hidden">
        <MobileStats width={width} height={height} />
        <StudioLink compact />
      </div>

      <div className="hidden w-full items-center justify-between gap-2 sm:flex">
        <div className="pointer-events-auto flex h-11 min-w-0 items-center gap-3 rounded-full border border-line/80 bg-ink-2/80 pr-3.5 pl-2.5 backdrop-blur-xl">
          <img
            src="/assets/logo.png"
            alt="Phosphor Cam"
            width={26}
            height={26}
            draggable={false}
            className="size-6 shrink-0 object-contain"
          />

          <span className="hidden truncate text-[11px] font-semibold tracking-[0.16em] text-paper uppercase md:inline">
            Phosphor Cam
          </span>
        </div>

        <div
          className={`${
            settingsOpen ? "hidden lg:flex" : "hidden sm:flex"
          } pointer-events-auto h-11 items-center gap-3 rounded-full border border-line/80 bg-ink-2/80 px-3.5 font-mono text-[10px] text-faint tabular-nums backdrop-blur-xl`}
        >
          <Stats width={width} height={height} />
        </div>

        <div className="flex items-center gap-2">
          <StudioLink />

          <button
            ref={settingsButtonRef}
            type="button"
            aria-label="Open settings"
            title="Open settings"
            onClick={onOpenSettings}
            className="press pointer-events-auto hidden size-11 items-center justify-center rounded-full border border-line/80 bg-ink-2/80 text-muted backdrop-blur-xl hover:border-line-strong hover:bg-ink-3 hover:text-paper sm:flex"
          >
            <SlidersHorizontal
              size={16}
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </header>
  );
}

export default memo(Header);
