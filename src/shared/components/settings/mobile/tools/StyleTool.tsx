import { memo, useCallback } from "react";
import type { IconType } from "react-icons";
import {
  LuAlignJustify,
  LuBox,
  LuCircleDot,
  LuColumns3,
  LuGrid3X3,
  LuRows3,
  LuTerminal,
} from "react-icons/lu";

import { RENDER_MODES } from "@/shared/constants/settings";
import type { RenderMode } from "@/shared/types";
import { Switch } from "@/shared/ui/controls";

import {
  useSettingsActions,
  useSettingsSelector,
} from "../../common/useSettingsControls";
import { Chip } from "../primitives";

const MODE_ICONS: Record<RenderMode, IconType> = {
  ascii: LuTerminal,
  dither: LuGrid3X3,
  halftone: LuCircleDot,
  voxel: LuBox,
  lines: LuAlignJustify,
};

const StyleTool = () => {
  const renderMode = useSettingsSelector((s) => s.renderMode);
  const voxel3d = useSettingsSelector((s) => s.voxel3d);
  const lineDirection = useSettingsSelector((s) => s.lineDirection);
  const { updateSettings } = useSettingsActions();

  const toggleVoxel = useCallback(
    () => updateSettings({ voxel3d: !voxel3d }),
    [updateSettings, voxel3d]
  );

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label="Render engine"
        className="grid grid-cols-5 gap-1.5"
      >
        {RENDER_MODES.map(({ key, label }) => {
          const Icon = MODE_ICONS[key];
          const active = renderMode === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => updateSettings({ renderMode: key })}
              className={`flex min-h-16 min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl border px-1 transition-colors ${
                active
                  ? "border-signal/60 bg-signal/10 text-signal"
                  : "border-line/80 bg-ink-3/40 text-muted active:bg-ink-3"
              }`}
            >
              <Icon size={18} aria-hidden="true" />
              <span className="max-w-full truncate text-[8px] font-medium tracking-[0.08em] uppercase">
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {renderMode === "voxel" && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-line/80 bg-ink-3/40 px-3 py-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-paper">3D cubes</p>
            <p className="text-[11px] text-faint">
              Raised, shaded voxel blocks.
            </p>
          </div>
          <Switch checked={voxel3d} onChange={toggleVoxel} label="Voxel 3D" />
        </div>
      )}

      {renderMode === "lines" && (
        <div className="flex items-center gap-2">
          <span className="mr-1 text-[11px] text-muted">Direction</span>
          <Chip
            pressed={lineDirection === "horizontal"}
            active={lineDirection === "horizontal"}
            onClick={() => updateSettings({ lineDirection: "horizontal" })}
          >
            <LuRows3 size={14} aria-hidden="true" />
            Horizontal
          </Chip>
          <Chip
            pressed={lineDirection === "vertical"}
            active={lineDirection === "vertical"}
            onClick={() => updateSettings({ lineDirection: "vertical" })}
          >
            <LuColumns3 size={14} aria-hidden="true" />
            Vertical
          </Chip>
        </div>
      )}
    </div>
  );
};

export default memo(StyleTool);
