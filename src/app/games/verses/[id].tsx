import * as Speech from "expo-speech";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import PatternBackground from "@/components/PatternBackground";
import { getVerse, verses, type Verse } from "@/content/verses";
import { colors, sectionColors } from "@/constants/theme";

// Pre-build one web page per verse (the web site uses static output)
export function generateStaticParams(): { id: string }[] {
  return verses.map((v) => ({ id: v.id }));
}

// Memory Verse Scramble: tap the words (or phrases) in the right order to rebuild the verse.
// A right tap moves the word up into the verse; a wrong tap shakes the word and it stays put.
// After 2 wrong taps a Hint button shows up that places the next word.
export default function VerseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const verse = getVerse(id);

  // Stop talking when leaving the screen
  useEffect(() => () => void Speech.stop(), []);

  return (
    <PatternBackground>
      <Stack.Screen options={{ title: verse?.ref ?? "Verse Scramble" }} />
      {verse ? (
        <VerseGame key={verse.id} verse={verse} />
      ) : (
        <Text style={styles.message}>We couldn't find that verse.</Text>
      )}
    </PatternBackground>
  );
}

const TILE_COLORS = ["#1E88E5", "#E0529C", "#2E9E6A", "#F5A623", "#7A4FB5", "#D9822B", "#00897B", "#C0392B"];

function shuffledOrder(n: number): number[] {
  let a: number[];
  do {
    a = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  } while (n > 1 && a.every((v, i) => v === i));
  return a;
}

function speak(text: string) {
  Speech.stop();
  Speech.speak(text, { language: "en-US", rate: 0.9 });
}

