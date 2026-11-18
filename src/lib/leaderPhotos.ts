/**
 * One photo for a leader, wherever their picture is shown.
 *
 * The home "Meet The Team" cards read `team_members` while the About page reads
 * `team_founders`, and the same people are listed in both with slightly
 * different names. Picking a winner between the two rows would show a stale
 * picture whenever the other row was the one edited last, so every save writes
 * the picture to both rows for that person: upload once and every card agrees.
 */
import { supabase } from "@/integrations/supabase/client";
import { samePersonName } from "@/lib/people";

export type LeaderTable = "team_members" | "team_founders";

export interface LeaderRow {
  id: string;
  name: string;
}

export interface LeaderPhotoTarget {
  table: LeaderTable;
  id: string;
}

/**
 * Every row in either leadership list that belongs to `name`, across both
 * tables. Names are matched with `samePersonName`, which is conservative on
 * purpose, so a near-miss never receives someone else's face.
 */
export function leaderPhotoTargets(
  name: string | null | undefined,
  { members, founders }: { members: readonly LeaderRow[]; founders: readonly LeaderRow[] },
): LeaderPhotoTarget[] {
  const rowsFor = (rows: readonly LeaderRow[], table: LeaderTable): LeaderPhotoTarget[] =>
    rows.filter((row) => samePersonName(name, row.name)).map((row) => ({ table, id: row.id }));

  return [...rowsFor(members, "team_members"), ...rowsFor(founders, "team_founders")];
}

/**
 * Store `avatarUrl` (or clear it with `null`) on both rows for the leader named
 * `name`, so setting the picture once updates the home cards and the About page
 * together. Resolves with how many rows were written.
 */
export async function saveLeaderPhoto(
  name: string | null | undefined,
  avatarUrl: string | null,
): Promise<number> {
  const [members, founders] = await Promise.all([
    supabase.from("team_members").select("id, name"),
    supabase.from("team_founders").select("id, name"),
  ]);
  const readError = members.error ?? founders.error;
  if (readError) throw readError;

  const targets = leaderPhotoTargets(name, {
    members: members.data ?? [],
    founders: founders.data ?? [],
  });

  const results = await Promise.all(
    targets.map((target) =>
      target.table === "team_members"
        ? supabase.from("team_members").update({ avatar_url: avatarUrl }).eq("id", target.id)
        : supabase.from("team_founders").update({ avatar_url: avatarUrl }).eq("id", target.id),
    ),
  );
  const saveError = results.find((result) => result.error)?.error;
  if (saveError) throw saveError;

  return targets.length;
}
