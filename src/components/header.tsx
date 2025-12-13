import { memo } from 'react'
import { ProcessingStats } from '../types/types'

interface HeaderProps extends ProcessingStats {
    width: number
    height: number
}

function Header({ fps, renderTime, width, height }: HeaderProps) {
    return (
        <div className="m-4 flex flex-col items-start gap-3 rounded-lg bg-black/30 p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
                <img
                    src="/assets/logo.png"
                    alt="Phosphor Cam Logo"
                    className="h-15 w-15 object-contain"
                />
                <h1 className="text-3xl font-bold leading-none tracking-tight">PHOSPHOR CAM</h1>
            </div>

            <div className="flex gap-4 text-xs text-green-400 md:text-sm">
                <span>FPS: {Math.floor(fps)}</span>
                <span>RENDER: {Math.floor(renderTime)}ms</span>
                <span>
                    RES: {width} × {height}
                </span>
            </div>
        </div>
    )
}

export default memo(Header)
