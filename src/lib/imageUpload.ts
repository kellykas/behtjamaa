/**
 * Rules shared by every "upload a picture" control in the app.
 *
 * The controls themselves (file picker, drag & drop, preview) live in
 * `src/components/ImageUpload.tsx`. Everything that can be decided without a
 * browser or a database lives here so it can be unit tested.
 */

/** Largest picture we accept. Kept in one place so every control agrees. */
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/** Passed straight to `<input type="file">`. */
export const IMAGE_ACCEPT = "image/*";

/** Everything that may be picked is an image; the buckets only ever hold images. */
export const DEFAULT_IMAGE_BUCKET = "profile-avatars";

/** "5242880" -> "5MB", so error messages stay readable. */
export const formatBytes = (bytes: number): string => {
  if (bytes >= 1024 * 1024) {
    const mb = bytes / (1024 * 1024);
    return `${Math.round(mb * 10) / 10}MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
};

/** The bits of a `File` these rules need, so tests do not need a real File. */
export interface ImageFileLike {
  name?: string | null;
  size?: number | null;
  type?: string | null;
}

/**
 * Why this file cannot be uploaded, or `null` when it is fine.
 * Returning the reason (instead of a boolean) keeps the toast messages in one place.
 */
export const validateImageFile = (file: ImageFileLike | null | undefined): string | null => {
  if (!file) return "Choose an image first.";
  const type = (file.type || "").toLowerCase();
  if (!type.startsWith("image/")) {
    return "Please choose an image file (PNG, JPG, GIF or WebP).";
  }
  if (typeof file.size === "number" && file.size <= 0) {
    return "That image looks empty — try another file.";
  }
  if (typeof file.size === "number" && file.size > IMAGE_MAX_BYTES) {
    return `Image must be under ${formatBytes(IMAGE_MAX_BYTES)}.`;
  }
  return null;
};

/** Lowercase extension of a file name, safe to use in a storage key. */
export const imageExtension = (fileName?: string | null): string => {
  const match = /\.([a-z0-9]+)$/i.exec((fileName || "").trim());
  const ext = match ? match[1].toLowerCase() : "";
  if (!ext || ext.length > 5) return "jpg";
  return ext;
};

/** "events/" , "events" and "/events/" all mean the same folder. */
export const normaliseFolder = (folder?: string | null): string =>
  (folder || "").trim().replace(/^\/+|\/+$/g, "");

/**
 * Unique key for `supabase.storage.from(bucket).upload(...)`.
 *
 * A unique name per upload means the insert never collides with, or has to
 * overwrite, a picture someone else owns — the storage policies only allow
 * updating objects inside your own folder.
 */
export const buildImagePath = (
  fileName: string | null | undefined,
  folder?: string | null,
  now: number = Date.now(),
  random: string = Math.random().toString(36).slice(2, 8),
): string => {
  const prefix = normaliseFolder(folder);
  const name = `${now}-${random}.${imageExtension(fileName)}`;
  return prefix ? `${prefix}/${name}` : name;
};
