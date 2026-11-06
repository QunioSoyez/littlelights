import data from "./lathbury.json";

// Story content from Mary A. Lathbury's "Child's Story of the Bible" (1898, public domain).
// Regenerate lathbury.json with: python scripts/import-lathbury.py ../sources/lathbury/25309-h

export type StoryBlock =
  | { type: "text"; text: string }
  | { type: "image"; image: string; caption: string; width: number; height: number };

export type Story = {
  id: string; // e.g. "ot-01", "nt-12"
  testament: "ot" | "nt";
  number: number; // chapter number within its testament
  title: string;
  thumbnail: string | null; // first picture in the story
  blocks: StoryBlock[];
};

export const stories = data.stories as Story[];
export const storySource = data.source;

export const testamentNames = { ot: "Old Testament", nt: "New Testament" } as const;

export function getStory(id: string): Story | undefined {
  return stories.find((s) => s.id === id);
}

// The stories before and after this one (crosses from Old to New Testament)
export function getNeighbors(id: string): { prev?: Story; next?: Story } {
  const i = stories.findIndex((s) => s.id === id);
  return { prev: stories[i - 1], next: stories[i + 1] };
}
