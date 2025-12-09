import { useState } from 'react'
import { Settings as SettingsIcon, X } from 'lucide-react'
import { AsciiSettings } from '../types/types'

interface SettingsCompProps {
    settings: AsciiSettings
    onChange: (newSettings: AsciiSettings) => void
}

function Settings({ settings, onChange }: SettingsCompProps) {
    const [isOpen, setIsOpen] = useState(false)

    const handleChange = (key: keyof AsciiSettings, value: number | string | boolean) => {
        onChange({ ...settings, [key]: value })
        console.log(settings)
    }

    return (
        <>
            {/* Open settings button */}
            {!isOpen && (
                <button
                    className="p-2 text-green-400 fixed right-4 z-50 rounded-lg backdrop-blur-sm shadow-lg"
                    onClick={() => setIsOpen(true)}
                >
                    <SettingsIcon size={28} />
                </button>
            )}

            {/* Sliding settings drawer */}
            <aside
                className={`fixed top-0 right-0 h-full w-72 sm:w-80 bg-black border-l border-green-500 flex flex-col
        transform transition-transform duration-300 z-40 
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <header className="flex items-center justify-between py-5 px-4 border-b border-green-600">
                    <h2 className="font-bold text-xl text-green-400 tracking-wide">SETTINGS</h2>
                    <button className="text-green-400" onClick={() => setIsOpen(false)}>
                        <X size={28} />
                    </button>
                </header>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-8 text-gray-200 text-sm">
                    {/* Resolution */}
                    <section>
                        <div className="flex justify-between text-green-400 text-xs mb-2">
                            <span>RESOLUTION (FONT SIZE)</span>
                            <span className="opacity-70">Hi Lo</span>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={30}
                            step={1}
                            value={settings.fontSize}
                            onChange={e => handleChange('fontSize', +e.target.value)}
                            className="settings-slider"
                        />
                    </section>

                    {/* Contrast */}
                    <section>
                        <label className="uppercase text-green-400 text-xs mb-2 block">
                            CONTRAST
                        </label>
                        <input
                            type="range"
                            min={0.5}
                            max={3.0}
                            step={0.1}
                            value={settings.contrast}
                            onChange={e => handleChange('contrast', +e.target.value)}
                            className="settings-slider"
                        />
                    </section>

                    {/* Brightness */}
                    <section>
                        <label className="uppercase text-green-400 text-xs mb-2 block">
                            BRIGHTNESS
                        </label>
                        <input
                            type="range"
                            min={-100}
                            max={100}
                            value={settings.brightness}
                            onChange={e => handleChange('brightness', +e.target.value)}
                            className="settings-slider"
                        />
                    </section>

                    {/* Character Set */}
                    <section>
                        <p className="uppercase text-xs text-green-400 mb-3">Character Set</p>
                        <div className="grid grid-cols-2 gap-2">
                            {['standard', 'simple', 'blocks', 'matrix', 'edges'].map(c => (
                                <button
                                    key={c}
                                    className={`py-2 rounded-sm border border-green-500 text-xs 
                  ${settings.characterSet === c ? 'bg-green-600 text-black' : 'text-green-400'}`}
                                    onClick={() => handleChange('characterSet', c)}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Toggles */}
                    <section className="space-y-3">
                        <label className="flex justify-between items-center text-green-400">
                            Color Mode
                            <input
                                type="checkbox"
                                checked={settings.colorMode}
                                onChange={() => handleChange('colorMode', !settings.colorMode)}
                                className="settings-toggle"
                            />
                        </label>
                        <label className="flex justify-between items-center text-green-400">
                            Invert Values
                            <input
                                type="checkbox"
                                checked={settings.invert}
                                onChange={() => handleChange('invert', !settings.invert)}
                                className="settings-toggle"
                            />
                        </label>
                    </section>
                </div>

                {/* Footer */}
                <footer className="text-center py-3 text-xs text-green-600 border-t border-green-600">
                    ascii-it v1.0
                </footer>
            </aside>
        </>
    )
}

export default Settings
