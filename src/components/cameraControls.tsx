import { RefreshCw, Copy, Check } from 'lucide-react'
import { memo, useState } from 'react'

type CameraControlsProps = {
    onFlip: () => void
    onShot: () => void
    onCopy: () => void
    onToggleRecording: () => void
    isRecording: boolean
    formatTime: (seconds: number) => string
    recordingTime: number
}

const CameraControls = ({
    onFlip,
    onShot,
    onCopy,
    onToggleRecording,
    isRecording,
    formatTime,
    recordingTime,
}: CameraControlsProps) => {
    const [mode, setMode] = useState<'photo' | 'video'>('photo')
    const [isFlipping, setIsFlipping] = useState(false)
    const [isCopied, setIsCopied] = useState(false)

    const handleFlip = () => {
        setIsFlipping(prev => !prev)
        onFlip()
        setTimeout(() => setIsFlipping(prev => !prev), 600)
    }

    const handleCopy = () => {
        setIsCopied(true)
        onCopy()
        setTimeout(() => setIsCopied(false), 1000)
    }

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 flex flex-col items-center pb-8 md:pb-10 gap-6">
            <div className="pointer-events-auto flex items-center gap-1 bg-black/50 backdrop-blur-md rounded-full p-1 border border-green-500/30">
                <button
                    onClick={() => setMode('photo')}
                    className={`px-6 py-2 rounded-full text-xs font-bold tracking-wider transition-all ${
                        mode === 'photo'
                            ? 'bg-green-600 text-black'
                            : 'text-green-400 hover:text-green-300'
                    }`}
                >
                    PHOTO
                </button>
                <button
                    onClick={() => setMode('video')}
                    className={`px-6 py-2 rounded-full text-xs font-bold tracking-wider transition-all ${
                        mode === 'video'
                            ? 'bg-red-600 text-black'
                            : 'text-red-400 hover:text-red-300'
                    }`}
                >
                    VIDEO
                </button>
            </div>

            <div className="pointer-events-auto flex items-end justify-center gap-8 md:gap-12 px-4">
                <button
                    onClick={handleFlip}
                    className="group flex flex-col items-center gap-1.5 focus:outline-none"
                >
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-green-500/30 bg-black/40 backdrop-blur flex items-center justify-center group-hover:bg-green-900/30 group-hover:border-green-400 transition-all">
                        <RefreshCw
                            size={22}
                            strokeWidth={1.5}
                            className={`text-white transition-transform duration-600  ${isFlipping ? 'rotate-180' : ''}`}
                        />
                    </div>
                    <span className="text-[9px] md:text-[10px] tracking-widest font-bold opacity-70 group-hover:opacity-100 text-white">
                        FLIP
                    </span>
                </button>

                {mode === 'photo' ? (
                    <button
                        onClick={onShot}
                        className="group flex flex-col items-center gap-1.5 focus:outline-none"
                    >
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-[3px] border-white/80 bg-white/10 backdrop-blur flex items-center justify-center group-hover:bg-white/20 group-hover:scale-105 transition-all group-active:scale-95">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white opacity-90 group-hover:opacity-100"></div>
                        </div>
                        <span className="text-[9px] md:text-[10px] tracking-widest font-bold opacity-70 group-hover:opacity-100 text-white">
                            CAPTURE
                        </span>
                    </button>
                ) : (
                    <button
                        onClick={onToggleRecording}
                        className="group flex flex-col items-center gap-1.5 focus:outline-none"
                    >
                        <div
                            className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-[3px] backdrop-blur flex items-center justify-center transition-all ${
                                isRecording
                                    ? 'border-red-500 bg-red-900/30 group-hover:bg-red-900/40'
                                    : 'border-red-500/80 bg-red-500/10 group-hover:bg-red-500/20 group-hover:scale-105 group-active:scale-95'
                            }`}
                        >
                            <div
                                className={`bg-red-500 transition-all ${
                                    isRecording
                                        ? 'w-7 h-7 md:w-8 md:h-8 rounded-lg animate-pulse'
                                        : 'w-16 h-16 md:w-20 md:h-20 rounded-full opacity-90 group-hover:opacity-100'
                                }`}
                            ></div>
                        </div>
                        <span
                            className={`text-[9px] md:text-[10px] tracking-widest font-bold transition-colors ${
                                isRecording
                                    ? 'text-red-400 font-mono'
                                    : 'opacity-70 group-hover:opacity-100 text-white'
                            }`}
                        >
                            {isRecording ? formatTime(recordingTime) : 'RECORD'}
                        </span>
                    </button>
                )}

                <button
                    onClick={handleCopy}
                    className="group flex flex-col items-center gap-1.5 focus:outline-none"
                >
                    <div
                        className={`w-14 h-14 md:w-16 md:h-16 rounded-full border backdrop-blur flex items-center justify-center transition-all ${
                            isCopied
                                ? 'border-green-400 bg-green-900/40 scale-110'
                                : 'border-green-500/30 bg-black/40 group-hover:bg-green-900/30 group-hover:border-green-400'
                        }`}
                    >
                        {isCopied ? (
                            <Check
                                size={22}
                                strokeWidth={2.5}
                                className="text-green-400 animate-in fade-in zoom-in duration-200"
                            />
                        ) : (
                            <Copy size={22} strokeWidth={1.5} className="text-white" />
                        )}
                    </div>
                    <span
                        className={`text-[9px] md:text-[10px] tracking-widest font-bold transition-colors ${
                            isCopied
                                ? 'text-green-400'
                                : 'opacity-70 group-hover:opacity-100 text-white'
                        }`}
                    >
                        {isCopied ? 'COPIED' : 'COPY'}
                    </span>
                </button>
            </div>
        </div>
    )
}

export default memo(CameraControls)
