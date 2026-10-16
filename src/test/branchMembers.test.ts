import { describe, it, expect } from "vitest";
import {
  branchNameFor,
  buildMemberRoster,
  memberDisplayName,
  pendingJoinRequests,
  profilesByUserId,
  roleLabel,
} from "@/lib/branchMembers";

const BRANCH_A = "branch-a";
const BRANCH_B = "branch-b";

describe("memberDisplayName", () => {
  it("prefers the member's own name", () => {
    expect(memberDisplayName({ full_name: "Grace Mwangi" })).toBe("Grace Mwangi");
  });

  it("falls back to the linked profile name", () => {
    expect(memberDisplayName({ full_name: "  " }, { display_name: "Peter K" })).toBe("Peter K");
  });

  it("falls back to the email local part", () => {
    expect(memberDisplayName({ email: "sam@example.com" })).toBe("sam");
  });

  it("labels rows with no details at all", () => {
    expect(memberDisplayName({})).toBe("Unnamed member");
    expect(memberDisplayName(null)).toBe("Unnamed member");
  });
});

describe("profilesByUserId", () => {
  it("keys profiles by user_id and skips rows without one", () => {
    const map = profilesByUserId([
      { user_id: "u1", display_name: "Ama", avatar_url: "a.png" },
      { user_id: null, display_name: "Ghost" },
    ]);
    expect(map.u1).toEqual({ display_name: "Ama", avatar_url: "a.png" });
    expect(Object.keys(map)).toHaveLength(1);
  });
});

describe("pendingJoinRequests", () => {
  const requests = [
    { id: "r1", branch_id: BRANCH_A, status: "pending", created_at: "2026-01-01T00:00:00Z" },
    { id: "r2", branch_id: BRANCH_A, status: "pending", created_at: "2026-02-01T00:00:00Z" },
    { id: "r3", branch_id: BRANCH_A, status: "approved", created_at: "2026-03-01T00:00:00Z" },
    { id: "r4", branch_id: BRANCH_B, status: "pending", created_at: "2026-04-01T00:00:00Z" },
  ];

  it("keeps only pending requests of the managed branches, newest first", () => {
    expect(pendingJoinRequests(requests, [BRANCH_A]).map((r) => r.id)).toEqual(["r2", "r1"]);
  });

  it("shows nothing when the admin manages no branch", () => {
    expect(pendingJoinRequests(requests, [])).toEqual([]);
  });

  it("treats a missing status as pending", () => {
    expect(pendingJoinRequests([{ id: "x", branch_id: BRANCH_A }], [BRANCH_A]).map((r) => r.id)).toEqual(["x"]);
  });

  it("handles empty input", () => {
    expect(pendingJoinRequests([], [BRANCH_A])).toEqual([]);
    expect(pendingJoinRequests(null as any, [BRANCH_A])).toEqual([]);
  });
});

