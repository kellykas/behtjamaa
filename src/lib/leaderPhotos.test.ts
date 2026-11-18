import { describe, expect, it } from "vitest";
import { leaderPhotoTargets } from "@/lib/leaderPhotos";

const members = [
  { id: "m1", name: "Christophe Mubira Sadiki" },
  { id: "m2", name: "Rajab Barowani" },
  { id: "m3", name: "Fabrice Muhindo" },
];

const founders = [
  { id: "f1", name: "Christophe Sadiki Mubira" },
  { id: "f2", name: "Dieudonne Sangano" },
  { id: "f3", name: "Fabrice Muhindo" },
  { id: "f4", name: "Lwenga Rajabu Reagan" },
];

describe("leaderPhotoTargets", () => {
  it("finds the same person in both tables, despite the word order", () => {
    expect(leaderPhotoTargets("Christophe Mubira Sadiki", { members, founders })).toEqual([
      { table: "team_members", id: "m1" },
      { table: "team_founders", id: "f1" },
    ]);
  });

  it("matches a founder whose name carries an extra word", () => {
    expect(leaderPhotoTargets("Rajab Barowani", { members, founders })).toEqual([
      { table: "team_members", id: "m2" },
    ]);
    expect(leaderPhotoTargets("Lwenga Rajabu", { members, founders })).toEqual([
      { table: "team_founders", id: "f4" },
    ]);
  });

  it("writes both rows when the name matches on each side", () => {
    expect(leaderPhotoTargets("Fabrice Muhindo", { members, founders })).toEqual([
      { table: "team_members", id: "m3" },
      { table: "team_founders", id: "f3" },
    ]);
  });

  it("never pairs two different people", () => {
    expect(leaderPhotoTargets("Dieudonne Sangano", { members, founders })).toEqual([
      { table: "team_founders", id: "f2" },
    ]);
  });

  it("returns nothing for a missing name or an unknown person", () => {
    expect(leaderPhotoTargets(null, { members, founders })).toEqual([]);
    expect(leaderPhotoTargets("Someone Else", { members, founders })).toEqual([]);
  });
});
