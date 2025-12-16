/**
 * Gets the first supported MIME type for MediaRecorder
 * Falls back through multiple codec options for cross-browser compatibility
 * Safari support https://stackoverflow.com/a/66914924
 * Firefox & Chrome https://stackoverflow.com/a/50881710
 */
export function getSupportedMediaRecorderMimeType(): string | undefined {
    const mimeTypes = [
        'video/webm;codecs=vp9', // Chrome/chromium based
        'video/webm;codecs=vp8', // Firefox
        'video/mp4;codecs=avc1', // Safari
        'video/webm', // fallback webm
        'video/mp4', // fallback mp4
    ]

    for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
            return mimeType
        }
    }

    return undefined
}
