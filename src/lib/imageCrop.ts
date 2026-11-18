/**
 * Geometry for the crop used when a picture is uploaded.
 *
 * The stage is a viewport (square for a face or a logo, wider for a banner);
 * the picture is scaled so it always covers the stage ("cover") and then
 * multiplied by the zoom the person chose. `x` and `y` are the picture's
 * top-left corner inside the stage, kept within bounds so the frame is never
 * left with a gap.
 *
 * `stage` is the width; leaving `stageHeight` out makes the frame square, which
 * is what the leader pictures use.
 *
 * Kept free of React and the DOM: the on-screen preview and the canvas that
 * produces the saved file both use this, so what is shown is what is stored.
 */

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;

export interface CropInput {
  imageWidth: number;
  imageHeight: number;
  /** Width of the frame, in pixels. */
  stage: number;
  /** Height of the frame; defaults to `stage`, i.e. a square. */
  stageHeight?: number;
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

const frameSize = ({ stage, stageHeight }: Pick<CropInput, "stage" | "stageHeight">) => ({
  width: stage,
  height: stageHeight && stageHeight > 0 ? stageHeight : stage,
});

export function cropGeometry(input: CropInput): CropGeometry {
  const { imageWidth, imageHeight, zoom, offset } = input;
  const frame = frameSize(input);
  if (!(imageWidth > 0) || !(imageHeight > 0) || !(frame.width > 0) || !(frame.height > 0)) {
    return { scale: 1, width: 0, height: 0, x: 0, y: 0 };
  }

  const base = Math.max(frame.width / imageWidth, frame.height / imageHeight);
  const scale = base * clampNumber(zoom, MIN_ZOOM, MAX_ZOOM);
  const width = imageWidth * scale;
  const height = imageHeight * scale;

  return {
    scale,
    width,
    height,
    // width and height are at least the frame's, so the minimum is never positive.
    x: clampNumber(offset.x, frame.width - width, 0),
    y: clampNumber(offset.y, frame.height - height, 0),
  };
}

/** Where the picture's top-left sits so the frame is centred. */
export function centredOffset(input: Omit<CropInput, "offset">) {
  const frame = frameSize(input);
  const geometry = cropGeometry({ ...input, offset: { x: 0, y: 0 } });
  return {
    x: (frame.width - geometry.width) / 2,
    y: (frame.height - geometry.height) / 2,
  };
}

/**
 * Source rectangle to draw on the canvas: the part of the picture currently
 * visible in the frame, in the picture's own pixel coordinates.
 */
export function cropSourceRect(input: CropInput) {
  const { imageWidth, imageHeight } = input;
  const frame = frameSize(input);
  const { scale, x, y } = cropGeometry(input);
  if (!(scale > 0)) return { x: 0, y: 0, width: imageWidth, height: imageHeight };
  return {
    x: -x / scale,
    y: -y / scale,
    width: frame.width / scale,
    height: frame.height / scale,
  };
}
