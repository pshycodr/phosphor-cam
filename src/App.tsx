import { RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import AsciiView from './components/asciiView'
import Header from './components/header'
import Settings from './components/settings'
import { AsciiSettings, CameraFacingMode } from './types/types'

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

    // const userVideoRef = useRef<MediaStream>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [settings, setSettings] = useState<AsciiSettings>(DEFAULT_SETTIGNS)
    const [facingMode, setFacingMode] = useState<CameraFacingMode>('environment')

    useEffect(() => {
        let active = true
        let currentStream: MediaStream | null = null

        const start = async () => {
            try {
                if (currentStream) {
                    currentStream.getTracks().forEach(t => t.stop())
                }

                const constraints: MediaStreamConstraints = {
                    video: {
                        height: { ideal: 1080 },
                        width: { ideal: 1920 },
                        facingMode,
                    },
                    audio: false,
                }

                const video = await navigator.mediaDevices.getUserMedia(constraints)
                if (!active) {
                    video.getTracks().forEach(t => t.stop())
                    return
                }

                currentStream = video
                setStream(video)
            } catch (err) {
                console.error(err)
            }
        }

        start()

        return () => {
            active = false
            if (currentStream) {
                currentStream.getTracks().forEach(t => t.stop())
            }
            setStream(null)
        }
    }, [facingMode])

    const toggleCamera = () => {
        setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'))
    }

    return (
        <>
            <div className="h-screen w-screen flex flex-col justify-between ">
                <div className="w-full flex flex-row justify-between items-center">
                    <Header />
                    <Settings settings={settings} onChange={setSettings} />
                </div>

                <div className="fixed h-full w-screen flex justify-center -z-10 items-center">
                    <AsciiView settings={settings} stream={stream} />
                </div>

                <div>
                    <button
                        onClick={toggleCamera}
                        className="fixed bottom-15 left-50 group flex flex-col items-center gap-2 focus:outline-none"
                    >
                        <div className="w-12 h-12 rounded-full border border-green-500/30 bg-black/40 backdrop-blur flex items-center justify-center group-hover:bg-green-900/30 group-hover:border-green-400 transition-all">
                            <RefreshCw size={20} strokeWidth={1.5} className="text-white" />
                        </div>
                        <span className="text-[10px] tracking-widest font-bold opacity-70 group-hover:opacity-100">
                            FLIP
                        </span>
                    </button>
                </div>
            </div>
        </>
    )
}

export default App
