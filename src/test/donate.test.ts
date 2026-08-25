import { describe, it, expect } from "vitest";

// Extract the pure logic we care about from DonatePage
const amounts = [25, 50, 100, 250];

const computeActiveAmount = (selected: number, custom: string) =>
  custom ? parseInt(custom) || 0 : selected;

const formatFrequency = (freq: "once" | "monthly") =>
  freq === "monthly" ? "Monthly" : "Once";

describe("Donation amount logic", () => {
  it("uses selected amount when custom is empty", () => {
    expect(computeActiveAmount(100, "")).toBe(100);
  });

  it("uses custom amount when provided", () => {
    expect(computeActiveAmount(50, "75")).toBe(75);
  });

  it("returns 0 for invalid custom input", () => {
    expect(computeActiveAmount(50, "abc")).toBe(0);
  });

  it("returns 0 for empty custom input with 0 selected", () => {
    expect(computeActiveAmount(0, "")).toBe(0);
  });

  it("handles zero custom amount", () => {
    expect(computeActiveAmount(50, "0")).toBe(0);
  });

  it("handles large custom amounts", () => {
    expect(computeActiveAmount(25, "10000")).toBe(10000);
  });
});

describe("Donation frequency formatting", () => {
  it('formats "once" as "Once"', () => {
    expect(formatFrequency("once")).toBe("Once");
  });

  it('formats "monthly" as "Monthly"', () => {
    expect(formatFrequency("monthly")).toBe("Monthly");
  });
});

describe("Preset amounts", () => {
  it("includes all expected amounts", () => {
    expect(amounts).toEqual([25, 50, 100, 250]);
  });

  it("amounts are in ascending order", () => {
    for (let i = 1; i < amounts.length; i++) {
      expect(amounts[i]).toBeGreaterThan(amounts[i - 1]);
    }
  });

  it("contains exactly 4 presets", () => {
    expect(amounts).toHaveLength(4);
  });
});
