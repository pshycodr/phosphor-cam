import { memo, useState } from 'react'
import { FaGithub, FaXTwitter } from 'react-icons/fa6'
import { IoClose, IoGlobe } from 'react-icons/io5'
import { LuSettings2 } from 'react-icons/lu'
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

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            setIsOpen(false)
        }
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

            {isOpen && (
                <div className="fixed inset-0 bg-transparent z-30" onClick={handleOverlayClick} />
            )}

            <aside
                className={`fixed top-0 right-0 h-full w-[60%] min-w-[280px] sm:w-96 bg-black border-l border-green-500 flex flex-col
        transform transition-transform duration-300 z-40 shadow-2xl
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
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
                    <section>
                        <div className="flex justify-between text-green-400 text-xs font-semibold mb-1">
                            <span>RESOLUTION</span>
                            <span className="text-green-300">{settings.fontSize}px</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-green-500/60 mb-2">
                            <span>Low (6)</span>
                            <span>High (30)</span>
                        </div>
                        <input
                            type="range"
                            min={6}
                            max={30}
                            step={1}
                            value={settings.fontSize}
                            onChange={e => handleChange('fontSize', +e.target.value)}
                            className="settings-slider"
                        />
                    </section>

                    <section>
                        <div className="flex justify-between text-green-400 text-xs font-semibold mb-1">
                            <span>CONTRAST</span>
                            <span className="text-green-300">{settings.contrast.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-green-500/60 mb-2">
                            <span>Low (0.5)</span>
                            <span>High (3.0)</span>
                        </div>
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

                    <section>
                        <div className="flex justify-between text-green-400 text-xs font-semibold mb-1">
                            <span>BRIGHTNESS</span>
                            <span className="text-green-300">
                                {settings.brightness > 0 ? '+' : ''}
                                {settings.brightness}
                            </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-green-500/60 mb-2">
                            <span>Dark (-100)</span>
                            <span>Bright (+100)</span>
                        </div>
                        <input
                            type="range"
                            min={-100}
                            max={100}
                            value={settings.brightness}
                            onChange={e => handleChange('brightness', +e.target.value)}
                            className="settings-slider"
                        />
                    </section>

                    <section>
                        <p className="uppercase text-xs text-green-400 font-semibold mb-3">
                            Character Set
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {['standard', 'simple', 'blocks', 'matrix', 'edges'].map(c => (
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
                        <label className="flex justify-between items-center text-green-400 py-2 cursor-pointer">
                            <span className="text-sm font-medium">Color Mode</span>
                            <input
                                type="checkbox"
                                checked={settings.colorMode}
                                onChange={() => handleChange('colorMode', !settings.colorMode)}
                                className="settings-toggle"
                            />
                        </label>
                        <label className="flex justify-between items-center text-green-400 py-2 cursor-pointer">
                            <span className="text-sm font-medium">Invert Values</span>
                            <input
                                type="checkbox"
                                checked={settings.invert}
                                onChange={() => handleChange('invert', !settings.invert)}
                                className="settings-toggle"
                            />
                        </label>
                    </section>
                </div>

                <footer className="py-4 px-5 border-t border-green-600">
                    <div className="flex items-center justify-center gap-6 mb-3">
                        <a
                            href="https://github.com/pshycodr/phosphor-cam"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg transition-all"
                            aria-label="GitHub"
                        >
                            <FaGithub size={20} />
                        </a>
                        <a
                            href="https://x.com/the_Aroy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg transition-all"
                            aria-label="Twitter"
                        >
                            <FaXTwitter size={20} />
                        </a>
                        <a
                            href="https://pshycodr.me"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg transition-all"
                            aria-label="Website"
                        >
                            <IoGlobe size={20} />
                        </a>
                    </div>
                    <div className="text-center text-xs text-green-600">phosphor-cam v1.0</div>
                </footer>
            </aside>
        </>
    )
}

export default memo(Settings)
