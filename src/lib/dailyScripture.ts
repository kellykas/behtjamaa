export type DailyVerse = { text: string; ref: string };

export const dailyVerses: DailyVerse[] = [
  { text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.", ref: "Jeremiah 29:11" },
  { text: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.", ref: "Proverbs 3:5-6" },
  { text: "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.", ref: "Isaiah 41:10" },
  { text: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters.", ref: "Psalm 23:1-2" },
  { text: "I can do all things through him who strengthens me.", ref: "Philippians 4:13" },
  { text: "Come to me, all who labor and are heavy laden, and I will give you rest.", ref: "Matthew 11:28" },
  { text: "But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles.", ref: "Isaiah 40:31" },
  { text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose.", ref: "Romans 8:28" },
  { text: "Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.", ref: "Joshua 1:9" },
  { text: "The Lord is my light and my salvation; whom shall I fear? The Lord is the stronghold of my life; of whom shall I be afraid?", ref: "Psalm 27:1" },
];

/**
 * Returns the scripture verse for the given day, rotating through the
 * curated list so each calendar day shows a different verse.
 */
export const getDailyVerse = (date: Date = new Date()): DailyVerse => {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return dailyVerses[dayOfYear % dailyVerses.length];
};
