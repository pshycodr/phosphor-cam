import { memo, useState } from "react";
import { FaGithub, FaXTwitter } from "react-icons/fa6";
import { IoClose, IoGlobe } from "react-icons/io5";
import { LuSettings2 } from "react-icons/lu";

import { CHARACTER_SETS } from "../constants/characterSets";
import { AsciiSettings, CHAR_SETS } from "../types/types";

interface SettingsCompProps {
  settings: AsciiSettings;
  onChange: (newSettings: AsciiSettings) => void;
}

type SliderEvent = React.MouseEvent | React.TouchEvent;

const SLIDER_CONFIGS = {
  fontSize: {
    min: 6,
    max: 30,
    step: 1,
    label: "RESOLUTION",
    range: "Low (6) - High (30)",
  },
  contrast: {
    min: 0.5,
    max: 3.0,
    step: 0.1,
    label: "CONTRAST",
    range: "Low (0.5) - High (3.0)",
  },
  brightness: {
    min: -100,
    max: 100,
    step: 1,
    label: "BRIGHTNESS",
    range: "Dark (-100) - Bright (+100)",
  },
};

function Settings({ settings, onChange }: SettingsCompProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSlider, setActiveSlider] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState({ x: 0, y: 0 });
  const [sliderRect, setSliderRect] = useState<DOMRect | null>(null);

  const handleChange = (
    key: keyof AsciiSettings,
    value: number | string | boolean
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const getClientPos = (e: SliderEvent) => ({
    x: "touches" in e ? e.touches[0].clientX : e.clientX,
    y: "touches" in e ? e.touches[0].clientY : e.clientY,
  });

  const handleSliderStart = (key: string, value: number, e: SliderEvent) => {
    setSliderRect(
      (e.currentTarget as HTMLInputElement).getBoundingClientRect()
    );
    setActiveSlider(key);
    setSliderValue(value);
    setSliderPosition(getClientPos(e));
  };

  const handleSliderChange = (key: string, val: number, e: SliderEvent) => {
    handleChange(key as keyof AsciiSettings, val);
    if (activeSlider === key) {
      setSliderValue(val);
      setSliderPosition(getClientPos(e));
    }
  };

  const formatValue = (key: string, value: number) => {
    if (key === "contrast") return value.toFixed(1);
    if (key === "brightness") return `${value > 0 ? "+" : ""}${value}`;
    return `${value}px`;
  };

  const renderSlider = (key: keyof typeof SLIDER_CONFIGS) => {
    const config = SLIDER_CONFIGS[key];
    const [lowLabel, highLabel] = config.range.split(" - ");

    return (
      <section key={key}>
        <div className="mb-1 flex justify-between text-xs font-semibold text-green-400">
          <span>{config.label}</span>
          <span className="text-green-300">
            {formatValue(key, settings[key])}
          </span>
        </div>
        <div className="mb-2 flex justify-between text-[10px] text-green-500/60">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
        <input
          type="range"
          min={config.min}
          max={config.max}
          step={config.step}
          value={settings[key]}
          onMouseDown={(e) => handleSliderStart(key, settings[key], e)}
          onTouchStart={(e) => handleSliderStart(key, settings[key], e)}
          onChange={(e) =>
            handleSliderChange(
              key,
              +e.target.value,
              e as unknown as SliderEvent
            )
          }
          onMouseUp={() => setActiveSlider(null)}
          onTouchEnd={() => setActiveSlider(null)}
          className="settings-slider"
        />
      </section>
    );
  };

  return (
    <>
      {!isOpen && (
        <button
          className="fixed top-4 right-4 z-50 rounded-lg border border-green-500/30 bg-black/40 p-3 text-green-400 shadow-lg backdrop-blur-sm transition-all hover:border-green-400 hover:bg-green-900/30"
          onClick={() => setIsOpen(true)}
        >
          <LuSettings2 size={24} />
        </button>
      )}

      {isOpen && !activeSlider && (
        <div
          className="fixed inset-0 z-30 bg-black/40"
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
        />
      )}

      {activeSlider && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: `${sliderPosition.x}px`,
            top: `${sliderPosition.y - 80}px`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="rounded-lg bg-green-600 px-5 py-2 text-xl font-bold text-black shadow-xl">
            {formatValue(activeSlider, sliderValue)}
          </div>
        </div>
      )}

      <aside
        className={`fixed inset-0 z-40 flex h-full w-full transform flex-col bg-black shadow-2xl transition-transform duration-300 sm:right-0 sm:left-auto sm:w-96 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ${activeSlider ? "pointer-events-none opacity-0" : "opacity-100"}`}
      >
        <header className="flex items-center justify-between border-b border-green-600 px-5 py-6">
          <h2 className="text-xl font-bold tracking-wide text-green-400">
            SETTINGS
          </h2>
          <button
            className="rounded-lg p-2 text-green-400 transition-all hover:bg-green-900/30"
            onClick={() => setIsOpen(false)}
          >
            <IoClose size={24} />
          </button>
        </header>

        <div className="flex-1 space-y-8 overflow-y-auto p-5 pb-24 text-sm text-gray-200">
          {(
            Object.keys(SLIDER_CONFIGS) as Array<keyof typeof SLIDER_CONFIGS>
          ).map(renderSlider)}

          <section>
            <p className="mb-3 text-xs font-semibold text-green-400 uppercase">
              Character Set
            </p>

            <div className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-3">
              {CHARACTER_SETS.map((set) => {
                const isActive = settings.characterSet === set;

                return (
                  <button
                    key={set}
                    onClick={() => handleChange("characterSet", set)}
                    className={`min-w-[110px] shrink-0 snap-start rounded-lg border px-3 py-3 text-left transition-all ${
                      isActive
                        ? "border-green-400 bg-green-600 text-black"
                        : "border-green-500 text-green-400 hover:bg-green-900/20"
                    }`}
                  >
                    <div className="mb-1 text-[11px] font-semibold uppercase">
                      {set}
                    </div>

                    <div className="truncate font-mono text-[11px] leading-tight opacity-80">
                      {CHAR_SETS[set].slice(0, 14)}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 rounded-md border border-green-500 bg-black/40 p-3">
              <div className="mb-1 text-[10px] text-green-500 uppercase">
                Preview
              </div>

              <div className="font-mono text-xs leading-tight break-words whitespace-pre-wrap text-green-300">
                {CHAR_SETS[settings.characterSet]}
              </div>
            </div>
          </section>

          <section className="space-y-4 pt-2">
            {[
              { key: "colorMode", label: "Color Mode" },
              { key: "invert", label: "Invert Values" },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between py-3 text-green-400"
              >
                <span className="text-sm font-medium">{label}</span>
                <input
                  type="checkbox"
                  checked={settings[key as keyof AsciiSettings] as boolean}
                  onChange={() =>
                    handleChange(
                      key as keyof AsciiSettings,
                      !settings[key as keyof AsciiSettings]
                    )
                  }
                  className="settings-toggle"
                />
              </label>
            ))}
          </section>
        </div>

        <footer className="border-t border-green-600 px-5 py-4">
          <div className="mb-3 flex items-center justify-center gap-8">
            {[
              {
                href: "https://github.com/pshycodr/phosphor-cam",
                Icon: FaGithub,
                label: "GitHub",
              },
              {
                href: "https://x.com/the_Aroy",
                Icon: FaXTwitter,
                label: "Twitter",
              },
              {
                href: "https://anishroy.dev",
                Icon: IoGlobe,
                label: "Website",
              },
            ].map(({ href, Icon, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-3 text-green-400 transition-all hover:bg-green-900/30"
                aria-label={label}
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
          <div className="text-center text-xs text-green-600">
            phosphor-cam v1.0
          </div>
        </footer>
      </aside>

      {activeSlider && sliderRect && (
        <div
          className="fixed z-50"
          style={{
            left: `${sliderRect.left}px`,
            top: `${sliderRect.top}px`,
            width: `${sliderRect.width}px`,
          }}
        >
          <input
            type="range"
            min={
              SLIDER_CONFIGS[activeSlider as keyof typeof SLIDER_CONFIGS].min
            }
            max={
              SLIDER_CONFIGS[activeSlider as keyof typeof SLIDER_CONFIGS].max
            }
            step={
              SLIDER_CONFIGS[activeSlider as keyof typeof SLIDER_CONFIGS].step
            }
            value={sliderValue}
            onChange={(e) =>
              handleSliderChange(
                activeSlider,
                +e.target.value,
                e as unknown as SliderEvent
              )
            }
            onMouseUp={() => setActiveSlider(null)}
            onTouchEnd={() => setActiveSlider(null)}
            className="settings-slider w-full"
          />
        </div>
      )}
    </>
  );
}

export default memo(Settings);
