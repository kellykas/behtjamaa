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
export function firstImageUrl(images: unknown): string {
  if (Array.isArray(images)) {
    const first = images.find((value) => typeof value === "string" && value.length > 0);
    return typeof first === "string" ? first : "";
  }
  return "";
}