describe("buildMemberRoster", () => {
  const profiles = profilesByUserId([{ user_id: "u1", display_name: "Ama Boateng", avatar_url: "ama.png" }]);

  it("lists signed-up members and approved requests for the managed branches", () => {
    const roster = buildMemberRoster(
      [
        { id: "m1", branch_id: BRANCH_A, user_id: "u1", role: "leader", joined_at: "2026-02-01T00:00:00Z" },
        { id: "m2", branch_id: BRANCH_B, user_id: "u9", role: "member", joined_at: "2026-03-01T00:00:00Z" },
      ],
      [
        { id: "r1", branch_id: BRANCH_A, full_name: "Grace M", email: "grace@example.com", phone: "555", status: "approved", created_at: "2026-01-01T00:00:00Z" },
        { id: "r2", branch_id: BRANCH_A, full_name: "Waiting W", email: "w@example.com", status: "pending", created_at: "2026-04-01T00:00:00Z" },
      ],
      [BRANCH_A],
      profiles,
    );
    expect(roster.map((m) => m.key)).toEqual(["account:m1", "request:r1"]);
  });

  it("resolves the profile name and avatar of a signed-up member", () => {
    const roster = buildMemberRoster(
      [{ id: "m1", branch_id: BRANCH_A, user_id: "u1", role: "member", joined_at: "2026-02-01T00:00:00Z" }],
      [],
      [BRANCH_A],
      profiles,
    );
    expect(roster[0].name).toBe("Ama Boateng");
    expect(roster[0].avatarUrl).toBe("ama.png");
    expect(roster[0].awaitingSignUp).toBe(false);
  });

  it("flags members added without an account and never marks a request as signed up", () => {
    const roster = buildMemberRoster(
      [{ id: "m1", branch_id: BRANCH_A, user_id: null, role: "member", joined_at: "2026-02-01T00:00:00Z" }],
      [{ id: "r1", branch_id: BRANCH_A, full_name: "Grace M", email: "g@example.com", status: "approved", created_at: "2026-03-01T00:00:00Z" }],
      [BRANCH_A],
      profiles,
    );
    expect(roster.map((m) => m.awaitingSignUp)).toEqual([true, true]);
    // Newest first: the approved request (March) comes before the roster row (February).
    expect(roster.map((m) => m.source)).toEqual(["request", "account"]);
    expect(roster[0].email).toBe("g@example.com");
    expect(roster[1].key).toBe("account:m1");
  });

  it("shows someone who signed up after approval once, not twice", () => {
    // The exact state after AuthPage links an approved request to a new account:
    // an approved request plus the branch_members row that points at the account.
    const roster = buildMemberRoster(
      [{ id: "m1", branch_id: BRANCH_A, user_id: "u1", role: "member", joined_at: "2026-02-01T00:00:00Z" }],
      [
        {
          id: "r1",
          branch_id: BRANCH_A,
          full_name: "Grace M",
          email: "grace@example.com",
          phone: "555-0100",
          status: "approved",
          linked_user_id: "u1",
          created_at: "2026-01-01T00:00:00Z",
        },
      ],
      [BRANCH_A],
      profiles,
    );

    expect(roster).toHaveLength(1);
    expect(roster[0].key).toBe("account:m1");
    expect(roster[0].source).toBe("account");
    expect(roster[0].awaitingSignUp).toBe(false);
    // The account row keeps the role, so the role controls still apply to them.
    expect(roster[0].role).toBe("member");
    expect(roster[0].userId).toBe("u1");
  });

  it("keeps the details the request was approved with", () => {
    const roster = buildMemberRoster(
      [{ id: "m1", branch_id: BRANCH_A, user_id: "u2", role: "leader", joined_at: "2026-02-01T00:00:00Z" }],
      [
        {
          id: "r1",
          branch_id: BRANCH_A,
          full_name: "Grace M",
          email: "grace@example.com",
          phone: "555-0100",
          status: "approved",
          linked_user_id: "u2",
          created_at: "2026-01-01T00:00:00Z",
        },
      ],
      [BRANCH_A],
      profiles,
    );

    expect(roster).toHaveLength(1);
    expect(roster[0].name).toBe("Grace M");
    expect(roster[0].email).toBe("grace@example.com");
    expect(roster[0].phone).toBe("555-0100");
    // The membership itself still wins where it has its own answers.
    expect(roster[0].role).toBe("leader");
    expect(roster[0].joinedAt).toBe("2026-02-01T00:00:00Z");
  });

  it("folds several approved requests that all point at the same account", () => {
    // An admin added them and they also asked to join: two approved requests,
    // one sign-up. Both describe the person already listed as a member.
    const roster = buildMemberRoster(
      [{ id: "m1", branch_id: BRANCH_A, user_id: "u1", role: "member", joined_at: "2026-02-01T00:00:00Z" }],
      [
        { id: "r1", branch_id: BRANCH_A, full_name: "Grace M", email: "grace@example.com", phone: "555-0100", status: "approved", linked_user_id: "u1", created_at: "2026-01-01T00:00:00Z" },
        { id: "r2", branch_id: BRANCH_A, full_name: "Grace Mwangi", email: "grace@example.com", status: "approved", linked_user_id: "u1", created_at: "2026-01-05T00:00:00Z" },
      ],
      [BRANCH_A],
      profiles,
    );

    expect(roster).toHaveLength(1);
    expect(roster[0].key).toBe("account:m1");
    expect(roster[0].email).toBe("grace@example.com");
  });

  it("does not fold a request that was approved for another branch", () => {
    const roster = buildMemberRoster(
      [{ id: "m1", branch_id: BRANCH_A, user_id: "u1", role: "member", joined_at: "2026-02-01T00:00:00Z" }],
      [
        {
          id: "r1",
          branch_id: BRANCH_B,
          full_name: "Grace M",
          email: "grace@example.com",
          status: "approved",
          linked_user_id: "u1",
          created_at: "2026-01-01T00:00:00Z",
        },
      ],
      [BRANCH_A, BRANCH_B],
      profiles,
    );

    expect(roster.map((m) => m.key)).toEqual(["account:m1", "request:r1"]);
    expect(roster.map((m) => m.branchId)).toEqual([BRANCH_A, BRANCH_B]);
  });

  it("still lists a linked request whose membership row is gone", () => {
    const roster = buildMemberRoster(
      [],
      [
        {
          id: "r1",
          branch_id: BRANCH_A,
          full_name: "Grace M",
          email: "grace@example.com",
          status: "approved",
          linked_user_id: "u1",
          created_at: "2026-01-01T00:00:00Z",
        },
      ],
      [BRANCH_A],
      profiles,
    );

    expect(roster).toHaveLength(1);
    expect(roster[0].source).toBe("request");
    // They do have an account, so they are not waiting to sign up.
    expect(roster[0].awaitingSignUp).toBe(false);
  });

  it("folds each linked request into its own branch's member row", () => {
    const roster = buildMemberRoster(
      [
        { id: "m1", branch_id: BRANCH_A, user_id: "u1", role: "member", joined_at: "2026-02-01T00:00:00Z" },
        { id: "m2", branch_id: BRANCH_B, user_id: "u1", role: "member", joined_at: "2026-03-01T00:00:00Z" },
      ],
      [
        { id: "r1", branch_id: BRANCH_A, full_name: "Grace M", email: "grace@example.com", status: "approved", linked_user_id: "u1", created_at: "2026-01-01T00:00:00Z" },
        { id: "r2", branch_id: BRANCH_B, full_name: "Grace M", email: "grace2@example.com", status: "approved", linked_user_id: "u1", created_at: "2026-01-02T00:00:00Z" },
      ],
      [BRANCH_A, BRANCH_B],
      profiles,
    );

    expect(roster.map((m) => m.key)).toEqual(["account:m2", "account:m1"]);
    expect(roster.map((m) => m.email)).toEqual(["grace2@example.com", "grace@example.com"]);
  });

  it("ignores rejected requests and members of other branches", () => {
    const roster = buildMemberRoster(
      [{ id: "m2", branch_id: BRANCH_B, user_id: null, role: "member", joined_at: "2026-02-01T00:00:00Z" }],
      [{ id: "r1", branch_id: BRANCH_B, full_name: "Nope", email: "n@example.com", status: "rejected", created_at: "2026-01-01T00:00:00Z" }],
      [BRANCH_A],
      profiles,
    );
    expect(roster).toEqual([]);
  });

  it("includes members of every requested branch and handles empty input", () => {
    const roster = buildMemberRoster(
      [{ id: "m1", branch_id: BRANCH_B, user_id: null, role: "member", joined_at: "2026-02-01T00:00:00Z" }],
      [],
      [BRANCH_A, BRANCH_B],
      profiles,
    );
    expect(roster).toHaveLength(1);
    expect(buildMemberRoster([], [], [BRANCH_A], profiles)).toEqual([]);
    expect(buildMemberRoster([{ id: "m1", branch_id: BRANCH_A }], [], [], profiles)).toEqual([]);
  });
});

describe("labels", () => {
  it("renders role and branch labels", () => {
    expect(roleLabel("branch_admin")).toBe("Branch Admin");
    expect(roleLabel("leader")).toBe("Leader");
    expect(roleLabel("member")).toBe("Member");
    expect(roleLabel("something-else")).toBe("Member");
    expect(branchNameFor([{ id: BRANCH_A, name: "BEHT Canada" }], BRANCH_A)).toBe("BEHT Canada");
    expect(branchNameFor([{ id: BRANCH_A, name: "BEHT Canada" }], "other")).toBe("Branch");
    expect(branchNameFor(undefined, BRANCH_A)).toBe("Branch");
  });
});
