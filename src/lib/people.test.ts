import { describe, expect, it } from "vitest";
import { findPersonByName, nameTokens, samePersonName } from "./people";

describe("nameTokens", () => {
  it("lowercases and strips accents and punctuation", () => {
    expect(nameTokens("  Christophe  Mubira-Sadiki ")).toEqual(["christophe", "mubira", "sadiki"]);
    expect(nameTokens("André N'Doye")).toEqual(["andre", "n", "doye"]);
  });

  it("returns an empty list for a missing name", () => {
    expect(nameTokens(null)).toEqual([]);
    expect(nameTokens(undefined)).toEqual([]);
  });
});

describe("samePersonName", () => {
  it("ignores the order of the names", () => {
    expect(samePersonName("Christophe Mubira Sadiki", "Christophe Sadiki Mubira")).toBe(true);
  });

  it("matches when one name adds a further name", () => {
    expect(samePersonName("Lwenga Rajabu Reagan", "Lwenga Rajabu")).toBe(true);
    expect(samePersonName("Fabrice Muhindo", "Fabrice Muhindo")).toBe(true);
  });

  it("treats a shortened first name as the same person", () => {
    expect(samePersonName("Chris Sadiki", "Christophe Sadiki Mubira")).toBe(true);
  });

  it("does not match different people", () => {
    expect(samePersonName("Fabrice Muhindo", "Lwenga Rajabu")).toBe(false);
    expect(samePersonName("Danny Mani", "Dieudonne Sangano")).toBe(false);
  });

  it("refuses to guess from a single name", () => {
    expect(samePersonName("Chris", "Christophe Sadiki Mubira")).toBe(false);
    expect(samePersonName("", "")).toBe(false);
  });

  it("does not match on short fragments", () => {
    expect(samePersonName("Fab Meekboy", "Fabrice Muhindo")).toBe(false);
  });
});

describe("findPersonByName", () => {
  const founders = [
    { name: "Christophe Sadiki Mubira", avatar_url: "christophe.jpg" },
    { name: "Fabrice Muhindo", avatar_url: "fabrice.jpg" },
  ];

  it("returns the entry for the same person", () => {
    expect(findPersonByName("Christophe Mubira Sadiki", founders)?.avatar_url).toBe("christophe.jpg");
  });

  it("returns undefined when nobody matches", () => {
    expect(findPersonByName("Lwenga Rajabu Reagan", founders)).toBeUndefined();
    expect(findPersonByName(null, founders)).toBeUndefined();
  });
});
