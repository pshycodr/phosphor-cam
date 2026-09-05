import type { AsciiCharacterMap } from "@/types";

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
} as const;

export const CHARACTER_SETS = Object.keys(CHAR_SETS) as Array<
  keyof typeof CHAR_SETS
>;
