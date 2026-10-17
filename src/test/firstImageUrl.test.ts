import { describe, it, expect } from "vitest";
import { firstImageUrl } from "@/lib/utils";

// branch_events.images is jsonb, so the generated type is Json and a member can
// be a number, boolean, nested array or object. Only string entries are usable
// as an <img> src, and a non-string first entry must not become the cover.
describe("firstImageUrl", () => {
  it("returns the first string entry", () => {
    expect(firstImageUrl(["/a.png", "/b.png"])).toBe("/a.png");
  });

  it("skips a non-string first entry and returns the next string", () => {
    expect(firstImageUrl([42, "/b.png"])).toBe("/b.png");
  });

  it("returns an empty string for an empty array", () => {
    expect(firstImageUrl([])).toBe("");
  });

  it("returns an empty string when no entry is a string", () => {
    expect(firstImageUrl([1, true, { url: "/a.png" }, ["nested"]])).toBe("");
  });

  it("ignores empty-string entries", () => {
    expect(firstImageUrl(["", "/b.png"])).toBe("/b.png");
  });

  it("returns an empty string when the column is not an array", () => {
    expect(firstImageUrl("/a.png")).toBe("");
    expect(firstImageUrl(null)).toBe("");
    expect(firstImageUrl(undefined)).toBe("");
  });
});