function VerseGame({ verse }: { verse: Verse }) {
  const n = verse.pieces.length;
  // Shuffle after the page loads (a random order in the pre-built web page wouldn't match)
  const [tray, setTray] = useState<number[] | null>(null); // piece indexes, in tray order
  const [placed, setPlaced] = useState(0); // how many pieces are in the verse line
  const [wrongTaps, setWrongTaps] = useState(0);
  const shakes = useRef(verse.pieces.map(() => new Animated.Value(0))).current;
  const done = placed === n;

  useEffect(() => {
    setTray(shuffledOrder(n));
  }, [n]);

  // Colour by tray position, so the colours don't give away the order
  const colorOf = (piece: number) => TILE_COLORS[(tray?.indexOf(piece) ?? piece) % TILE_COLORS.length];

  const shake = (piece: number) => {
    const v = shakes[piece];
    v.setValue(0);
    Animated.sequence(
      [8, -8, 6, -6, 0].map((x) => Animated.timing(v, { toValue: x, duration: 60, useNativeDriver: true }))
    ).start();
  };

  const tapPiece = (piece: number) => {
    if (done || piece < placed) return;
    // Right if it has the same words as the next piece (a word can appear twice in a verse)
    if (verse.pieces[piece] === verse.pieces[placed]) {
      if (piece !== placed) {
        // Same word, other copy: swap so the pieces stay in order
        setTray((t) => t && t.map((p) => (p === piece ? placed : p === placed ? piece : p)));
      }
      setPlaced(placed + 1);
    } else {
      setWrongTaps((w) => w + 1);
      shake(piece);
    }
  };

  const giveHint = () => {
    if (!done) setPlaced(placed + 1);
  };

  const playAgain = () => {
    setPlaced(0);
    setWrongTaps(0);
    setTray(shuffledOrder(n));
  };

  const sameLevel = verses.filter((v) => v.level === verse.level);
  const nextVerse = sameLevel[sameLevel.findIndex((v) => v.id === verse.id) + 1];
  const big = verse.level === "easy";

  return (
    <View style={styles.fill}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <Text style={styles.hint}>
            {placed === 0 ? "Tap the words in the right order to build the verse." : "Keep going!"}
          </Text>

          {/* The verse being built */}
          <View style={styles.verseCard}>
            <Text style={styles.ref}>{verse.ref}</Text>
            <View style={styles.line}>
              {verse.pieces.map((text, i) =>
                i < placed ? (
                  <View key={i} style={[styles.chip, styles.chipPlaced]}>
                    <Text style={[styles.chipText, styles.chipTextPlaced, !big && styles.chipTextSmall]}>{text}</Text>
                  </View>
                ) : (
                  <View key={i} style={[styles.chip, styles.chipBlank, { minWidth: big ? 56 : 90 }]}>
                    <Text style={[styles.chipText, styles.blankText, !big && styles.chipTextSmall]}> </Text>
                  </View>
                )
              )}
            </View>
          </View>

          <View style={styles.helpRow}>
            <Pressable
              onPress={() => speak(verse.text)}
              style={({ pressed }) => [styles.helpButton, pressed && styles.pressed]}
              accessibilityRole="button"
            >
              <Text style={styles.helpButtonText}>🔊 Hear it</Text>
            </Pressable>
            {wrongTaps >= 2 && !done && (
              <Pressable
                onPress={giveHint}
                style={({ pressed }) => [styles.helpButton, styles.hintButton, pressed && styles.pressed]}
                accessibilityRole="button"
              >
                <Text style={styles.helpButtonText}>💡 Hint</Text>
              </Pressable>
            )}
          </View>

          {/* Scrambled words to pick from */}
          <View style={styles.tray}>
            {tray
              ?.filter((piece) => piece >= placed)
              .map((piece) => (
                <Animated.View key={piece} style={{ transform: [{ translateX: shakes[piece] }] }}>
                  <Pressable
                    onPress={() => tapPiece(piece)}
                    accessibilityRole="button"
                    accessibilityLabel={verse.pieces[piece]}
                    style={({ pressed }) => [styles.chip, { backgroundColor: colorOf(piece) }, pressed && styles.pressed]}
                  >
                    <Text style={[styles.chipText, !big && styles.chipTextSmall]}>{verse.pieces[piece]}</Text>
                  </Pressable>
                </Animated.View>
              ))}
          </View>
        </View>
      </ScrollView>

      {done && (
        <View style={styles.doneWrap}>
          <View style={styles.doneCard}>
            <Text style={styles.doneStars}>⭐ ⭐ ⭐</Text>
            <Text style={styles.doneTitle}>You did it!</Text>
            <Text style={styles.doneVerse}>“{verse.text}”</Text>
            <Text style={styles.doneRef}>{verse.ref}</Text>
            <Pressable onPress={() => speak(`${verse.text} ${verse.ref}`)} style={styles.helpButton}>
              <Text style={styles.helpButtonText}>🔊 Hear it</Text>
            </Pressable>
            <View style={styles.doneButtons}>
              <Pressable style={[styles.bigButton, styles.bigButtonOutline]} onPress={playAgain}>
                <Text style={[styles.bigButtonText, { color: sectionColors.games }]}>Play again</Text>
              </Pressable>
              {nextVerse ? (
                <Pressable style={styles.bigButton} onPress={() => router.replace(`/games/verses/${nextVerse.id}`)}>
                  <Text style={styles.bigButtonText}>Next verse</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.bigButton} onPress={() => router.back()}>
                  <Text style={styles.bigButtonText}>All done</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  message: { fontSize: 20, textAlign: "center", marginTop: 40, color: colors.text },
  fill: { flex: 1, userSelect: "none" }, // web: tapping fast shouldn't highlight text
  scroll: { padding: 16, paddingBottom: 40 },
  column: { width: "100%", maxWidth: 720, alignSelf: "center", gap: 16 },
  hint: {
    fontSize: 20,
    color: colors.text,
    textAlign: "center",
    backgroundColor: "rgba(255, 249, 236, 0.92)",
    borderRadius: 14,
    padding: 10,
    overflow: "hidden",
  },
  verseCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.gold,
    padding: 16,
    gap: 12,
    minHeight: 140,
  },
  ref: { fontSize: 22, fontWeight: "bold", color: sectionColors.bible, textAlign: "center" },
  line: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  tray: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12, paddingTop: 4 },
  chip: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  chipPlaced: { backgroundColor: "#E7F6EE", borderColor: sectionColors.games, shadowOpacity: 0, elevation: 0 },
  chipBlank: {
    backgroundColor: "#F4EEE0",
    borderColor: "#E0D3B5",
    borderStyle: "dashed",
    shadowOpacity: 0,
    elevation: 0,
  },
  chipText: { fontSize: 26, fontWeight: "bold", color: colors.white },
  chipTextSmall: { fontSize: 20 },
  chipTextPlaced: { color: colors.text },
  blankText: { color: "transparent" },
  helpRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10 },
  helpButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.blue,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  hintButton: { borderColor: colors.gold, backgroundColor: colors.goldLight },
  helpButtonText: { fontSize: 17, fontWeight: "bold", color: colors.blue },
  pressed: { opacity: 0.75 },
  doneWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
    padding: 16,
  },
  doneCard: {
    backgroundColor: colors.cream,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 8,
    borderWidth: 3,
    borderColor: colors.gold,
    maxWidth: 460,
  },
  doneStars: { fontSize: 30 },
  doneTitle: { fontSize: 32, fontWeight: "bold", color: sectionColors.games },
  doneVerse: { fontSize: 22, color: colors.text, textAlign: "center", lineHeight: 32 },
  doneRef: { fontSize: 18, fontWeight: "bold", color: sectionColors.bible },
  doneButtons: { flexDirection: "row", gap: 12, marginTop: 8 },
  bigButton: { backgroundColor: sectionColors.games, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 20 },
  bigButtonOutline: { backgroundColor: colors.white, borderWidth: 2, borderColor: sectionColors.games },
  bigButtonText: { color: colors.white, fontSize: 18, fontWeight: "bold" },
});
