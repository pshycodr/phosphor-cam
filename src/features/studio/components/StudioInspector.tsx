import { memo, useMemo } from "react";

import { SlidersHorizontal, Sparkles } from "lucide-react";

import type { SettingsControlsValue } from "@/shared/components/settings/common/SettingsControls";
import { SettingsControlsProvider } from "@/shared/components/settings/common/SettingsControlsProvider";
import { useMediaQuery } from "@/shared/components/settings/common/useMediaQuery";
import SettingsSections, {
  type ExtraSettingsSection,
} from "@/shared/components/settings/desktop/SettingsSections";
import MobileEditor from "@/shared/components/settings/mobile/MobileEditor";
import type { EditorTool } from "@/shared/components/settings/mobile/types";

import { STUDIO_PRESETS } from "../constants/presets";
import { useStudioStore } from "../store/studioStore";
import PresetsPanel from "./controls/PresetsPanel";

const PRESETS_SECTION: ExtraSettingsSection = {
  id: "presets",
  icon: <Sparkles size={15} />,
  title: "Presets",
  badge: <>{STUDIO_PRESETS.length}</>,
  content: <PresetsPanel />,
};

const LEADING_SECTIONS = [PRESETS_SECTION];

const PRESETS_TOOL: EditorTool = {
  id: "presets",
  label: "Presets",
  icon: <Sparkles size={20} />,
  content: <PresetsPanel />,
};

const LEADING_TOOLS = [PRESETS_TOOL];

function StudioInspector() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const updateSettings = useStudioStore((s) => s.updateSettings);
  const updateEffect = useStudioStore((s) => s.updateEffect);
  const commitHistory = useStudioStore((s) => s.commitHistory);

  const controls = useMemo<SettingsControlsValue>(
    () => ({
      getSettings: () => useStudioStore.getState().settings,
      subscribe: (listener) => useStudioStore.subscribe(listener),
      updateSettings: (patch, options) =>
        updateSettings(patch, options?.history ?? true),
      updateEffect: (key, patch, options) =>
        updateEffect(key, patch, options?.history ?? true),
      commitHistory,
    }),
    [updateSettings, updateEffect, commitHistory]
  );

  return (
    <SettingsControlsProvider value={controls}>
      {isDesktop ? (
        <aside
          aria-label="Editing controls"
          className="rail-enter flex h-full w-[344px] shrink-0 flex-col border-l border-line/80 bg-ink-2/50 select-none"
        >
          <header className="flex h-14 shrink-0 items-center gap-2.5 border-b border-line/80 px-5">
            <SlidersHorizontal
              size={15}
              strokeWidth={1.75}
              aria-hidden="true"
              className="text-signal"
            />
            <h2 className="text-[11px] font-semibold tracking-[0.2em] text-paper uppercase">
              Inspector
            </h2>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-1 pb-4">
            <SettingsSections
              idPrefix="studio-desktop"
              leadingSections={LEADING_SECTIONS}
              defaultOpenSection="presets"
              showCapture={false}
            />
          </div>
        </aside>
      ) : (
        <MobileEditor
          persistent
          defaultTool="presets"
          leadingTools={LEADING_TOOLS}
          showCapture={false}
        />
      )}
    </SettingsControlsProvider>
  );
}

export default memo(StudioInspector);
