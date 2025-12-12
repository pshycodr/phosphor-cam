/**
 * Pre-calculates a lookup table for brightness to character mapping
 */
export const createBrightnessMap = (chars: string): string[] => {
    const map: string[] = []
    const len = chars.length
    for (let i = 0; i < 256; i++) {
        const index = Math.floor((i / 256) * len)
        map[i] = chars[Math.min(index, len - 1)]
    }
    return map
}

/**
 * Adjusts color values based on brightness and contrast settings.
 *
 * formula: factor * (color - 128) + 128 + brightness
 */
export const adjustColor = (val: number, contrast: number, brightness: number): number => {
    const v = contrast * (val - 128) + 128 + brightness
    return Math.max(0, Math.min(255, v))
}

export const getChar = (brightness: number, map: string[], invert: boolean): string => {
    const index = invert ? 255 - brightness : brightness
    // Clamp index just in case
    const safeIndex = Math.max(0, Math.min(255, Math.floor(index)))
    return map[safeIndex]
}
