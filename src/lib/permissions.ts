/**
 * Canonical list of what a Branch Admin can be granted.
 *
 * A Super Admin picks any subset of these when creating a Branch Admin sign-on.
 * The same keys are enforced server-side by the RLS policies in
 * `supabase/migrations/20260829090000_branch_admins.sql`, so the UI and the
 * database always agree on what a permission means.
 */
export type PermissionKey =
  | "content"
  | "team"
  | "services"
  | "events"
  | "branches"
  | "members"
  | "prayers"
  | "giving"
  | "store";

export interface PermissionDef {
  key: PermissionKey;
  label: string;
  description: string;
  /** Branch-scoped permissions only apply to the branches the admin is assigned. */
  branchScoped: boolean;
}

export const PERMISSIONS: PermissionDef[] = [
  {
    key: "content",
    label: "Page content & site settings",
    description: "Home, about, contact, donate, footer and appearance text.",
    branchScoped: false,
  },
  {
    key: "team",
    label: "Team members",
    description: "Add and edit the leadership team shown on the site.",
    branchScoped: false,
  },
  {
    key: "services",
    label: "Ministry services",
    description: "Add and edit ministry service areas.",
    branchScoped: false,
  },
  {
    key: "events",
    label: "Events, podcasts & streams",
    description: "Manage events, podcast episodes and live streams.",
    branchScoped: false,
  },
  {
    key: "prayers",
    label: "Prayer requests",
    description: "View and respond to prayer requests.",
    branchScoped: false,
  },
  {
    key: "branches",
    label: "Branch details",
    description: "Edit the profile of the branches they manage.",
    branchScoped: true,
  },
  {
    key: "members",
    label: "Members & requests",
    description: "View and manage members and join requests.",
    branchScoped: true,
  },
  {
    key: "giving",
    label: "Donations & orders",
    description: "View donations and store orders.",
    branchScoped: true,
  },
  {
    key: "store",
    label: "Store items",
    description: "Manage store products.",
    branchScoped: true,
  },
];

export const PERMISSION_KEYS: PermissionKey[] = PERMISSIONS.map((p) => p.key);

export const permissionLabel = (key: string): string =>
  PERMISSIONS.find((p) => p.key === key)?.label ?? key;
