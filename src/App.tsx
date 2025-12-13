import { useCallback, useEffect, useRef, useState } from 'react'
import AsciiView from './components/asciiView'
import Header from './components/header'
import Settings from './components/settings'
import {
    AsciiRendererHandle,
    AsciiSettings,
    CameraFacingMode,
    ProcessingStats,
} from './types/types'
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
    const [facingMode, setFacingMode] = useState<CameraFacingMode>('user')
    const [isRecording, setIsRecording] = useState<boolean>(false)
    const [stats, setStats] = useState<ProcessingStats>({ fps: 0, renderTime: 0 })
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    })

    const [flash, setFlash] = useState<boolean>(false)
    const [clipboardSuccess, setClipboardSuccess] = useState<boolean>(false)

    const asciiRendererRef = useRef<AsciiRendererHandle>(null)

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

        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight })
        }
        window.addEventListener('resize', handleResize)

        return () => {
            active = false
            if (currentStream) {
                currentStream.getTracks().forEach(t => t.stop())
            }
            setStream(null)
            window.removeEventListener('resize', handleResize)
        }
    }, [facingMode])

    const toggleCamera = useCallback(() => {
        setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'))
    }, [])

    const takeSnapshot = useCallback(async () => {
        if (!asciiRendererRef.current) return
        setFlash(true)
        setTimeout(() => setFlash(false), 200)

        try {
            const imageUrl = await asciiRendererRef.current.captureImage()
            if (!imageUrl) {
                setFlash(false)
                return
            }
            const a = document.createElement('a')
            a.href = imageUrl
            a.download = `ascii-capture-${Date.now()}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
        } catch (error) {
            console.error('Capture failed', error)
        }
    }, [])

    const copyToClipboard = useCallback(() => {
        if (!asciiRendererRef.current) return

        try {
            const copyContent = asciiRendererRef.current.getAsciiText()

            if (!copyContent) throw new Error()

            navigator.clipboard.writeText(copyContent).then(() => {
                setClipboardSuccess(true)
                setTimeout(() => setClipboardSuccess(false), 2000)
            })
        } catch (error) {
            console.log('Copy Failed:', error)
        }
    }, [])

    const toggleRecording = useCallback(() => {
        setIsRecording(prev => !prev)
    }, [])

    return (
        <div className="h-screen w-screen flex flex-col justify-between">
            <div className="w-full flex flex-row justify-between items-center">
                <Header
                    fps={stats.fps}
                    renderTime={stats.renderTime}
                    width={windowSize.width}
                    height={windowSize.height}
                />

                <Settings settings={settings} onChange={setSettings} />
            </div>

            {/* Flash Effect */}
            {flash && (
                <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-150 pointer-events-none" />
            )}

            {/* Clipboard Toast */}
            {clipboardSuccess && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-black/80 border border-green-500 px-6 py-3 rounded text-green-400 font-bold backdrop-blur animate-in zoom-in duration-200">
                    ASCII COPIED TO CLIPBOARD
                </div>
            )}

            <div className="fixed h-full w-screen flex justify-center -z-10 items-center">
                <AsciiView
                    ref={asciiRendererRef}
                    settings={settings}
                    stream={stream}
                    onStatsUpdate={setStats}
                    canvasSize={windowSize}
                />
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
