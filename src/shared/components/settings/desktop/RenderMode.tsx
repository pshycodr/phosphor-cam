import { memo } from "react";

import { RENDER_MODES } from "@/shared/constants/settings";
import { GroupLabel } from "@/shared/ui/controls";

import {
  useSettingsActions,
  useSettingsSelector,
} from "../common/useSettingsControls";

const RenderMode = () => {
  const renderMode = useSettingsSelector((settings) => settings.renderMode);
  const { updateSettings } = useSettingsActions();

  return (
    <section className="border-b border-line/70 py-5">
      <GroupLabel>Render engine</GroupLabel>

      <div
        role="group"
        aria-label="Render engine"
        className="mt-3 grid grid-cols-2 gap-1.5"
      >
        {RENDER_MODES.map(({ key, label }, index) => {
          const active = renderMode === key;
          const wide =
            index === RENDER_MODES.length - 1 && RENDER_MODES.length % 2 === 1;

          return (
            <button
              key={key}
              type="button"
              onClick={() => updateSettings({ renderMode: key })}
              aria-pressed={active}
              className={`press flex min-h-10 items-center justify-between gap-2 rounded-lg border px-3 text-[10px] font-medium tracking-[0.12em] uppercase ${wide ? "col-span-2" : ""} ${
                active
                  ? "border-signal/60 bg-signal/10 text-signal"
                  : "border-line/80 bg-ink-3/40 text-muted hover:border-line-strong hover:text-paper"
              }`}
            >
              {label}
              <span
                aria-hidden="true"
                className={`font-mono text-[9px] ${
                  active ? "text-signal/60" : "text-faint"
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default memo(RenderMode);
