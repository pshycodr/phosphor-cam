import { memo } from 'react'
import { ProcessingStats } from '../types/types'

interface HeaderProps extends ProcessingStats {
    width: number
    height: number
}

function Header({ fps, renderTime, width, height }: HeaderProps) {
    return (
        <div className="fixed top-4 left-4 z-10  flex flex-col gap-2 max-w-[calc(100vw-100px)]">
            <div className="flex items-center gap-2 rounded-lg bg-black/40 px-3 py-2 backdrop-blur-sm border border-green-500/30 shadow-lg">
                <img
                    src="/assets/logo.png"
                    alt="Phosphor Cam Logo"
                    className="h-8 w-8 object-contain"
                />
                <h1 className="text-lg md:text-xl font-bold leading-none tracking-tight text-green-400">
                    PHOSPHOR CAM
                </h1>
            </div>

            <div className="flex gap-3 text-[10px] md:text-xs font-mono text-green-400 bg-black/40 px-3 py-2 rounded-lg backdrop-blur-sm border border-green-500/30 shadow-lg">
                <span className="flex items-center gap-1">
                    <span className="opacity-60">FPS:</span>
                    <span className="font-semibold">{Math.floor(fps)}</span>
                </span>
                <span className="text-green-600">|</span>
                <span className="flex items-center gap-1">
                    <span className="opacity-60">RENDER:</span>
                    <span className="font-semibold">{Math.floor(renderTime)}ms</span>
                </span>
                <span className="text-green-600">|</span>
                <span className="flex items-center gap-1">
                    <span className="opacity-60">RES:</span>
                    <span className="font-semibold">
                        {width} × {height}
                    </span>
                </span>
            </div>
        </div>
    )
}

export default memo(Header)
