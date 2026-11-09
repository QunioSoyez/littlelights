import data from "./prayers.json";
import type { PulsoIconName } from "./pulsoIcons";

// Family Prayer content lives in prayers.json (easy to edit).
export type Prayer = { title: string; lines: string[] };
export type PrayerTopic = {
  id: string;
  title: string;
  icon: PulsoIconName; // white animated icon on the tile (see pulsoIcons.ts)
  color: string;
  together?: string; // an idea for doing it as a family
  prayers: Prayer[];
};

export const prayerTopics = data.topics as PrayerTopic[];

export function getPrayerTopic(id: string): PrayerTopic | undefined {
  return prayerTopics.find((t) => t.id === id);
}
