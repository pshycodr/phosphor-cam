import { RefreshCw, Copy, Video } from 'lucide-react'

type CameraControlsProps = {
    onFlip: () => void
    onShot: () => void
    onCopy: () => void
    onToggleRecording: () => void
    isRecording: boolean
    recordingLabel?: string
}

const CameraControls = ({
    onFlip,
    onShot,
    onCopy,
    onToggleRecording,
    isRecording,
    recordingLabel,
}: CameraControlsProps) => {
    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 flex justify-center pb-5 md:pb-8">
            <div className="pointer-events-auto flex w-full max-w-md items-end justify-between px-6 md:px-8 gap-4 md:gap-6">
                {/* Flip */}
                <button
                    onClick={onFlip}
                    className="group flex flex-col items-center gap-2 focus:outline-none"
                >
                    <div className="w-12 h-12 rounded-full border border-green-500/30 bg-black/40 backdrop-blur flex items-center justify-center group-hover:bg-green-900/30 group-hover:border-green-400 transition-all">
                        <RefreshCw size={20} strokeWidth={1.5} className="text-white" />
                    </div>
                    <span className="text-[10px] tracking-widest font-bold opacity-70 group-hover:opacity-100">
                        FLIP
                    </span>
                </button>

                {/* Shutter */}
                <button
                    onClick={onShot}
                    className="group flex flex-col items-center gap-2 focus:outline-none translate-y-1"
                >
                    <div className="w-16 h-16 rounded-full border-2 border-white/80 bg-white/10 backdrop-blur flex items-center justify-center group-hover:bg-white/20 group-hover:scale-105 transition-all group-active:scale-95">
                        <div className="w-12 h-12 rounded-full bg-white opacity-90 group-hover:opacity-100"></div>
                    </div>
                    <span className="text-[10px] tracking-widest font-bold opacity-70 group-hover:opacity-100">
                        HQ SHOT
                    </span>
                </button>

                {/* Right side actions */}
                <div className="flex items-end gap-4">
                    {/* Copy */}
                    <button
                        onClick={onCopy}
                        className="group flex flex-col items-center gap-2 focus:outline-none"
                    >
                        <div className="w-12 h-12 rounded-full border border-green-500/30 bg-black/40 backdrop-blur flex items-center justify-center group-hover:bg-green-900/30 group-hover:border-green-400 transition-all">
                            <Copy size={20} strokeWidth={1.5} className="text-white" />
                        </div>
                        <span className="text-[10px] tracking-widest font-bold opacity-70 group-hover:opacity-100">
                            COPY
                        </span>
                    </button>

                    {/* Record */}
                    <button
                        onClick={onToggleRecording}
                        className="group flex flex-col items-center gap-2 focus:outline-none"
                    >
                        <div
                            className={`w-12 h-12 rounded-full border transition-all flex items-center justify-center backdrop-blur ${
                                isRecording
                                    ? 'border-red-500 bg-red-900/20'
                                    : 'border-red-500/50 bg-black/40'
                            }`}
                        >
                            <Video
                                size={isRecording ? 14 : 20}
                                strokeWidth={isRecording ? 3 : 1.5}
                                className={`transition-all ${
                                    isRecording ? 'text-red-500' : 'text-red-500/80'
                                }`}
                            />
                        </div>
                        <span
                            className={`text-[10px] tracking-widest font-bold transition-colors ${
                                isRecording ? 'text-red-400' : 'opacity-70 group-hover:opacity-100'
                            }`}
                        >
                            {isRecording ? (recordingLabel ?? 'REC') : 'REC'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CameraControls
