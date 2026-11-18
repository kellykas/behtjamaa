import { describe, expect, it } from "vitest";
import { centredOffset, cropGeometry, cropSourceRect, MAX_ZOOM } from "./imageCrop";

describe("cropGeometry", () => {
  it("scales a landscape picture to cover the square", () => {
    const geometry = cropGeometry({
      imageWidth: 1600,
      imageHeight: 900,
      stage: 300,
      zoom: 1,
      offset: { x: 0, y: 0 },
    });

    // Cover is driven by the shorter side, so height matches the stage.
    expect(geometry.height).toBeCloseTo(300);
    expect(geometry.width).toBeCloseTo(533.33, 1);
    expect(geometry.x).toBe(0);
    expect(geometry.y).toBe(0);
  });

  it("keeps a portrait picture inside the square too", () => {
    const geometry = cropGeometry({
      imageWidth: 900,
      imageHeight: 1600,
      stage: 300,
      zoom: 1,
      offset: { x: 0, y: 0 },
    });

    expect(geometry.width).toBeCloseTo(300);
    expect(geometry.height).toBeCloseTo(533.33, 1);
  });

  it("clamps the offset so no gap appears inside the square", () => {
    const geometry = cropGeometry({
      imageWidth: 1600,
      imageHeight: 900,
      stage: 300,
      zoom: 1,
      offset: { x: 500, y: 500 },
    });

    // A picture already touching the top and left edges cannot move further.
    expect(geometry.x).toBe(0);
    expect(geometry.y).toBe(0);

    const pulled = cropGeometry({
      imageWidth: 1600,
      imageHeight: 900,
      stage: 300,
      zoom: 2,
      offset: { x: -5000, y: -5000 },
    });
    expect(pulled.x).toBeCloseTo(300 - 1066.67, 1);
    expect(pulled.y).toBeCloseTo(300 - 600, 1);
  });

  it("scales proportionally with zoom and stops at the maximum", () => {
    const base = cropGeometry({ imageWidth: 1600, imageHeight: 900, stage: 300, zoom: 1, offset: { x: 0, y: 0 } });
    const zoomed = cropGeometry({ imageWidth: 1600, imageHeight: 900, stage: 300, zoom: 2, offset: { x: 0, y: 0 } });
    const beyond = cropGeometry({ imageWidth: 1600, imageHeight: 900, stage: 300, zoom: 99, offset: { x: 0, y: 0 } });

    expect(zoomed.width).toBeCloseTo(base.width * 2);
    expect(beyond.width).toBeCloseTo(base.width * MAX_ZOOM);
  });

  it("returns an empty geometry for unusable input instead of NaN", () => {
    expect(cropGeometry({ imageWidth: 0, imageHeight: 0, stage: 300, zoom: 1, offset: { x: 0, y: 0 } })).toEqual({
      scale: 1,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
    });
  });
});

describe("centredOffset", () => {
  it("centres the visible square on the picture", () => {
    const offset = centredOffset({ imageWidth: 1600, imageHeight: 900, stage: 300, zoom: 1 });

    expect(offset.x).toBeCloseTo(-116.67, 1);
    expect(offset.y).toBe(0);
  });
});

describe("cropSourceRect", () => {
  it("describes the square that the card will show", () => {
    const input = { imageWidth: 1600, imageHeight: 900, stage: 300, zoom: 1 };
    const source = cropSourceRect({ ...input, offset: centredOffset(input) });

    // A 900x900 square taken from the middle of a 1600x900 photo.
    expect(source.width).toBeCloseTo(900);
    expect(source.height).toBeCloseTo(900);
    expect(source.x).toBeCloseTo(350);
    expect(source.y).toBeCloseTo(0);
  });

  it("takes a smaller square from the picture when zoomed in", () => {
    const input = { imageWidth: 1600, imageHeight: 900, stage: 300, zoom: 2 };
    const source = cropSourceRect({ ...input, offset: centredOffset(input) });

    expect(source.width).toBeCloseTo(450);
    expect(source.height).toBeCloseTo(450);
  });
});

describe("wide frames", () => {
  // 320x180 is the 16:9 frame the banner and card fields use.
  const frame = { stage: 320, stageHeight: 180 };

  it("covers the frame instead of a square", () => {
    const geometry = cropGeometry({ imageWidth: 1600, imageHeight: 900, ...frame, zoom: 1, offset: { x: 0, y: 0 } });

    // The photo is already 16:9, so it fills the frame exactly.
    expect(geometry.width).toBeCloseTo(320);
    expect(geometry.height).toBeCloseTo(180);
  });

  it("clamps the offset against the frame's height, not its width", () => {
    const geometry = cropGeometry({ imageWidth: 900, imageHeight: 1600, ...frame, zoom: 1, offset: { x: -5000, y: -5000 } });

    // A portrait photo is scaled until its width covers 320px.
    expect(geometry.width).toBeCloseTo(320);
    expect(geometry.height).toBeCloseTo(568.89, 1);
    expect(geometry.x).toBeCloseTo(0);
    expect(geometry.y).toBeCloseTo(180 - 568.89, 1);
  });

  it("takes a 16:9 area from the picture for the saved file", () => {
    const input = { imageWidth: 1600, imageHeight: 1200, ...frame, zoom: 1 };
    const source = cropSourceRect({ ...input, offset: centredOffset(input) });

    // Scaled to cover the width, so a 900px tall strip is kept and centred.
    expect(source.width / source.height).toBeCloseTo(16 / 9, 3);
    expect(source.width).toBeCloseTo(1600);
    expect(source.height).toBeCloseTo(900);
    expect(source.y).toBeCloseTo(150);
  });
});
