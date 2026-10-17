import { describe, expect, it } from "vitest";
import { groupBranches, type GroupableBranch } from "@/lib/branchGrouping";

const branch = (over: Partial<GroupableBranch> & { id: string; name: string }): GroupableBranch => ({
  slug: over.name.toLowerCase().replace(/\s+/g, "-"),
  is_state_branch: false,
  parent_id: null,
  ...over,
});

const usa = branch({ id: "usa", name: "BEHT USA", is_state_branch: true });
const louisville = branch({ id: "lou", name: "Louisville", parent_id: "usa" });
const africa = branch({ id: "africa", name: "BEHT AFRICA", is_state_branch: true });
const canada = branch({ id: "canada", name: "BEHT CANADA" });
const orphan = branch({ id: "orphan", name: "Nairobi", parent_id: "missing" });

describe("groupBranches", () => {
  it("treats BEHT USA as a grouping and hangs Louisville under it", () => {
    const { groupings, chaptersOf, loose } = groupBranches([usa, louisville, africa, canada]);

    expect(groupings.map((g) => g.id)).toEqual(["usa", "africa"]);
    expect(chaptersOf("usa").map((b) => b.id)).toEqual(["lou"]);
    expect(chaptersOf("africa")).toEqual([]);
    expect(loose.map((b) => b.id)).toEqual(["canada"]);
  });

  it("does not list a grouping branch twice when it also owns chapters", () => {
    const { groupings, loose } = groupBranches([usa, louisville]);
    const rendered = [...groupings.map((g) => g.id), ...loose.map((b) => b.id)];

    expect(rendered).toEqual(["usa"]);
    expect(rendered.filter((id) => id === "usa")).toHaveLength(1);
  });

  it("keeps a chapter of a missing parent visible as a standalone branch", () => {
    const { groupings, loose } = groupBranches([usa, orphan]);

    expect(groupings.map((g) => g.id)).toEqual(["usa"]);
    expect(loose.map((b) => b.id)).toEqual(["orphan"]);
  });

  it("falls back to a flat list when nothing is grouped", () => {
    const { groupings, loose } = groupBranches([canada, orphan]);

    expect(groupings).toEqual([]);
    expect(loose.map((b) => b.id)).toEqual(["canada", "orphan"]);
  });
});
