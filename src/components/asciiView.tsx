import { useEffect, useRef } from 'react'
import { AsciiSettings, CHAR_SETS } from '../types/types'

interface AsciiViewProps {
    settings: AsciiSettings
    stream: MediaStream | null
}

function AsciiView({ settings, stream }: AsciiViewProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const hiddenCanvasRef = useRef<HTMLCanvasElement>(null)

    const animationIdRef = useRef<number | null>(null)

    const ramp = CHAR_SETS[settings.characterSet]

    const renderCanvas = () => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!canvas || !video) {
            animationIdRef.current = requestAnimationFrame(renderCanvas)
            return
        }

        const ctx = canvas.getContext('2d')
        if (!ctx) {
            animationIdRef.current = requestAnimationFrame(renderCanvas)
            return
        }

        const scale = settings.fontSize

        const srcW = Math.floor(video.videoWidth / scale)
        const srcH = Math.floor(video.videoHeight / scale)

        if (srcW === 0 || srcH === 0) {
            animationIdRef.current = requestAnimationFrame(renderCanvas)
            return
        }

        // draw video small to get pixels
        if (!hiddenCanvasRef.current) {
            animationIdRef.current = requestAnimationFrame(renderCanvas)
            return
        }

        const hiddenCanvas = hiddenCanvasRef.current
        hiddenCanvas.width = srcW
        hiddenCanvas.height = srcH
        const hiddenCtx = hiddenCanvas.getContext('2d')

        if (!hiddenCtx) {
            animationIdRef.current = requestAnimationFrame(renderCanvas)
            return
        }

        hiddenCtx.drawImage(video, 0, 0, srcW, srcH)

        const data = hiddenCtx.getImageData(0, 0, srcW, srcH).data

        // draw ASCII on the visible canvas
        const fontSize = settings.fontSize || 10
        canvas.width = srcW * fontSize * 0.6
        canvas.height = srcH * fontSize

        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.font = `${fontSize}px monospace`
        ctx.fillStyle = '#00ff00'

        let i = 0
        for (let y = 0; y < srcH; y++) {
            for (let x = 0; x < srcW; x++) {
                const r = data[i++]
                const g = data[i++]
                const b = data[i++]
                i++

                const brightness = (r + g + b) / 3
                const idx = Math.floor((brightness / 255) * (ramp.length - 1))
                const char = ramp[idx]

                ctx.fillText(char, x * fontSize * 0.6, y * fontSize)
            }
        }

        animationIdRef.current = requestAnimationFrame(renderCanvas)
    }

    useEffect(() => {
        const initCamera = async () => {
            try {
                const video = videoRef.current
                if (!video) return

                video.srcObject = stream
                await video.play()

                renderCanvas()
            } catch (error) {
                console.log(error)
            }
        }

        initCamera()

        return () => {
            if (animationIdRef.current !== null) {
                cancelAnimationFrame(animationIdRef.current)
            }
        }
    }, [stream, settings])
    return (
        <>
            <div className="h-screen w-screen -z-10 flex justify-center items-center">
                <canvas ref={hiddenCanvasRef} className="hidden -z-10"></canvas>
                <canvas ref={canvasRef} className="bg-transparent -z-10"></canvas>
                <video
                    ref={videoRef}
                    height={'screen'}
                    width={'screen'}
                    style={{ display: 'none' }}
                />
            </div>
        </>
    )
}

export default AsciiView
