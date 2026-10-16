import { describe, expect, it } from "vitest";
import {
  buildImagePath,
  formatBytes,
  imageExtension,
  IMAGE_MAX_BYTES,
  normaliseFolder,
  validateImageFile,
} from "@/lib/imageUpload";

const fileOf = (over: Partial<{ name: string; size: number; type: string }> = {}) => ({
  name: "photo.png",
  size: 1024,
  type: "image/png",
  ...over,
});

describe("validateImageFile", () => {
  it("accepts a normal image", () => {
    expect(validateImageFile(fileOf())).toBeNull();
  });

  it("asks for a file when nothing is chosen", () => {
    expect(validateImageFile(null)).toMatch(/choose an image/i);
    expect(validateImageFile(undefined)).toMatch(/choose an image/i);
  });

  it("rejects anything that is not an image", () => {
    expect(validateImageFile(fileOf({ name: "cv.pdf", type: "application/pdf" }))).toMatch(/image file/i);
    expect(validateImageFile(fileOf({ name: "song.mp3", type: "audio/mpeg" }))).toMatch(/image file/i);
  });

  it("treats a missing type as not-an-image instead of crashing", () => {
    expect(validateImageFile(fileOf({ type: "" }))).toMatch(/image file/i);
    expect(validateImageFile({ name: "x", size: 10, type: null })).toMatch(/image file/i);
  });

  it("rejects images above the size limit", () => {
    expect(validateImageFile(fileOf({ size: IMAGE_MAX_BYTES }))).toBeNull();
    expect(validateImageFile(fileOf({ size: IMAGE_MAX_BYTES + 1 }))).toMatch(/under 5MB/i);
  });

  it("rejects an empty file", () => {
    expect(validateImageFile(fileOf({ size: 0 }))).toMatch(/empty/i);
  });

  it("accepts every common image type", () => {
    ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"].forEach((type) => {
      expect(validateImageFile(fileOf({ type }))).toBeNull();
    });
  });
});

describe("formatBytes", () => {
  it("renders megabytes and kilobytes", () => {
    expect(formatBytes(5 * 1024 * 1024)).toBe("5MB");
    expect(formatBytes(512 * 1024)).toBe("512KB");
  });
});

describe("imageExtension", () => {
  it("lowercases the extension", () => {
    expect(imageExtension("Photo.JPG")).toBe("jpg");
  });

  it("keeps longer safe extensions", () => {
    expect(imageExtension("shot.webp")).toBe("webp");
    expect(imageExtension("anim.jpeg")).toBe("jpeg");
  });

  it("falls back to jpg when there is no usable extension", () => {
    expect(imageExtension("no-extension")).toBe("jpg");
    expect(imageExtension("")).toBe("jpg");
    expect(imageExtension(null)).toBe("jpg");
    expect(imageExtension("weird.superlongext")).toBe("jpg");
  });
});

describe("normaliseFolder", () => {
  it("trims surrounding slashes and spaces", () => {
    expect(normaliseFolder("events")).toBe("events");
    expect(normaliseFolder("/events/")).toBe("events");
    expect(normaliseFolder("  events  ")).toBe("events");
    expect(normaliseFolder(null)).toBe("");
  });
});

describe("buildImagePath", () => {
  it("builds a unique key with the original extension", () => {
    expect(buildImagePath("Photo.PNG", null, 111, "abc123")).toBe("111-abc123.png");
  });

  it("prefixes the folder when one is given", () => {
    expect(buildImagePath("banner.jpg", "branches", 42, "zz9")).toBe("branches/42-zz9.jpg");
    expect(buildImagePath("banner.jpg", "/branches/", 42, "zz9")).toBe("branches/42-zz9.jpg");
  });

  it("never repeats a key for the same file", () => {
    const first = buildImagePath("photo.png", "events", 1, "aaa");
    const second = buildImagePath("photo.png", "events", 2, "bbb");
    expect(first).not.toBe(second);
  });
});
