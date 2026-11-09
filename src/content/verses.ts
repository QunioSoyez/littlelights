import data from "./verses.json";

// Memory Verse Scramble content lives in verses.json (World English Bible, public domain).
// Easy verses are scrambled word by word; harder verses phrase by phrase (split at " / ").
export type Verse = {
  id: string;
  level: "easy" | "harder";
  ref: string; // e.g. "1 John 4:8"
  pieces: string[]; // in the right order
  text: string; // the whole verse, for reading aloud and the "You did it!" card
};

export const verses: Verse[] = data.verses.map((v) => {
  const level = v.level === "harder" ? "harder" : "easy";
  const pieces = (level === "harder" ? v.text.split(" / ") : v.text.replace(/ \/ /g, " ").split(" "))
    .map((p) => p.trim())
    .filter(Boolean);
  return { id: v.id, level, ref: v.ref, pieces, text: pieces.join(" ") };
});

export function getVerse(id: string): Verse | undefined {
  return verses.find((v) => v.id === id);
}
