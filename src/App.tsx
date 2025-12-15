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
import { MdCancel } from 'react-icons/md'

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
    const [recordingTime, setRecordingTime] = useState(0)
    const [error, setError] = useState<string | null>(null)

    const asciiRendererRef = useRef<AsciiRendererHandle>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const recordedChunksRef = useRef<Blob[]>([])
    const recordingTimerRef = useRef<number | null>(null)

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
                setError('Unable to access camera. Please ensure permissions are granted.')
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
            setError('Failed to Copy. Please try again')
        }
    }, [])

    const toggleRecording = useCallback(() => {
        if (isRecording) {
            // stop recodring
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop()

                if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
            }
            setIsRecording(false)
        } else {
            // start recodring
            const canvas = asciiRendererRef.current?.getCanvas()
            if (!canvas || !canvas.height || !canvas.width)
                throw new Error('Error while start recording')

            const videoBitsPerSecond = 2500000 // Default 2.5 Mbps

            const stream = canvas.captureStream(30) // 30 fps

            try {
                // Detect supported codec
                // Safari support https://stackoverflow.com/a/66914924
                // Firefox & Chrome https://stackoverflow.com/a/50881710
                let mimeType: string | null = null
                if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
                    mimeType = 'video/webm;codecs=vp9' // Chrome/chromium based
                } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
                    mimeType = 'video/webm;codecs=vp8' // Firefox
                } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
                    mimeType = 'video/mp4;codecs=avc1' // Safari
                } else if (MediaRecorder.isTypeSupported('video/webm')) {
                    mimeType = 'video/webm' // fallback webm
                } else if (MediaRecorder.isTypeSupported('video/mp4')) {
                    mimeType = 'video/mp4' // fallback mp4
                }

                if (!mimeType) {
                    throw new Error('No MediaRecorder supported video codec found on this browser')
                }

                const options: MediaRecorderOptions = {
                    mimeType,
                    videoBitsPerSecond,
                }

                const recorder = new MediaRecorder(stream, options)
                recordedChunksRef.current = []

                recorder.ondataavailable = e => {
                    if (e.data.size > 0) recordedChunksRef.current.push(e.data)
                }

                recorder.onstop = () => {
                    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `ascii-video-${Date.now()}.webm`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    setRecordingTime(0)
                }

                recorder.start()
                mediaRecorderRef.current = recorder
                setIsRecording(true)
                console.log('start')

                recordingTimerRef.current = window.setInterval(() => {
                    setRecordingTime(t => t + 1)
                }, 1000)
            } catch (error) {
                console.error('Recording failed to start', error)
                setError('Failed to start recording. Browser might not support this format.')
            }
        }
    }, [isRecording])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="h-screen w-screen overflow-hidden">
            <Header
                fps={stats.fps}
                renderTime={stats.renderTime}
                width={windowSize.width}
                height={windowSize.height}
            />

            <Settings settings={settings} onChange={setSettings} />

            {/* Flash Effect */}
            {flash && (
                <div className="fixed inset-0 bg-white z-50 animate-out fade-out duration-150 pointer-events-none" />
            )}

            {/* Clipboard Toast */}
            {clipboardSuccess && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-black/80 border border-green-500 px-6 py-3 rounded text-green-400 font-bold backdrop-blur animate-in zoom-in duration-200">
                    ASCII COPIED TO CLIPBOARD
                </div>
            )}

            {/* Error Toast */}
            {error && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-black/80 border border-red-500 px-6 py-4 rounded text-red-500 font-bold backdrop-blur animate-in zoom-in duration-200">
                    <button
                        onClick={() => setError(null)}
                        className="absolute top-3 right-3 text-red-500 hover:text-red-400 text-xl leading-none"
                        aria-label="Close error"
                    >
                        <MdCancel />
                    </button>

                    <div>
                        <h1 className="text-4xl mb-4">SYSTEM ERROR</h1>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            <div className="fixed inset-0 flex justify-center items-center">
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
                formatTime={formatTime}
                recordingTime={recordingTime}
            />
        </div>
    )
}

export default App
