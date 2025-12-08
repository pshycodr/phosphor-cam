import { useState } from 'react'
import AsciiView from './components/asciiView'
import Header from './components/header'
import Settings from './components/settings'
import { AsciiSettings } from './types/types'

function App() {
    const DEFAULT_SETTIGNS: AsciiSettings = {
        resolution: 0.2,
        fontSize: 10,
        contrast: 1.2,
        brightness: 0,
        colorMode: false,
        invert: false,
        characterSet: 'standard',
    }

    const [settings, setSettings] = useState<AsciiSettings>(DEFAULT_SETTIGNS)

    return (
        <>
            <div className="h-screen w-screen flex flex-col justify-between ">
                <div className="w-full flex flex-row justify-between items-center">
                    <Header />
                    <Settings settings={settings} onChange={setSettings} />
                </div>

                <div className="fixed h-full w-screen flex justify-center items-center">
                    <AsciiView />
                </div>

                <div>THIS IS CAMERA BUTTONS</div>
            </div>
        </>
    )
}

export default App
