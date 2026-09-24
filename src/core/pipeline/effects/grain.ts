const GRAIN_TILE_COUNT = 4;
const GRAIN_TILE_SIZE = 128;

let grainTiles: HTMLCanvasElement[] | null = null;
let grainFrame = 0;

function buildGrainTiles(): HTMLCanvasElement[] {
  const tiles: HTMLCanvasElement[] = [];
  for (let t = 0; t < GRAIN_TILE_COUNT; t++) {
    const tile = document.createElement("canvas");
    tile.width = GRAIN_TILE_SIZE;
    tile.height = GRAIN_TILE_SIZE;
    const tctx = tile.getContext("2d");
    if (tctx) {
      const img = tctx.createImageData(GRAIN_TILE_SIZE, GRAIN_TILE_SIZE);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      tctx.putImageData(img, 0, 0);
    }
    tiles.push(tile);
  }
  return tiles;
}

export function applyGrain(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  intensity = 0.4
) {
  if (!grainTiles) grainTiles = buildGrainTiles();
  grainFrame++;
  const tile = grainTiles[grainFrame % grainTiles.length];
  const pattern = ctx.createPattern(tile, "repeat");
  if (!pattern) return;

  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.5 * intensity;
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}
