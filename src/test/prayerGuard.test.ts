import { describe, it, expect, beforeEach } from "vitest";

// Replicate the localStorage guard logic used in PrayerPage
const STORAGE_KEY = "prayed_request_ids";

const getPrayedIds = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const addPrayedId = (id: string): string[] => {
  const current = getPrayedIds();
  const updated = [...current, id];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

const hasPrayed = (id: string): boolean => getPrayedIds().includes(id);

describe("Prayer localStorage guard", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty array when no prayers recorded", () => {
    expect(getPrayedIds()).toEqual([]);
  });

  it("hasPrayed returns false for unknown id", () => {
    expect(hasPrayed("some-uuid")).toBe(false);
  });

  it("addPrayedId stores the id", () => {
    addPrayedId("prayer-1");
    expect(hasPrayed("prayer-1")).toBe(true);
  });

  it("addPrayedId returns updated list", () => {
    const result = addPrayedId("prayer-1");
    expect(result).toEqual(["prayer-1"]);
  });

  it("accumulates multiple prayed ids", () => {
    addPrayedId("a");
    addPrayedId("b");
    addPrayedId("c");
    expect(getPrayedIds()).toEqual(["a", "b", "c"]);
  });

  it("detects duplicate prayers", () => {
    addPrayedId("x");
    addPrayedId("y");
    expect(hasPrayed("x")).toBe(true);
    expect(hasPrayed("y")).toBe(true);
    expect(hasPrayed("z")).toBe(false);
  });

  it("handles corrupt localStorage gracefully", () => {
    localStorage.setItem(STORAGE_KEY, "not-json");
    expect(getPrayedIds()).toEqual([]);
  });

  it("handles missing localStorage key", () => {
    expect(getPrayedIds()).toEqual([]);
    expect(hasPrayed("any")).toBe(false);
  });
});
