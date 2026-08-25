import { describe, it, expect } from "vitest";
import { getDailyVerse, dailyVerses } from "@/lib/dailyScripture";

describe("getDailyVerse", () => {
  it("returns a valid verse object with text and ref", () => {
    const verse = getDailyVerse();
    expect(verse).toHaveProperty("text");
    expect(verse).toHaveProperty("ref");
    expect(typeof verse.text).toBe("string");
    expect(typeof verse.ref).toBe("string");
    expect(verse.text.length).toBeGreaterThan(0);
    expect(verse.ref.length).toBeGreaterThan(0);
  });

  it("returns a verse from the dailyVerses array", () => {
    const verse = getDailyVerse();
    const found = dailyVerses.some(
      (v) => v.text === verse.text && v.ref === verse.ref,
    );
    expect(found).toBe(true);
  });

  it("is deterministic -- same date always yields the same verse", () => {
    const fixed = new Date(2025, 5, 15); // June 15, 2025
    const first = getDailyVerse(fixed);
    const second = getDailyVerse(fixed);
    expect(first).toEqual(second);
  });

  it("returns different verses on consecutive days (within the cycle)", () => {
    // With 10 verses, day N and day N+1 should differ unless we're at
    // a boundary that wraps to the same index (only possible every 10 days).
    const day1 = new Date(2025, 0, 1);
    const day2 = new Date(2025, 0, 2);
    const v1 = getDailyVerse(day1);
    const v2 = getDailyVerse(day2);
    // On any two consecutive days the verses must be different
    // (10 verses means the same verse only repeats every 10 days)
    expect(v1.ref).not.toBe(v2.ref);
  });

  it("wraps around correctly after cycling through all verses", () => {
    // Day 0 and day (dailyVerses.length) should return the same verse
    const base = new Date(2025, 0, 1);
    const wrapDay = new Date(2025, 0, 1 + dailyVerses.length);
    expect(getDailyVerse(base)).toEqual(getDailyVerse(wrapDay));
  });

  it("works for different years", () => {
    const v2024 = getDailyVerse(new Date(2024, 0, 1));
    const v2025 = getDailyVerse(new Date(2025, 0, 1));
    // Jan 1 in different years should return different verses
    // (day-of-year is 1 for both, but years differ in leap-year calc)
    // Actually day-of-year is 1 for both non-leap Jan 1, so same verse
    expect(v2024).toEqual(v2025);
  });
});
