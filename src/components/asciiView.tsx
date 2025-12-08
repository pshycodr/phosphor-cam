import { useEffect, useRef, useState } from 'react'

function AsciiView() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const animationIdRef = useRef<number | null>(null)

    const [asciiOutput, setAsciiOutput] = useState('')
    const grayRamp = '░▒▓█ '
    // const grayRamp = "#$%;:*,. ";

    const renderCanvas = async () => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!canvas || !video) {
            animationIdRef.current = requestAnimationFrame(renderCanvas)
            return
        }

        if (video.videoWidth === 0 || video.videoHeight === 0) {
            animationIdRef.current = requestAnimationFrame(renderCanvas)
            return
        }

        const ctx = canvas.getContext('2d')

        if (!ctx) {
            animationIdRef.current = requestAnimationFrame(renderCanvas)
            return
        }

        const scale = 0.2

        const w = Math.floor(video.videoWidth * scale)
        const h = Math.floor(video.videoHeight * scale)

        canvas.width = video.videoWidth * scale
        canvas.height = video.videoHeight * scale

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data

        let asciiFrame = ''
        let i = 0
        for (let y = 0; y < h; y++) {
            let row = ''
            for (let x = 0; x < w; x++) {
                const r = imgPixels[i++]
                const g = imgPixels[i++]
                const b = imgPixels[i++]
                // const a = imgPixels[i++]; // Alpha value
                const brightness = (r + g + b) / 3
                const index = Math.floor((brightness / 255) * (grayRamp.length - 1))
                row += grayRamp[index]
            }
            asciiFrame += row + '\n'
        }

        setAsciiOutput(asciiFrame)

        animationIdRef.current = requestAnimationFrame(renderCanvas)
    }

    useEffect(() => {
        let stream: MediaStream | null = null
        const initCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                })

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
            if (stream) {
                stream.getTracks().forEach(t => t.stop())
            }
        }
    }, [])
    return (
        <>
            <div className="h-screen w-screen -z-10 flex justify-center items-center">
                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                <video
                    ref={videoRef}
                    height={'screen'}
                    width={'screen'}
                    style={{ display: 'none' }}
                />

                <pre className="font- text-[8px] leading-2 whitespace-pre bg-transparent">
                    {asciiOutput}
                </pre>
            </div>
        </>
    )
}

export default AsciiView
