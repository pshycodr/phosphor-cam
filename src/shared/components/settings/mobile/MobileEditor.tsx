import {
  memo,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import {
  LuCamera,
  LuChevronDown,
  LuPalette,
  LuShapes,
  LuSlidersHorizontal,
  LuSparkles,
  LuType,
  LuX,
} from "react-icons/lu";

import { Drawer } from "vaul";

import Collapse from "../common/Collapse";
import { useSettingsSelector } from "../common/useSettingsControls";
import AdjustTool from "./tools/AdjustTool";
import CaptureTool from "./tools/CaptureTool";
import CharsTool from "./tools/CharsTool";
import EffectsTool, { EffectsTabBadge } from "./tools/EffectsTool";
import PaletteTool from "./tools/PaletteTool";
import StyleTool from "./tools/StyleTool";
import { type EditorTool, DOCK_HEIGHT_VAR } from "./types";

interface MobileEditorProps {
  persistent?: boolean;
  open?: boolean;
  onClose?: () => void;
  defaultTool?: string | null;
  leadingTools?: EditorTool[];
  trailingTools?: EditorTool[];
  showCapture?: boolean;
}

const ICON = 20;

function MobileEditor({
  persistent = false,
  open = true,
  onClose,
  defaultTool = null,
  leadingTools = [],
  trailingTools = [],
  showCapture = true,
}: MobileEditorProps) {
  const uid = useId();
  const renderMode = useSettingsSelector((s) => s.renderMode);
  const visible = persistent || open;

  const [activeId, setActiveId] = useState<string | null>(defaultTool);
  const [lastId, setLastId] = useState<string | null>(defaultTool);
  if (activeId && activeId !== lastId) setLastId(activeId);

  const tools = useMemo<EditorTool[]>(() => {
    const builtIn: EditorTool[] = [
      {
        id: "style",
        label: "Style",
        icon: <LuShapes size={ICON} />,
        content: <StyleTool />,
      },
      {
        id: "adjust",
        label: "Adjust",
        icon: <LuSlidersHorizontal size={ICON} />,
        content: <AdjustTool />,
      },
      {
        id: "effects",
        label: "Effects",
        icon: <LuSparkles size={ICON} />,
        badge: <EffectsTabBadge />,
        content: <EffectsTool />,
      },
      {
        id: "chars",
        label: "Chars",
        icon: <LuType size={ICON} />,
        content: <CharsTool />,
        visible: renderMode === "ascii",
      },
      {
        id: "palette",
        label: "Color",
        icon: <LuPalette size={ICON} />,
        content: <PaletteTool />,
      },
      {
        id: "capture",
        label: "Capture",
        icon: <LuCamera size={ICON} />,
        content: <CaptureTool />,
        visible: showCapture,
      },
    ];
    return [...leadingTools, ...builtIn, ...trailingTools].filter(
      (t) => t.visible !== false
    );
  }, [leadingTools, trailingTools, renderMode, showCapture]);

  const active = tools.find((t) => t.id === activeId) ?? null;
  const shown = active ?? tools.find((t) => t.id === lastId) ?? null;
  const panelOpen = active !== null;

  const collapse = useCallback(() => setActiveId(null), []);
  const toggle = useCallback(
    (id: string) => setActiveId((cur) => (cur === id ? null : id)),
    []
  );

  const [dockEl, setDockEl] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!visible || !dockEl) return;
    const root = document.documentElement;
    const apply = () =>
      root.style.setProperty(
        DOCK_HEIGHT_VAR,
        `${Math.round(dockEl.getBoundingClientRect().height)}px`
      );
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(dockEl);
    return () => {
      ro.disconnect();
      root.style.removeProperty(DOCK_HEIGHT_VAR);
    };
  }, [visible, dockEl]);

  useEffect(() => {
    if (!activeId) return;
    document
      .getElementById(`${uid}-tab-${activeId}`)
      ?.scrollIntoView({ inline: "nearest", block: "nearest" });
  }, [activeId, uid]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && panelOpen) {
      e.stopPropagation();
      collapse();
    }
  };

  const panelId = `${uid}-panel`;

  const body = (
    <>
      <Collapse open={panelOpen} id={panelId}>
        <div className="bg-ink-2/60">
          <div className="flex items-center justify-between px-4 pt-1">
            <h2 className="text-[10px] font-medium tracking-[0.2em] text-signal uppercase">
              {shown?.label}
            </h2>
            <button
              type="button"
              onClick={collapse}
              aria-label="Collapse panel"
              className="press -mr-2 flex size-11 items-center justify-center rounded-full text-faint hover:bg-ink-3 hover:text-paper"
            >
              <LuChevronDown size={17} aria-hidden="true" />
            </button>
          </div>

          <div
            role="tabpanel"
            aria-labelledby={shown ? `${uid}-tab-${shown.id}` : undefined}
            className="max-h-[38dvh] overflow-y-auto overscroll-contain px-4 pt-1 pb-3"
          >
            {shown?.content}
          </div>
        </div>
      </Collapse>

      <div className="flex items-stretch border-t border-line/60">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close editor"
            className="press m-1 flex w-12 shrink-0 items-center justify-center rounded-xl text-faint hover:bg-ink-3 hover:text-paper"
          >
            <LuX size={18} aria-hidden="true" />
          </button>
        )}

        <div
          role="tablist"
          aria-label="Editing tools"
          className="flex min-w-0 flex-1 snap-x scroll-px-1 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {tools.map((tool) => {
            const selected = tool.id === activeId;
            return (
              <button
                key={tool.id}
                id={`${uid}-tab-${tool.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={panelId}
                onClick={() => toggle(tool.id)}
                className={`relative flex h-14 shrink-0 grow basis-[50px] snap-start flex-col items-center justify-center gap-1 rounded-xl px-0.5 transition-colors ${
                  selected
                    ? "text-signal"
                    : "text-faint hover:text-muted active:bg-ink-3"
                }`}
              >
                {selected && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 h-0.5 w-6 rounded-full bg-signal"
                  />
                )}
                <span className="relative">
                  {tool.icon}
                  {tool.badge}
                </span>
                <span className="text-[9px] font-medium tracking-[0.12em] uppercase">
                  {tool.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  if (persistent) {
    return (
      <div
        ref={setDockEl}
        role="region"
        aria-label="Editing tools"
        data-open="true"
        onKeyDown={onKeyDown}
        className="sheet-shell translucent fixed inset-x-0 bottom-0 z-40 rounded-t-[22px] border-t border-line/80 bg-ink-2/95 pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl select-none"
      >
        {body}
      </div>
    );
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose?.();
      }}
      modal={false}
      dismissible={!!onClose}
      noBodyStyles
      autoFocus={false}
      closeThreshold={0.3}
    >
      <Drawer.Portal>
        <Drawer.Content
          ref={setDockEl}
          role="region"
          aria-label="Editing tools"
          style={{ touchAction: "pan-y" }}
          className="translucent fixed inset-x-0 bottom-0 z-40 flex flex-col rounded-t-[22px] border-t border-line/80 bg-ink-2/95 pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl outline-none select-none"
        >
          <Drawer.Title className="sr-only">Editing tools</Drawer.Title>

          <div
            aria-hidden="true"
            className="flex shrink-0 cursor-grab justify-center pt-2.5 pb-1 active:cursor-grabbing"
          >
            <span className="h-1 w-10 rounded-full bg-line-strong" />
          </div>

          {body}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default memo(MobileEditor);
