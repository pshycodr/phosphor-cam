import { memo } from 'react'
import { ProcessingStats } from '../types/types'

interface HeaderProps extends ProcessingStats {
    width: number
    height: number
}

function Header({ fps, renderTime, width, height }: HeaderProps) {
    return (
        <>
            <div className="m-4 flex flex-col justify-center items-start gap-1 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                <h1 className="font-bold text-3xl">ASCII-IT</h1>
                <div className="flex flex-row gap-4 text-xs md:text-sm ">
                    <span>FPS: {Math.floor(fps)}</span>
                    <span>RENDER: {Math.floor(renderTime)}ms</span>
                    <span>
                        RES: {width} × {height}
                    </span>
                </div>
            </div>
        </>
    )
}

export default memo(Header)
