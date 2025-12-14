import { memo, useState } from 'react'
import { FaGithub, FaXTwitter } from 'react-icons/fa6'
import { IoClose, IoGlobe } from 'react-icons/io5'
import { LuSettings2 } from 'react-icons/lu'
import { AsciiSettings } from '../types/types'

interface SettingsCompProps {
    settings: AsciiSettings
    onChange: (newSettings: AsciiSettings) => void
}

type SliderEvent = React.MouseEvent | React.TouchEvent

const SLIDER_CONFIGS = {
    fontSize: { min: 6, max: 30, step: 1, label: 'RESOLUTION', range: 'Low (6) - High (30)' },
    contrast: { min: 0.5, max: 3.0, step: 0.1, label: 'CONTRAST', range: 'Low (0.5) - High (3.0)' },
    brightness: {
        min: -100,
        max: 100,
        step: 1,
        label: 'BRIGHTNESS',
        range: 'Dark (-100) - Bright (+100)',
    },
}

const CHARACTER_SETS = ['standard', 'simple', 'blocks', 'matrix', 'edges']

function Settings({ settings, onChange }: SettingsCompProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [activeSlider, setActiveSlider] = useState<string | null>(null)
    const [sliderValue, setSliderValue] = useState<number>(0)
    const [sliderPosition, setSliderPosition] = useState({ x: 0, y: 0 })
    const [sliderRect, setSliderRect] = useState<DOMRect | null>(null)

    const handleChange = (key: keyof AsciiSettings, value: number | string | boolean) => {
        onChange({ ...settings, [key]: value })
    }

    const getClientPos = (e: SliderEvent) => ({
        x: 'touches' in e ? e.touches[0].clientX : e.clientX,
        y: 'touches' in e ? e.touches[0].clientY : e.clientY,
    })

    const handleSliderStart = (key: string, value: number, e: SliderEvent) => {
        setSliderRect((e.currentTarget as HTMLInputElement).getBoundingClientRect())
        setActiveSlider(key)
        setSliderValue(value)
        setSliderPosition(getClientPos(e))
    }

    const handleSliderChange = (key: string, val: number, e: SliderEvent) => {
        handleChange(key as keyof AsciiSettings, val)
        if (activeSlider === key) {
            setSliderValue(val)
            setSliderPosition(getClientPos(e))
        }
    }

    const formatValue = (key: string, value: number) => {
        if (key === 'contrast') return value.toFixed(1)
        if (key === 'brightness') return `${value > 0 ? '+' : ''}${value}`
        return `${value}px`
    }

    const renderSlider = (key: keyof typeof SLIDER_CONFIGS) => {
        const config = SLIDER_CONFIGS[key]
        const [lowLabel, highLabel] = config.range.split(' - ')

        return (
            <section key={key}>
                <div className="flex justify-between text-green-400 text-xs font-semibold mb-1">
                    <span>{config.label}</span>
                    <span className="text-green-300">{formatValue(key, settings[key])}</span>
                </div>
                <div className="flex justify-between text-[10px] text-green-500/60 mb-2">
                    <span>{lowLabel}</span>
                    <span>{highLabel}</span>
                </div>
                <input
                    type="range"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={settings[key]}
                    onMouseDown={e => handleSliderStart(key, settings[key], e)}
                    onTouchStart={e => handleSliderStart(key, settings[key], e)}
                    onChange={e =>
                        handleSliderChange(key, +e.target.value, e as unknown as SliderEvent)
                    }
                    onMouseUp={() => setActiveSlider(null)}
                    onTouchEnd={() => setActiveSlider(null)}
                    className="settings-slider"
                />
            </section>
        )
    }

    return (
        <>
            {!isOpen && (
                <button
                    className="p-3 text-green-400 fixed top-4 right-4 z-50 rounded-lg backdrop-blur-sm shadow-lg bg-black/40 border border-green-500/30 hover:bg-green-900/30 hover:border-green-400 transition-all"
                    onClick={() => setIsOpen(true)}
                >
                    <LuSettings2 size={24} />
                </button>
            )}

            {isOpen && !activeSlider && (
                <div
                    className="fixed inset-0 bg-transparent z-30"
                    onClick={e => e.target === e.currentTarget && setIsOpen(false)}
                />
            )}

            {activeSlider && (
                <div
                    className="fixed z-50 pointer-events-none"
                    style={{
                        left: `${sliderPosition.x}px`,
                        top: `${sliderPosition.y - 50}px`,
                        transform: 'translateX(-50%)',
                    }}
                >
                    <div className="bg-green-600 text-black px-4 py-2 rounded-lg font-bold text-lg shadow-xl">
                        {formatValue(activeSlider, sliderValue)}
                    </div>
                </div>
            )}

            <aside
                className={`fixed top-0 right-0 h-full w-[60%] min-w-[280px] sm:w-96 bg-black border-l border-green-500 flex flex-col
        transform transition-transform duration-300 z-40 shadow-2xl
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        ${activeSlider ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
                <header className="flex items-center justify-between py-6 px-5 border-b border-green-600">
                    <h2 className="font-bold text-2xl text-green-400 tracking-wide">SETTINGS</h2>
                    <button
                        className="text-green-400 p-2 hover:bg-green-900/30 rounded-lg transition-all"
                        onClick={() => setIsOpen(false)}
                    >
                        <IoClose size={24} />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-5 space-y-6 text-gray-200 text-sm">
                    {(Object.keys(SLIDER_CONFIGS) as Array<keyof typeof SLIDER_CONFIGS>).map(
                        renderSlider,
                    )}

                    <section>
                        <p className="uppercase text-xs text-green-400 font-semibold mb-3">
                            Character Set
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {CHARACTER_SETS.map(c => (
                                <button
                                    key={c}
                                    className={`py-3 rounded-md border border-green-500 text-xs uppercase font-semibold transition-all
                  ${settings.characterSet === c ? 'bg-green-600 text-black' : 'text-green-400 hover:bg-green-900/20'}`}
                                    onClick={() => handleChange('characterSet', c)}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-4 pt-2">
                        {[
                            { key: 'colorMode', label: 'Color Mode' },
                            { key: 'invert', label: 'Invert Values' },
                        ].map(({ key, label }) => (
                            <label
                                key={key}
                                className="flex justify-between items-center text-green-400 py-2 cursor-pointer"
                            >
                                <span className="text-sm font-medium">{label}</span>
                                <input
                                    type="checkbox"
                                    checked={settings[key as keyof AsciiSettings] as boolean}
                                    onChange={() =>
                                        handleChange(
                                            key as keyof AsciiSettings,
                                            !settings[key as keyof AsciiSettings],
                                        )
                                    }
                                    className="settings-toggle"
                                />
                            </label>
                        ))}
                    </section>
                </div>

                <footer className="py-4 px-5 border-t border-green-600">
                    <div className="flex items-center justify-center gap-6 mb-3">
                        {[
                            {
                                href: 'https://github.com/pshycodr/phosphor-cam',
                                Icon: FaGithub,
                                label: 'GitHub',
                            },
                            { href: 'https://x.com/the_Aroy', Icon: FaXTwitter, label: 'Twitter' },
                            { href: 'https://pshycodr.me', Icon: IoGlobe, label: 'Website' },
                        ].map(({ href, Icon, label }) => (
                            <a
                                key={href}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg transition-all"
                                aria-label={label}
                            >
                                <Icon size={20} />
                            </a>
                        ))}
                    </div>
                    <div className="text-center text-xs text-green-600">phosphor-cam v1.0</div>
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
                        min={SLIDER_CONFIGS[activeSlider as keyof typeof SLIDER_CONFIGS].min}
                        max={SLIDER_CONFIGS[activeSlider as keyof typeof SLIDER_CONFIGS].max}
                        step={SLIDER_CONFIGS[activeSlider as keyof typeof SLIDER_CONFIGS].step}
                        value={sliderValue}
                        onChange={e =>
                            handleSliderChange(
                                activeSlider,
                                +e.target.value,
                                e as unknown as SliderEvent,
                            )
                        }
                        onMouseUp={() => setActiveSlider(null)}
                        onTouchEnd={() => setActiveSlider(null)}
                        className="settings-slider w-full"
                    />
                </div>
            )}
        </>
    )
}

export default memo(Settings)
