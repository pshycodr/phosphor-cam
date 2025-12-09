import { useEffect, useState } from 'react'
import AsciiView from './components/asciiView'
import Header from './components/header'
import Settings from './components/settings'
import { AsciiSettings, CameraFacingMode } from './types/types'
import CameraControls from './components/cameraControls'

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

    const [stream, setStream] = useState<MediaStream | null>(null)
    const [settings, setSettings] = useState<AsciiSettings>(DEFAULT_SETTIGNS)
    const [facingMode, setFacingMode] = useState<CameraFacingMode>('environment')
    const [isRecording, setIsRecording] = useState(false)

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

    const takeSnapshot = () => {
        console.log('Snapshot')
        // TODO: hook with AsciiView snapshot logic
    }

    const copyToClipboard = () => {
        console.log('Copy to clipboard')
        // TODO: implement copy functionality
    }

    const toggleRecording = () => {
        setIsRecording(prev => !prev)
        // TODO: add media recorder logic
    }

    return (
        <div className="h-screen w-screen flex flex-col justify-between">
            <div className="w-full flex flex-row justify-between items-center">
                <Header />
                <Settings settings={settings} onChange={setSettings} />
            </div>

            <div className="fixed h-full w-screen flex justify-center -z-10 items-center">
                <AsciiView settings={settings} stream={stream} />
            </div>

            <CameraControls
                onFlip={toggleCamera}
                onShot={takeSnapshot}
                onCopy={copyToClipboard}
                onToggleRecording={toggleRecording}
                isRecording={isRecording}
            />
        </div>
    )
}

export default App
