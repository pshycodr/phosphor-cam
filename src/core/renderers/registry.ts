import type { RendererFactory, RenderMode } from "@/types";

import { createAsciiRenderer } from "./ascii";
import { createDitherRenderer } from "./dither";
import { createHalftoneRenderer } from "./halftone";

export const RENDERERS: Record<RenderMode, RendererFactory> = {
  ascii: createAsciiRenderer,
  dither: createDitherRenderer,
  halftone: createHalftoneRenderer,
};
