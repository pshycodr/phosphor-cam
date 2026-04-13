import { CHAR_SETS } from "../types/types";

export const CHARACTER_SETS = Object.keys(CHAR_SETS) as Array<
  keyof typeof CHAR_SETS
>;
