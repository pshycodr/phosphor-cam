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

import { useSheetDrag } from "@/shared/hooks/useSheetDrag";

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
  /**
   * true: the tab bar is always on screen (studio).
   * false: the dock only exists while `open` is true (camera).
   */
  persistent?: boolean;
  open?: boolean;
  /** Shows an X at the left of the tab bar that closes the whole dock. */
  onClose?: () => void;
  /** Tool selected on first mount. null starts with only the tab bar. */
  defaultTool?: string | null;
  leadingTools?: EditorTool[];
  trailingTools?: EditorTool[];
  showCapture?: boolean;
}

const ICON = 22;

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
  // Remember the last tool so the panel keeps its content while it slides shut.
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

  // A tool can disappear (Chars outside ASCII mode); treat that as collapsed.
  const active = tools.find((t) => t.id === activeId) ?? null;
  const shown = active ?? tools.find((t) => t.id === lastId) ?? null;
  const panelOpen = active !== null;

  const collapse = useCallback(() => setActiveId(null), []);
  const toggle = useCallback(
    (id: string) => setActiveId((cur) => (cur === id ? null : id)),
    []
  );

  const { offset, handlers } = useSheetDrag(collapse);

  // Publish the dock height so the preview can keep clear of it.
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

  // Keep the selected tab in view when the tab bar scrolls.
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

  if (!visible) return null;

  const panelId = `${uid}-panel`;

  return (
    <div
      ref={setDockEl}
      role="region"
      aria-label="Editing tools"
      onKeyDown={onKeyDown}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-green-500/20 bg-black/85 pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] text-gray-200 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl select-none"
    >
      <Collapse open={panelOpen} id={panelId}>
        <div
          style={offset ? { transform: `translateY(${offset}px)` } : undefined}
          className={offset ? "" : "transition-transform duration-200"}
        >
          <div
            {...handlers}
            aria-hidden="true"
            className="flex cursor-grab touch-none justify-center pt-2.5 pb-1.5"
          >
            <div className="h-1 w-9 rounded-full bg-green-500/40" />
          </div>

          <div className="flex items-center justify-between px-4">
            <h2 className="text-[11px] font-bold tracking-widest text-green-500/80 uppercase">
              {shown?.label}
            </h2>
            <button
              type="button"
              onClick={collapse}
              aria-label="Collapse panel"
              className="-mr-2 flex size-9 items-center justify-center rounded-full text-green-500/70 transition-colors outline-none hover:text-green-300 focus-visible:ring-2 focus-visible:ring-green-400/70"
            >
              <LuChevronDown size={18} aria-hidden="true" />
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

      <div className="flex items-stretch">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close editor"
            className="flex w-12 shrink-0 items-center justify-center border-r border-green-500/15 text-green-500/70 transition-colors outline-none hover:text-green-300 focus-visible:ring-2 focus-visible:ring-green-400/70 focus-visible:ring-inset"
          >
            <LuX size={20} aria-hidden="true" />
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
                className={`relative flex h-14 shrink-0 grow basis-14 snap-start flex-col items-center justify-center gap-1 rounded-xl px-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-400/70 focus-visible:ring-inset ${
                  selected
                    ? "bg-green-500/10 text-green-400"
                    : "text-green-500/60 active:bg-green-900/30"
                }`}
              >
                {selected && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 h-0.5 w-6 rounded-full bg-green-400"
                  />
                )}
                <span className="relative">
                  {tool.icon}
                  {tool.badge}
                </span>
                <span className="text-[10px] font-semibold tracking-wide">
                  {tool.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default memo(MobileEditor);
