import { memo, useCallback, useEffect, useRef } from 'react'
import { AsciiSettings, CHAR_SETS, ProcessingStats } from '../types/types'
import { adjustColor, createBrightnessMap, getChar } from '../utils/asciiUtils'

interface AsciiViewProps {
    settings: AsciiSettings
    stream: MediaStream | null
    onStatsUpdate: (status: ProcessingStats) => void
    canvasSize: {
        width: number
        height: number
    }
}

function AsciiView({ settings, stream, onStatsUpdate, canvasSize }: AsciiViewProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const hiddenCanvasRef = useRef<HTMLCanvasElement>(null)
    const lastTimeRef = useRef<number>(0)
    const animationIdRef = useRef<number | null>(null)

    const ramp = CHAR_SETS[settings.characterSet]

    const renderCanvas = useCallback(
        (time: number) => {
            const startRender = performance.now()
            const delta = time - lastTimeRef.current
            lastTimeRef.current = time
            const fps = 1000 / delta

            const video = videoRef.current
            const canvas = canvasRef.current
            if (!canvas || !video) {
                animationIdRef.current = requestAnimationFrame(t => renderCanvas(t))
                return
            }

            const ctx = canvas.getContext('2d', { alpha: false })

            if (!ctx) {
                animationIdRef.current = requestAnimationFrame(t => renderCanvas(t))
                return
            }

            const fontScale = settings.fontSize || 10

            const srcW = Math.floor(canvasSize.width / fontScale)
            const srcH = Math.floor(canvasSize.height / fontScale)

            if (srcW <= 0 || srcH <= 0) {
                animationIdRef.current = requestAnimationFrame(t => renderCanvas(t))
                return
            }

            // draw video small to get pixels
            if (!hiddenCanvasRef.current) {
                animationIdRef.current = requestAnimationFrame(t => renderCanvas(t))
                return
            }

            if (hiddenCanvasRef.current) {
                if (
                    hiddenCanvasRef.current.width !== srcW ||
                    hiddenCanvasRef.current.height !== srcH
                ) {
                    hiddenCanvasRef.current.width = srcW
                    hiddenCanvasRef.current.height = srcH
                }
            }

            const hiddenCanvas = hiddenCanvasRef.current
            const hiddenCtx = hiddenCanvas.getContext('2d', { willReadFrequently: true })

            if (!hiddenCtx) {
                animationIdRef.current = requestAnimationFrame(t => renderCanvas(t))
                return
            }

            try {
                hiddenCtx.drawImage(video, 0, 0, srcW, srcH)
            } catch {
                animationIdRef.current = requestAnimationFrame(t => renderCanvas(t))
                return
            }

            const pixels = hiddenCtx.getImageData(0, 0, srcW, srcH).data

            const brightnessMap = createBrightnessMap(ramp)
            const { contrast, brightness: brightnessOffset, colorMode, invert } = settings

            // draw ASCII on the visible canvas
            canvas.width = srcW * fontScale
            canvas.height = srcH * fontScale

            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.font = `${fontScale}px 'Fira Code', monospace`

            ctx.fillStyle = invert ? '#00ff00' : '#000000'
            if (!invert) ctx.fillStyle = '#000000'
            ctx.textBaseline = 'top'

            const pixelCount = srcW * srcH

            // let i = 0
            for (let i = 0; i < pixelCount; i++) {
                const r = pixels[i * 4]
                const g = pixels[i * 4 + 1]
                const b = pixels[i * 4 + 2]

                let l = 0.299 * r + 0.587 * g + 0.114 * b

                // Adjust
                if (contrast !== 1.0 || brightnessOffset !== 0) {
                    l = adjustColor(l, contrast, brightnessOffset)
                }

                const char = getChar(l, brightnessMap, invert)

                const x = (i % srcW) * fontScale
                const y = Math.floor(i / srcW) * fontScale

                // const brightness = (r + g + b) / 3
                // const idx = Math.floor((brightness / 255) * (ramp.length - 1))

                if (colorMode) {
                    ctx.fillStyle = `rgb(${r},${g},${b})`
                } else {
                    ctx.fillStyle = invert ? '#000000' : '#00ff00'
                }

                ctx.fillText(char, x, y)
            }

            const endRender = performance.now()

            if (Math.random() > 0.95) {
                onStatsUpdate({ fps, renderTime: endRender - startRender })
            }
            animationIdRef.current = requestAnimationFrame(t => renderCanvas(t))
        },
        [settings, canvasSize.height, canvasSize.width, onStatsUpdate, ramp],
    )

    useEffect(() => {
        if (!stream) return

        const video = videoRef.current
        if (!video) return

        video.srcObject = stream
        video.play()

        animationIdRef.current = requestAnimationFrame(t => renderCanvas(t))

        return () => {
            if (animationIdRef.current !== null) {
                cancelAnimationFrame(animationIdRef.current)
            }
        }
    }, [renderCanvas, stream])

    return (
        <>
            <div className="h-screen w-screen -z-10 flex justify-center items-center">
                <video
                    ref={videoRef}
                    height={'screen'}
                    width={'screen'}
                    style={{ display: 'none' }}
                    playsInline
                    muted
                />
                <canvas ref={hiddenCanvasRef} className="hidden -z-10" />
                <canvas
                    ref={canvasRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    className="bg-transparent -z-10"
                />
            </div>
        </>
    )
}

export default memo(AsciiView)
