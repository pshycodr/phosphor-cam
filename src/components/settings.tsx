import { useState } from 'react'
import { Settings as SettingsIcon, X } from 'lucide-react'

function Settings() {
    const [isOpen, setIsOpen] = useState(false)
    const [brightness, setBrightness] = useState(50)
    const [resolution, setResolution] = useState(50)
    const [contrast, setContrast] = useState(50)
    const [charSet, setCharSet] = useState('standard')
    const [colorMode, setColorMode] = useState(false)
    const [invertValues, setInvertValues] = useState(false)

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
                            min={6}
                            max={24}
                            step={1}
                            value={resolution}
                            onChange={e => setResolution(+e.target.value)}
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
                            value={contrast}
                            onChange={e => setContrast(+e.target.value)}
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
                            value={brightness}
                            onChange={e => setBrightness(+e.target.value)}
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
                  ${charSet === c ? 'bg-green-600 text-black' : 'text-green-400'}`}
                                    onClick={() => setCharSet(c)}
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
                                checked={colorMode}
                                onChange={() => setColorMode(!colorMode)}
                                className="settings-toggle"
                            />
                        </label>
                        <label className="flex justify-between items-center text-green-400">
                            Invert Values
                            <input
                                type="checkbox"
                                checked={invertValues}
                                onChange={() => setInvertValues(!invertValues)}
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
