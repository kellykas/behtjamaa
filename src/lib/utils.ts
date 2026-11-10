import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * First usable image URL from a jsonb column.
 *
 * `branch_events.images` is jsonb, so the generated type is `Json`, whose array
 * member is `string | number | boolean | Json[] | object`. Only strings are
 * usable as an <img> src, so pick the first one and ignore anything else.
 * Returns "" when there is none, so callers can branch on falsiness.
 */
/**
 * Parses the locally stored list of prayer request ids. Corrupt or non-array
 * storage yields an empty list instead of throwing during render.
 */
export function parsePrayedIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

const SUPABASE_PUBLIC_OBJECT = "/storage/v1/object/public/";
const SUPABASE_RENDER_IMAGE = "/storage/v1/render/image/public/";

/** Widths the renderer is asked for, so nearby call sites share a cached variant. */
const WIDTH_STEPS = [64, 96, 160, 240, 320, 480, 640, 800, 1024, 1280, 1600];

/**
 * Route a Supabase Storage upload through the image renderer.
 *
 * Uploads keep their original resolution from a phone camera, so a hero photo
 * can be well over a megabyte for a box a few hundred pixels wide. Asking for a
 * width and WebP output drops the same picture to a fraction of that.
 *
 * Only public object URLs are rewritten: signed URLs carry a token the render
 * endpoint would reject, and anything not hosted here (an external CDN, a data
 * URL) has to stay as it is.
 */
export function optimizedImageUrl(url: string, width: number, quality = 70): string {
  if (!url || !url.includes(SUPABASE_PUBLIC_OBJECT)) return url;
  // The renderer handles raster images only; transforming an SVG would fail.
  if (/\.svg(\?|$)/i.test(url)) return url;

  const [path, search = ""] = url.split("?");
  const snappedWidth = WIDTH_STEPS.find((step) => step >= width) ?? WIDTH_STEPS[WIDTH_STEPS.length - 1];
  const params = new URLSearchParams(search);
  params.set("width", String(snappedWidth));
  params.set("quality", String(quality));
  params.set("format", "webp");

  return `${path.replace(SUPABASE_PUBLIC_OBJECT, SUPABASE_RENDER_IMAGE)}?${params.toString()}`;
}

export function firstImageUrl(images: unknown): string {
  if (Array.isArray(images)) {
    const first = images.find((value) => typeof value === "string" && value.length > 0);
    return typeof first === "string" ? first : "";
  }
  return "";
}
