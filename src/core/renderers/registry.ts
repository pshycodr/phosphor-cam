import type { RendererFactory, RenderMode } from "@/types";

import { createAsciiRenderer } from "./ascii";

export const RENDERERS: Record<RenderMode, RendererFactory> = {
  ascii: createAsciiRenderer,
};
