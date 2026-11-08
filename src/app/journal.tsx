import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import PatternBackground from "@/components/PatternBackground";
import { colors, sectionColors } from "@/constants/theme";
import { loadEntries, saveEntries, type JournalEntry } from "@/lib/journal";

// Picture prompts for kids who are still learning to read and write
const PROMPTS = [
  { id: "family", emoji: "👨‍👩‍👧", label: "My family" },
  { id: "friends", emoji: "🧑‍🤝‍🧑", label: "Friends" },
  { id: "jesus", emoji: "✝️", label: "Jesus" },
  { id: "church", emoji: "⛪", label: "Church" },
  { id: "home", emoji: "🏠", label: "My home" },
  { id: "food", emoji: "🍎", label: "Food" },
  { id: "pets", emoji: "🐶", label: "Pets" },
  { id: "nature", emoji: "🌳", label: "Nature" },
  { id: "sunshine", emoji: "☀️", label: "Sunshine" },
  { id: "school", emoji: "🏫", label: "School" },
  { id: "toys", emoji: "🧸", label: "Toys & games" },
  { id: "music", emoji: "🎵", label: "Music" },
];
const promptById = Object.fromEntries(PROMPTS.map((p) => [p.id, p]));

const ACCENT = sectionColors.journal;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

// Thank-You Journal: pick what you're thankful for (and add words if you like).
// Entries stay on this device.
export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [picks, setPicks] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    loadEntries().then((e) => {
      setEntries(e);
      setLoaded(true);
    });
  }, []);

  function update(next: JournalEntry[]) {
    setEntries(next);
    saveEntries(next);
  }

  function toggle(id: string) {
    setPicks((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  function add() {
    if (!picks.length && !text.trim()) return;
    const entry: JournalEntry = { id: String(Date.now()), date: new Date().toISOString(), picks, text: text.trim() };
    update([entry, ...entries]);
    setPicks([]);
    setText("");
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }

  const canAdd = picks.length > 0 || text.trim().length > 0;

  return (
    <PatternBackground>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.column}>
          {/* ---- New entry ---- */}
          <View style={styles.card}>
            <Text style={styles.heading}>Today I'm thankful for…</Text>
            <Text style={styles.sub}>Tap the pictures. You can pick more than one!</Text>
            <View style={styles.prompts}>
              {PROMPTS.map((p) => {
                const on = picks.includes(p.id);
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => toggle(p.id)}
                    accessibilityRole="checkbox"
                    accessibilityLabel={p.label}
                    accessibilityState={{ checked: on }}
                    style={({ pressed }) => [styles.prompt, on && styles.promptOn, { opacity: pressed ? 0.8 : 1 }]}
                  >
                    <Text style={styles.promptEmoji}>{p.emoji}</Text>
                    <Text style={[styles.promptLabel, on && styles.promptLabelOn]} numberOfLines={2}>
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Want to tell more? Type it here (you don't have to)."
              placeholderTextColor={colors.textLight}
              multiline
              maxLength={500}
              style={styles.input}
              accessibilityLabel="Tell more about what you're thankful for"
            />
            <Pressable
              onPress={add}
              disabled={!canAdd}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canAdd }}
              style={({ pressed }) => [styles.addButton, { opacity: !canAdd ? 0.4 : pressed ? 0.8 : 1 }]}
            >
              <Text style={styles.addText}>💛  Add to my journal</Text>
            </Pressable>
            {justSaved && <Text style={styles.saved}>Saved! Thank you, God! 🙌</Text>}
          </View>

          {/* ---- Past entries ---- */}
          {loaded && entries.length > 0 && <Text style={styles.listHeading}>My thank-you journal</Text>}
          {loaded && entries.length === 0 && (
            <Text style={styles.empty}>Your journal is empty. Add your first thank-you above!</Text>
          )}
          {entries.map((e) => (
            <View key={e.id} style={styles.entry}>
              <View style={styles.entryTop}>
                <Text style={styles.entryDate}>{formatDate(e.date)}</Text>
                {confirmDelete === e.id ? (
                  <View style={styles.confirmRow}>
                    <Text style={styles.confirmText}>Delete this?</Text>
                    <Pressable
                      onPress={() => {
                        update(entries.filter((x) => x.id !== e.id));
                        setConfirmDelete(null);
                      }}
                      accessibilityRole="button"
                      style={[styles.smallButton, styles.yes]}
                    >
                      <Text style={styles.smallButtonText}>Yes</Text>
                    </Pressable>
                    <Pressable onPress={() => setConfirmDelete(null)} accessibilityRole="button" style={[styles.smallButton, styles.no]}>
                      <Text style={[styles.smallButtonText, { color: colors.text }]}>No</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => setConfirmDelete(e.id)}
                    accessibilityRole="button"
                    accessibilityLabel="Delete this entry"
                    hitSlop={8}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteText}>✕</Text>
                  </Pressable>
                )}
              </View>
              {e.picks.length > 0 && (
                <View style={styles.entryPicks}>
                  {e.picks.map((id) => (
                    <View key={id} style={styles.chip}>
                      <Text style={styles.chipText}>
                        {promptById[id]?.emoji} {promptById[id]?.label ?? id}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              {!!e.text && <Text style={styles.entryText}>{e.text}</Text>}
            </View>
          ))}

          <Text style={styles.privacy}>Your journal stays on this device. Nobody else can see it.</Text>
        </View>
      </ScrollView>
    </PatternBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  column: { width: "100%", maxWidth: 720, alignSelf: "center", gap: 14 },
  card: { backgroundColor: colors.white, borderRadius: 22, padding: 18, gap: 10, borderWidth: 3, borderColor: ACCENT },
  heading: { fontSize: 26, fontWeight: "bold", color: ACCENT },
  sub: { fontSize: 17, color: colors.textLight },
  // Three per row on any screen (fixed share of the width)
  prompts: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  prompt: {
    width: "31.5%",
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E8DDC4",
    backgroundColor: colors.cream,
  },
  promptOn: { borderColor: ACCENT, backgroundColor: "#FCE4EB", borderWidth: 3 },
  promptEmoji: { fontSize: 34 },
  promptLabel: { fontSize: 15, fontWeight: "bold", color: colors.text, textAlign: "center" },
  promptLabelOn: { color: ACCENT },
  input: {
    minHeight: 80,
    borderWidth: 2,
    borderColor: "#E8DDC4",
    borderRadius: 14,
    padding: 12,
    fontSize: 19,
    color: colors.text,
    textAlignVertical: "top",
    backgroundColor: colors.cream,
  },
  addButton: { backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 14, alignItems: "center" },
  addText: { color: colors.white, fontSize: 20, fontWeight: "bold" },
  saved: { fontSize: 18, fontWeight: "bold", color: sectionColors.games, textAlign: "center" },
  listHeading: {
    fontSize: 22,
    fontWeight: "bold",
    color: ACCENT,
    backgroundColor: "rgba(255, 249, 236, 0.92)",
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingHorizontal: 10,
    overflow: "hidden",
  },
  empty: { fontSize: 18, color: colors.textLight, textAlign: "center", backgroundColor: "rgba(255, 249, 236, 0.92)", borderRadius: 12, padding: 10, overflow: "hidden" },
  entry: { backgroundColor: colors.white, borderRadius: 18, padding: 14, gap: 8, borderWidth: 2, borderColor: "#E8DDC4" },
  entryTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" },
  entryDate: { fontSize: 16, fontWeight: "bold", color: colors.textLight, flexShrink: 1 },
  deleteButton: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#F3E9E9" },
  deleteText: { fontSize: 16, color: "#C2453A", fontWeight: "bold" },
  confirmRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  confirmText: { fontSize: 16, fontWeight: "bold", color: colors.text },
  smallButton: { borderRadius: 10, paddingVertical: 6, paddingHorizontal: 14 },
  yes: { backgroundColor: "#C2453A" },
  no: { backgroundColor: "#ECECEC" },
  smallButtonText: { fontSize: 16, fontWeight: "bold", color: colors.white },
  entryPicks: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { backgroundColor: "#FCE4EB", borderRadius: 14, paddingVertical: 4, paddingHorizontal: 10 },
  chipText: { fontSize: 16, color: colors.text },
  entryText: { fontSize: 19, lineHeight: 28, color: colors.text },
  privacy: { fontSize: 14, color: colors.textLight, textAlign: "center", fontStyle: "italic", marginTop: 8 },
});
