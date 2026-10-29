import { memo, type ReactNode, useCallback, useState } from "react";
import {
  LuCamera,
  LuPalette,
  LuSlidersHorizontal,
  LuSparkles,
  LuType,
} from "react-icons/lu";

import Accordion from "./Accordion";
import AppearanceBadge from "./AppearanceBadge";
import AppearanceMode from "./AppearanceMode";
import CaptureScale from "./CaptureScale";
import CharacterSet from "./CharacterSet";
import Codec from "./Codec";
import EffectsPanel from "./EffectsPanel";
import LinesDirectionPicker from "./LinesDirectionPicker";
import RenderMode from "./RenderMode";
import AdjustmentsContent from "./SliderRow";
import ToggleRow from "./ToggleRow";
import { useSettingsControls } from "./useSettingsControls";

export interface ExtraSettingsSection {
  id: string;
  icon: ReactNode;
  title: string;
  badge?: ReactNode;
  content: ReactNode;
  visible?: boolean;
}

interface SettingsSectionsProps {
  leadingSections?: ExtraSettingsSection[];
  trailingSections?: ExtraSettingsSection[];
  showCapture?: boolean;
  defaultOpenSection?: string | null;
  className?: string;
  idPrefix?: string;
}

const CharacterSetBadge = memo(() => {
  const { settings } = useSettingsControls();
  return <span className="capitalize">{settings.characterSet}</span>;
});

const CaptureBadge = memo(() => {
  const { settings } = useSettingsControls();
  return (
    <span>
      {settings.captureScale}X, {settings.captureCodec}
    </span>
  );
});

const AdjustmentsBadge = memo(() => {
  const { settings } = useSettingsControls();
  return <>{settings.fontSize}px</>;
});

const EffectsBadge = memo(() => {
  const { settings } = useSettingsControls();
  const effects = Object.values(settings.effects);
  const activeCount = effects.filter((effect) => effect.enabled).length;

  return (
    <>{activeCount > 0 ? `${activeCount}/${effects.length} active` : "Off"}</>
  );
});

function SettingsSections({
  leadingSections = [],
  trailingSections = [],
  showCapture = true,
  defaultOpenSection = "adjustments",
  className = "",
  idPrefix = "settings",
}: SettingsSectionsProps) {
  const { settings, updateSettings } = useSettingsControls();
  const [openSection, setOpenSection] = useState<string | null>(
    defaultOpenSection
  );

  const toggleSection = useCallback(
    (id: string) => setOpenSection((current) => (current === id ? null : id)),
    []
  );

  const toggleVoxel3D = useCallback(
    () => updateSettings({ voxel3d: !settings.voxel3d }),
    [settings.voxel3d, updateSettings]
  );

  const renderExtraSection = (section: ExtraSettingsSection) => {
    if (section.visible === false) return null;

    return (
      <Accordion
        key={section.id}
        id={section.id}
        idPrefix={idPrefix}
        icon={section.icon}
        title={section.title}
        badge={section.badge}
        isOpen={openSection === section.id}
        onToggle={toggleSection}
      >
        {section.content}
      </Accordion>
    );
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {leadingSections.map(renderExtraSection)}

      <RenderMode />

      {showCapture && (
        <Accordion
          id="capture"
          idPrefix={idPrefix}
          icon={<LuCamera size={16} />}
          title="Capture & export"
          badge={<CaptureBadge />}
          isOpen={openSection === "capture"}
          onToggle={toggleSection}
        >
          <Codec />
          <CaptureScale />
        </Accordion>
      )}

      <Accordion
        id="adjustments"
        idPrefix={idPrefix}
        icon={<LuSlidersHorizontal size={16} />}
        title="Adjustments"
        badge={<AdjustmentsBadge />}
        isOpen={openSection === "adjustments"}
        onToggle={toggleSection}
      >
        {settings.renderMode === "voxel" && (
          <ToggleRow
            label="Voxel 3D Mode"
            description="Render raised, shaded voxel cubes."
            checked={settings.voxel3d}
            onChange={toggleVoxel3D}
          />
        )}

        {settings.renderMode === "lines" && <LinesDirectionPicker />}

        <AdjustmentsContent />
      </Accordion>

      <Accordion
        id="effects"
        idPrefix={idPrefix}
        icon={<LuSparkles size={16} />}
        title="Effects"
        badge={<EffectsBadge />}
        isOpen={openSection === "effects"}
        onToggle={toggleSection}
      >
        <EffectsPanel />
      </Accordion>

      {settings.renderMode === "ascii" && (
        <Accordion
          id="characterSet"
          idPrefix={idPrefix}
          icon={<LuType size={16} />}
          title="Character set"
          badge={<CharacterSetBadge />}
          isOpen={openSection === "characterSet"}
          onToggle={toggleSection}
        >
          <CharacterSet />
        </Accordion>
      )}

      <Accordion
        id="appearance"
        idPrefix={idPrefix}
        icon={<LuPalette size={16} />}
        title="Appearance"
        badge={<AppearanceBadge />}
        isOpen={openSection === "appearance"}
        onToggle={toggleSection}
      >
        <AppearanceMode />
      </Accordion>

      {trailingSections.map(renderExtraSection)}
    </div>
  );
}

export default memo(SettingsSections);
