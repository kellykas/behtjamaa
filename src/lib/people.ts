/**
 * Matching the same person across the two leadership tables.
 *
 * The home "Meet The Team" cards read `team_members` while the About page reads
 * `team_founders`, and the same people are edited in both lists with slightly
 * different spellings ("Christophe Mubira Sadiki" vs "Christophe Sadiki
 * Mubira", "Lwenga Rajabu Reagan" vs "Lwenga Rajabu"). A photo uploaded on one
 * page therefore has no id to join on when the other page looks for it, so the
 * names themselves are the only link. Matching is deliberately conservative:
 * a wrong photo on a leader's card is worse than no photo.
 */

/** Lowercase words of a name, without accents or punctuation. */
export const nameTokens = (name: string | null | undefined): string[] =>
  (name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

/** True when two words are the same name, allowing a nickname like Chris/Christophe. */
const sameToken = (a: string, b: string): boolean => {
  if (a === b) return true;
  // Short fragments ("fab", "de") are too ambiguous to treat as the same name.
  return a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a));
};

/**
 * Whether two names describe the same person.
 *
 * Both names need at least two words, and every word of the shorter name must
 * appear in the longer one. So "Lwenga Rajabu" matches "Lwenga Rajabu Reagan",
 * while "Christophe Sadiki" does not match "Dieudonne Sangano".
 */
export const samePersonName = (a: string | null | undefined, b: string | null | undefined): boolean => {
  const left = nameTokens(a);
  const right = nameTokens(b);
  if (left.length < 2 || right.length < 2) return false;

  const [shorter, longer] = left.length <= right.length ? [left, right] : [right, left];
  return shorter.every((token) => longer.some((other) => sameToken(token, other)));
};

/**
 * The first entry in `people` whose name belongs to `name`, or `undefined`.
 * Used to borrow a photo from the About founders for a home team card.
 */
export const findPersonByName = <T extends { name: string }>(
  name: string | null | undefined,
  people: readonly T[],
): T | undefined => people.find((person) => samePersonName(name, person.name));
