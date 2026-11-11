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

// Desktop sidebar accordion section.
const PRESETS_SECTION: ExtraSettingsSection = {
  id: "presets",
  icon: <Sparkles size={16} />,
  title: "Presets",
  badge: <>{STUDIO_PRESETS.length} looks</>,
  content: <PresetsPanel />,
};

const LEADING_SECTIONS = [PRESETS_SECTION];

// Mobile dock tab. Module-level so the tool list stays referentially stable.
const PRESETS_TOOL: EditorTool = {
  id: "presets",
  label: "Presets",
  icon: <Sparkles size={22} />,
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
          className="flex h-full w-84 shrink-0 flex-col border-l border-zinc-800 bg-zinc-950 select-none"
        >
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-zinc-800 px-4 text-sm font-semibold text-green-400">
            <SlidersHorizontal size={16} />
            Inspector
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
            <SettingsSections
              idPrefix="studio-desktop"
              leadingSections={LEADING_SECTIONS}
            />
          </div>
        </aside>
      ) : (
        <MobileEditor persistent leadingTools={LEADING_TOOLS} />
      )}
    </SettingsControlsProvider>
  );
}

export default memo(StudioInspector);
