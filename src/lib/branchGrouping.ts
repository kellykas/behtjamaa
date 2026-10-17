/**
 * Grouping branches (e.g. "BEHT USA") own local chapters (e.g. "Louisville").
 *
 * Both are rows in `branches`; the grouping row has `is_state_branch = true`
 * and chapters point at it through `parent_id`. This keeps the public branch
 * list and the admin views reading the hierarchy the same way.
 */
export interface GroupableBranch {
  id: string;
  name: string;
  slug: string;
  is_state_branch?: boolean | null;
  parent_id?: string | null;
}

export interface BranchGrouping<T extends GroupableBranch> {
  /** Top-level grouping rows, e.g. BEHT USA. */
  groupings: T[];
  /** Every branch that hangs under a grouping, in the input order. */
  chaptersOf: (groupingId: string) => T[];
  /** Branches that do not belong to any grouping, and are not groupings. */
  loose: T[];
}

export const groupBranches = <T extends GroupableBranch>(branches: T[]): BranchGrouping<T> => {
  const groupings = branches.filter((b) => Boolean(b.is_state_branch) && !b.parent_id);
  const groupingIds = new Set(groupings.map((b) => b.id));

  return {
    groupings,
    chaptersOf: (groupingId) => branches.filter((b) => b.parent_id === groupingId),
    loose: branches.filter((b) => !Boolean(b.is_state_branch) && !groupingIds.has(b.parent_id ?? "")),
  };
};
