/**
 * Branch member helpers shared by the admin area and the branch portal.
 *
 * Two different rows describe a branch member:
 *   * `branch_members`        — a person linked to a branch. `user_id` is set once
 *                               they sign up (AuthPage links them by email), and
 *                               stays null for members added by an admin before
 *                               they have an account.
 *   * `membership_requests`   — someone who asked to join. `status = 'approved'`
 *                               makes them a member; they are linked to a real
 *                               account automatically the first time they sign up
 *                               with that email.
 *
 * Keep this module free of Supabase calls so the filtering and naming rules can
 * be unit tested.
 */

/** Minimal shape of a `profiles` row used for display. */
export interface ProfileLookup {
  [userId: string]: { display_name?: string | null; avatar_url?: string | null } | undefined;
}

export interface RosterMember {
  /** Stable React key; two sources can never collide. */
  key: string;
  /** Which table this member came from. */
  source: "account" | "request";
  id: string;
  branchId: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  joinedAt: string | null;
  avatarUrl: string | null;
  userId: string | null;
  /** True when the member has no account yet (approved request, never signed up). */
  awaitingSignUp: boolean;
}

type AnyRow = Record<string, any> | null | undefined;

/**
 * Display name for a member row, falling back through the details we actually
 * have: an explicit name, then their profile, then their email, then a label.
 */
export const memberDisplayName = (row: AnyRow, profile?: ProfileLookup[string]): string => {
  const explicit = typeof row?.full_name === "string" ? row.full_name.trim() : "";
  if (explicit) return explicit;
  const profileName = typeof profile?.display_name === "string" ? profile.display_name.trim() : "";
  if (profileName) return profileName;
  const email = typeof row?.email === "string" ? row.email.trim() : "";
  if (email) return email.split("@")[0];
  return "Unnamed member";
};

/** Map `profiles` rows by user_id so members can be joined without a DB embed. */
export const profilesByUserId = (profiles: AnyRow[] | null | undefined): ProfileLookup => {
  const map: ProfileLookup = {};
  (profiles || []).forEach((p) => {
    if (p?.user_id) map[p.user_id] = { display_name: p.display_name, avatar_url: p.avatar_url };
  });
  return map;
};

/**
 * A row is in scope only when it belongs to one of the managed branches. An
 * empty list therefore manages nothing — callers that manage every branch pass
 * the full id list explicitly.
 */
const inScope = (branchIds: string[], branchId: string): boolean =>
  !!branchIds && branchIds.includes(branchId);

const timeOf = (value: unknown): number => {
  const t = value ? new Date(value as string).getTime() : 0;
  return Number.isNaN(t) ? 0 : t;
};

/** Join requests still waiting for a decision, newest first. */
export const pendingJoinRequests = (requests: AnyRow[], branchIds: string[]): AnyRow[] =>
  (requests || [])
    .filter((r) => r && inScope(branchIds, r.branch_id) && (r.status || "pending") === "pending")
    .sort((a, b) => timeOf(b.created_at) - timeOf(a.created_at));

/**
 * Every member of the given branches: signed-up members from `branch_members`
 * plus approved join requests that have not been linked to an account yet.
 * Rows belonging to any other branch are dropped.
 */
export const buildMemberRoster = (
  branchMembers: AnyRow[],
  requests: AnyRow[],
  branchIds: string[],
  profiles: ProfileLookup = {},
): RosterMember[] => {
  const accounts: RosterMember[] = (branchMembers || [])
    .filter((row) => row?.id && inScope(branchIds, row.branch_id))
    .map((row) => {
      const profile = row.user_id ? profiles[row.user_id] : undefined;
      return {
        key: `account:${row.id}`,
        source: "account" as const,
        id: row.id,
        branchId: row.branch_id,
        name: memberDisplayName(row, profile),
        email: row.email ?? null,
        phone: row.phone ?? null,
        role: row.role || "member",
        joinedAt: row.joined_at ?? row.created_at ?? null,
        avatarUrl: row.avatar_url ?? profile?.avatar_url ?? null,
        userId: row.user_id ?? null,
        awaitingSignUp: !row.user_id,
      };
    });

  const approved: RosterMember[] = (requests || [])
    .filter((row) => row?.id && inScope(branchIds, row.branch_id) && row.status === "approved")
    .map((row) => ({
      key: `request:${row.id}`,
      source: "request" as const,
      id: row.id,
      branchId: row.branch_id,
      name: memberDisplayName(row),
      email: row.email ?? null,
      phone: row.phone ?? null,
      role: "member",
      joinedAt: row.created_at ?? null,
      avatarUrl: null,
      userId: null,
      awaitingSignUp: true,
    }));

  return [...accounts, ...approved].sort((a, b) => timeOf(b.joinedAt) - timeOf(a.joinedAt));
};

export const roleLabel = (role: string): string =>
  role === "branch_admin" ? "Branch Admin" : role === "leader" ? "Leader" : "Member";

/** Name of the branch a row belongs to, for lists that span several branches. */
export const branchNameFor = (
  branches: { id: string; name?: string | null }[] | undefined,
  branchId: string,
): string => branches?.find((b) => b.id === branchId)?.name || "Branch";
