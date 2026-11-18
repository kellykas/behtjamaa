/**
 * Geometry for the square crop used when a leader picture is uploaded.
 *
 * The stage is a square viewport; the picture is scaled so it always covers the
 * stage ("cover") and then multiplied by the zoom the person chose. `x` and `y`
 * are the picture's top-left corner inside the stage, kept within bounds so the
 * square is never left with a gap.
 *
 * Kept free of React and the DOM: the on-screen preview and the canvas that
 * produces the saved file both use this, so what is shown is what is stored.
 */

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;

export interface CropInput {
  imageWidth: number;
  imageHeight: number;
  /** Side length of the square viewport, in pixels. */
  stage: number;
  /** 1 fills the square exactly; larger values zoom in. */
  zoom: number;
  offset: { x: number; y: number };
}

export interface CropGeometry {
  scale: number;
  width: number;
  height: number;
  x: number;
  y: number;
}

export const clampNumber = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export function cropGeometry({ imageWidth, imageHeight, stage, zoom, offset }: CropInput): CropGeometry {
  if (!(imageWidth > 0) || !(imageHeight > 0) || !(stage > 0)) {
    return { scale: 1, width: 0, height: 0, x: 0, y: 0 };
  }

  const base = Math.max(stage / imageWidth, stage / imageHeight);
  const scale = base * clampNumber(zoom, MIN_ZOOM, MAX_ZOOM);
  const width = imageWidth * scale;
  const height = imageHeight * scale;

  return {
    scale,
    width,
    height,
    // width and height are at least `stage`, so the minimum is never positive.
    x: clampNumber(offset.x, stage - width, 0),
    y: clampNumber(offset.y, stage - height, 0),
  };
}

/** Where the picture's top-left sits so the square is centred. */
export function centredOffset({ imageWidth, imageHeight, stage, zoom }: Omit<CropInput, "offset">) {
  const geometry = cropGeometry({ imageWidth, imageHeight, stage, zoom, offset: { x: 0, y: 0 } });
  return {
    x: (stage - geometry.width) / 2,
    y: (stage - geometry.height) / 2,
  };
}

/**
 * Source rectangle to draw on the canvas: the part of the picture currently
 * visible in the square, in the picture's own pixel coordinates.
 */
export function cropSourceRect({ imageWidth, imageHeight, stage, zoom, offset }: CropInput) {
  const { scale, x, y } = cropGeometry({ imageWidth, imageHeight, stage, zoom, offset });
  if (!(scale > 0)) return { x: 0, y: 0, width: imageWidth, height: imageHeight };
  return {
    x: -x / scale,
    y: -y / scale,
    width: stage / scale,
    height: stage / scale,
  };
}
