/**
 * Shrinking for pictures that are uploaded several at a time.
 *
 * The cropper handles one picture at a time, so a gallery cannot send every
 * file through it. These photos are still straight from a phone, so each one is
 * scaled down to a sensible size before it is uploaded - large enough to look
 * sharp on the site, small enough that a page of them still loads quickly.
 */

/** Longest side kept by `downscaleImageFile`. */
export const GALLERY_MAX_DIMENSION = 1600;

/** Fit `width` x `height` inside a `max` square without distorting it. */
export function fitWithin(width: number, height: number, max: number) {
  if (!(width > 0) || !(height > 0) || !(max > 0)) return { width: 0, height: 0 };
  const longest = Math.max(width, height);
  if (longest <= max) return { width: Math.round(width), height: Math.round(height) };
  const scale = max / longest;
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/**
 * Re-encode a picked photo as a JPEG no larger than `maxDimension` on its
 * longest side, honouring the camera's orientation. Falls back to the original
 * file when the browser cannot decode it, so a valid picture is never lost.
 */
export async function downscaleImageFile(
  file: File,
  maxDimension: number = GALLERY_MAX_DIMENSION,
  quality = 0.9,
): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.decoding = "async";
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("That picture could not be opened."));
      element.src = url;
    });

    const size = fitWithin(image.naturalWidth, image.naturalHeight, maxDimension);
    if (!(size.width > 0) || !(size.height > 0)) return file;

    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, size.width, size.height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) return file;
    const base = file.name.replace(/\.[^.]+$/, "") || "picture";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}
