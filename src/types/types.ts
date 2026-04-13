export interface AsciiSettings {
  resolution: number;
  fontSize: number;
  contrast: number;
  brightness: number;
  colorMode: boolean;
  invert: boolean;
  characterSet: "standard" | "simple" | "blocks" | "matrix" | "edges";
}

export interface AsciiCharacterMap {
  [key: string]: string;
}

export const CHAR_SETS: AsciiCharacterMap = {
  standard: " .:-=+*#%@MB",
  simple: " .+#@",
  blocks: " ░▒▓█",
  matrix: " 01",
  edges: "  .,-_~:;=!*#$@",
  dense: ' .`^",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  lines: " ─│┌┐└┘├┤┬┴┼",
  heavyLines: " ═║╔╗╚╝╠╣╦╩╬",
  invertedBlocks: " █▓▒░ ",
  braille: " ⠁⠃⠇⡇⣇⣧⣷⣿",
  dots: " .•◦●◉",
  circles: " .oO◌◎●",
  spark: " .`'^*✦✧✶✹",
  tech: " .:+=xX$#",
  digital: " .:-=+*#%@",
  alphabetic: " .abcdefghijklmnopqrstuvwxyz",
  upperAlpha: " .ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numeric: " 0123456789",
  mixed: " .:-=+*#%@abcdefghijklmnopqrstuvwxyz",
  arrows: " .<>^v",
  binaryDense: " 01#@",
  runic: " .ᚠᚢᚦᚨᚱᚲᚷᚹ",
};

export type CameraFacingMode = "user" | "environment";

export type ProcessingStats = {
  fps: number;
  renderTime: number;
};

export interface AsciiRendererHandle {
  captureImage: () => Promise<string>;
  getAsciiText: () => string;
  getCanvas: () => HTMLCanvasElement | null;
}
