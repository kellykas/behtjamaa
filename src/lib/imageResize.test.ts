import { describe, expect, it } from "vitest";
import { fitWithin, GALLERY_MAX_DIMENSION } from "./imageResize";

describe("fitWithin", () => {
  it("leaves a picture that already fits alone", () => {
    expect(fitWithin(1200, 800, 1600)).toEqual({ width: 1200, height: 800 });
  });

  it("scales a landscape phone photo down to the longest side", () => {
    expect(fitWithin(4032, 3024, GALLERY_MAX_DIMENSION)).toEqual({ width: 1600, height: 1200 });
  });

  it("scales a portrait photo by its height", () => {
    expect(fitWithin(3024, 4032, 1600)).toEqual({ width: 1200, height: 1600 });
  });

  it("keeps the picture's shape", () => {
    const size = fitWithin(4032, 3024, 1000);
    expect(size.width / size.height).toBeCloseTo(4 / 3, 3);
  });

  it("returns nothing for unusable input instead of NaN", () => {
    expect(fitWithin(0, 900, 1600)).toEqual({ width: 0, height: 0 });
    expect(fitWithin(900, 900, 0)).toEqual({ width: 0, height: 0 });
  });
});
