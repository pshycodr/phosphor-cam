import { memo, useCallback } from "react";
import type { IconType } from "react-icons";
import {
  LuBox,
  LuCircleDot,
  LuColumns3,
  LuGrid3X3,
  LuRows3,
  LuTerminal,
  LuAlignJustify,
} from "react-icons/lu";

import { RENDER_MODES } from "@/shared/constants/settings";
import type { RenderMode } from "@/shared/types";

import {
  useSettingsActions,
  useSettingsSelector,
} from "../../common/useSettingsControls";
import { Chip, Switch } from "../primitives";

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
              className={`flex min-h-16 min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl border px-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-400/70 ${
                active
                  ? "border-green-400 bg-green-500 text-black"
                  : "border-green-500/30 bg-black/40 text-green-400 active:bg-green-900/40"
              }`}
            >
              <Icon size={20} aria-hidden="true" />
              <span className="max-w-full truncate text-[10px] font-bold tracking-tight">
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {renderMode === "voxel" && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-green-500/20 bg-black/30 px-3 py-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-green-300">3D cubes</p>
            <p className="text-xs text-green-500/70">
              Raised, shaded voxel blocks.
            </p>
          </div>
          <Switch checked={voxel3d} onChange={toggleVoxel} label="Voxel 3D" />
        </div>
      )}

      {renderMode === "lines" && (
        <div
          role="group"
          aria-label="Line direction"
          className="flex items-center gap-2"
        >
          <span className="mr-1 text-xs font-semibold text-green-300">
            Direction
          </span>
          <Chip
            pressed={lineDirection === "horizontal"}
            active={lineDirection === "horizontal"}
            onClick={() => updateSettings({ lineDirection: "horizontal" })}
          >
            <LuRows3 size={16} aria-hidden="true" />
            Horizontal
          </Chip>
          <Chip
            pressed={lineDirection === "vertical"}
            active={lineDirection === "vertical"}
            onClick={() => updateSettings({ lineDirection: "vertical" })}
          >
            <LuColumns3 size={16} aria-hidden="true" />
            Vertical
          </Chip>
        </div>
      )}
    </div>
  );
};

export default memo(StyleTool);
