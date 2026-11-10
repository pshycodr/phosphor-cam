import { memo } from "react";
import { IoWarningOutline } from "react-icons/io5";

import type { Codecs } from "@/shared/types";

import {
  useSettingsActions,
  useSettingsSelector,
} from "../../common/useSettingsControls";
import { SliderField } from "../EditorSlider";
import { Segmented } from "../primitives";

const MIN = 1;
const MAX = 20;
const WARN_THRESHOLD = 12;

const CODECS = [
  { key: "png", label: "PNG" },
  { key: "jpeg", label: "JPEG" },
  { key: "webp", label: "WEBP" },
] as const satisfies readonly { key: Codecs; label: string }[];

const GREEN = [34, 197, 94] as const;
const RED = [239, 68, 68] as const;

const clamp = (v: number) => Math.min(MAX, Math.max(MIN, Math.round(v)));

function scaleColor(value: number) {
  const t =
    value <= WARN_THRESHOLD
      ? 0
      : (value - WARN_THRESHOLD) / (MAX - WARN_THRESHOLD);
  const [r, g, b] = GREEN.map((c, i) => Math.round(c + (RED[i] - c) * t));
  return `rgb(${r}, ${g}, ${b})`;
}

const CaptureTool = () => {
  const codec = useSettingsSelector((s) => s.captureCodec);
  const captureScale = useSettingsSelector((s) => s.captureScale);
  const { updateSettings, commitHistory } = useSettingsActions();

  const value = clamp(captureScale);
  const isHigh = value > WARN_THRESHOLD;

  return (
    <div className="space-y-3">
      <Segmented
        label="Format"
        options={CODECS}
        value={codec}
        onChange={(key) => updateSettings({ captureCodec: key })}
      />

      <SliderField
        label="Capture scale"
        display={`${value}x`}
        valueText={`${value}x${isHigh ? ", may take longer and could fail" : ""}`}
        min={MIN}
        max={MAX}
        step={1}
        value={value}
        accent={scaleColor(value)}
        marks={[WARN_THRESHOLD]}
        onChange={(v) =>
          updateSettings({ captureScale: clamp(v) }, { history: false })
        }
        onCommit={() => commitHistory?.()}
      />

      {isHigh && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-950/30 px-3 py-2 text-xs text-red-400"
        >
          <IoWarningOutline
            className="mt-0.5 shrink-0"
            size={14}
            aria-hidden="true"
          />
          <span>
            Above {WARN_THRESHOLD}x takes much longer and may fail on large
            canvases.
          </span>
        </div>
      )}
    </div>
  );
};

export default memo(CaptureTool);
