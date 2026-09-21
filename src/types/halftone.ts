export type SpriteAtlas = {
  /** atlas canvas - white-on-transparent for the base atlas, or a solid
   *  tinted color for a pre-tinted atlas built from it */
  canvas: HTMLCanvasElement;
  /** radius for each of DOT_LEVELS entries, index 0 = 0 */
  radii: Float32Array;
  /** side of one sprite cell in px (all sprites are square, same size) */
  cell: number;
  /** x offset of sprite i inside the atlas */
  xs: Int32Array;
  /** padding around the dot inside a sprite cell */
  padding: number;
};
