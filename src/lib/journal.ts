import AsyncStorage from "@react-native-async-storage/async-storage";

// Thank-You Journal entries, saved ON THIS DEVICE ONLY (phone storage, or the
// browser's storage on the web). Nothing is sent anywhere.
export type JournalEntry = {
  id: string;
  date: string; // when it was written (ISO date-time)
  picks: string[]; // picture prompt ids, e.g. "family"
  text: string; // optional words
};

const KEY = "littlelights.journal.v1";

export async function loadEntries(): Promise<JournalEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as JournalEntry[]) : [];
  } catch {
    return [];
  }
}

export async function saveEntries(entries: JournalEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // Storage full or unavailable (e.g. a private browser window) - keep going without saving
  }
}
