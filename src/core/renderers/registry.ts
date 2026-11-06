import type { RendererFactory, RenderMode } from "@/shared/types";

import { createAsciiRenderer } from "./ascii";
import { createDitherRenderer } from "./dither";
import { createHalftoneRenderer } from "./halftone";
import { createLinesRenderer } from "./lines";
import { createVoxelRenderer } from "./voxel";

export const RENDERERS: Record<RenderMode, RendererFactory> = {
  ascii: createAsciiRenderer,
  dither: createDitherRenderer,
  halftone: createHalftoneRenderer,
  voxel: createVoxelRenderer,
  lines: createLinesRenderer,
};
