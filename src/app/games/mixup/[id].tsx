import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import PatternBackground from "@/components/PatternBackground";
import { getMixupRound, mixupRounds, type MixupRound } from "@/content/mixup";
import { getStory } from "@/content/stories";
import { colors, sectionColors } from "@/constants/theme";

// Pre-build one web page per round (the web site uses static output)
export function generateStaticParams(): { id: string }[] {
  return mixupRounds.map((r) => ({ id: r.id }));
}

// Story Mix-Up: tap the pictures in the order they happened in the Bible.
// Each tap puts the next number on a card; tap a numbered card to take its number off.
// When every card has a number we check: right cards lock in (green), wrong ones get
// their numbers cleared so the child can try again. After 2 wrong tries a Hint button
// shows up: it puts the next right number on the right card. "Read the story" opens
// the Bible story (the back arrow comes back here with the game as it was).
export default function MixupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const round = getMixupRound(id);

  if (!round) {
    return (
      <PatternBackground>
        <Stack.Screen options={{ title: "Story Mix-Up" }} />
        <Text style={styles.message}>We couldn't find that round.</Text>
      </PatternBackground>
    );
  }
  return (
    <PatternBackground>
      <Stack.Screen options={{ title: round.title }} />
      {/* key: start fresh when moving to the next round */}
      <MixupGame key={round.id} round={round} />
    </PatternBackground>
  );
}

// Card numbers in a random order that isn't already the right order
function shuffledOrder(n: number): number[] {
  let a: number[];
  do {
    a = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  } while (a.every((v, i) => v === i));
  return a;
}

type Check = { right: boolean[] } | null;

function MixupGame({ round }: { round: MixupRound }) {
  const n = round.cards.length;
  // Shuffle after the page loads (a random order in the pre-built web page wouldn't match)
  const [order, setOrder] = useState<number[] | null>(null);
  const [picked, setPicked] = useState<(number | null)[]>(() => Array(n).fill(null)); // picked[card] = position (0-based)
  const [locked, setLocked] = useState<boolean[]>(() => Array(n).fill(false));
  const [check, setCheck] = useState<Check>(null); // briefly shows right/wrong marks
  const [wrongTries, setWrongTries] = useState(0);
  const [width, setWidth] = useState(0);
  const done = locked.every(Boolean);

  useEffect(() => {
    setOrder(shuffledOrder(n));
  }, [n]);

  // After showing the marks for a moment: lock the right cards, clear the wrong ones
  useEffect(() => {
    if (!check) return;
    const t = setTimeout(() => {
      setLocked((l) => l.map((v, i) => v || check.right[i]));
      setPicked((p) => p.map((v, i) => (check.right[i] ? v : null)));
      setCheck(null);
    }, 1200);
    return () => clearTimeout(t);
  }, [check]);

  const tapCard = (card: number) => {
    if (check || locked[card]) return;
    const next = [...picked];
    if (next[card] !== null) {
      next[card] = null; // take the number off
    } else {
      // Give it the lowest number not used yet
      let pos = 0;
      while (next.includes(pos)) pos++;
      next[card] = pos;
    }
    setPicked(next);
    if (next.every((v) => v !== null)) checkAnswers(next);
  };

  const checkAnswers = (next: (number | null)[]) => {
    const right = next.map((v, i) => v === i);
    if (right.some((r) => !r)) setWrongTries((w) => w + 1);
    setCheck({ right });
  };

  // Hint: the first card that isn't locked in yet goes to its right spot
  const giveHint = () => {
    if (check) return;
    const pos = locked.findIndex((l) => !l);
    if (pos < 0) return;
    const next = picked.map((v, i) => (v === pos && i !== pos ? null : v)); // free up that number
    next[pos] = pos;
    const nextLocked = [...locked];
    nextLocked[pos] = true;
    setPicked(next);
    setLocked(nextLocked);
    if (next.every((v) => v !== null)) checkAnswers(next);
  };

  const startOver = () => {
    setPicked(Array(n).fill(null));
    setLocked(Array(n).fill(false));
    setCheck(null);
    setWrongTries(0);
    setOrder(shuffledOrder(n));
  };

  // Next round at the same level (easy -> easy, harder -> harder)
  const sameLevel = mixupRounds.filter((r) => r.level === round.level);
  const nextRound = sameLevel[sameLevel.findIndex((r) => r.id === round.id) + 1];
  const stories = round.stories.map(getStory).filter((st) => st !== undefined);

  // ---- sizes: as many cards per row as fit, at least 130 wide, at most 220 ----
  const gap = 14;
  let cols = 1;
  for (let c = n; c >= 1; c--) {
    if ((width - gap * (c - 1)) / c >= 130) {
      cols = c;
      break;
    }
  }
  if (cols === n - 1 && n > 2) cols = Math.ceil(n / 2); // avoid a row of 3 + a lonely 1
  const cardW = Math.min(220, Math.floor((width - gap * (cols - 1)) / cols));

  const allWrong = check && check.right.every((r) => !r);
  const someWrong = check && check.right.some((r) => !r);

  return (
    <View style={styles.fill}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
          <Text style={styles.hint}>
            {someWrong
              ? allWrong
                ? "Not quite. Try again!"
                : "Some are right! Try the others again."
              : "Tap the pictures in the order they happened. Tap a number to take it off."}
          </Text>

          <View style={styles.helpRow}>
            {stories.length === 1 && (
              <Pressable
                onPress={() => router.push(`/bible/${stories[0].id}`)}
                style={({ pressed }) => [styles.helpButton, pressed && styles.pressed]}
                accessibilityRole="link"
              >
                <Text style={styles.helpButtonText}>📖 Read the story</Text>
              </Pressable>
            )}
            {stories.length > 1 &&
              stories.map((st) => (
                <Pressable
                  key={st.id}
                  onPress={() => router.push(`/bible/${st.id}`)}
                  style={({ pressed }) => [styles.helpButton, pressed && styles.pressed]}
                  accessibilityRole="link"
                >
                  <Text style={styles.helpButtonText}>📖 {st.title}</Text>
                </Pressable>
              ))}
            {wrongTries >= 2 && !done && (
              <Pressable
                onPress={giveHint}
                style={({ pressed }) => [styles.helpButton, styles.hintButton, pressed && styles.pressed]}
                accessibilityRole="button"
              >
                <Text style={styles.helpButtonText}>💡 Hint</Text>
              </Pressable>
            )}
          </View>

          <View style={[styles.grid, { gap }]}>
            {width > 0 &&
              order?.map((card) => {
                const pos = picked[card];
                const mark = check ? (check.right[card] ? "right" : "wrong") : locked[card] ? "right" : null;
                return (
                  <Pressable
                    key={card}
                    onPress={() => tapCard(card)}
                    accessibilityRole="button"
                    accessibilityLabel={`${round.cards[card].label}${pos !== null ? `, number ${pos + 1}` : ""}`}
                    style={({ pressed }) => [
                      styles.card,
                      { width: cardW },
                      pos !== null && styles.cardPicked,
                      mark === "right" && styles.cardRight,
                      mark === "wrong" && styles.cardWrong,
                      pressed && !locked[card] && styles.pressed,
                    ]}
                  >
                    <Image source={round.cards[card].image} style={{ width: "100%", aspectRatio: 3 / 4 }} contentFit="cover" />
                    <Text style={styles.label} numberOfLines={2}>
                      {round.cards[card].label}
                    </Text>
                    {pos !== null && (
                      <View
                        style={[
                          styles.badge,
                          mark === "right" && { backgroundColor: sectionColors.games },
                          mark === "wrong" && { backgroundColor: "#D64545" },
                        ]}
                      >
                        <Text style={styles.badgeText}>{mark === "wrong" ? "✗" : pos + 1}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
          </View>

          {picked.some((p) => p !== null) && !done && (
            <Pressable onPress={startOver} style={({ pressed }) => [styles.smallButton, pressed && styles.pressed]}>
              <Text style={styles.smallButtonText}>Start over</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {done && (
        <View style={styles.doneWrap}>
          <View style={styles.doneCard}>
            <Text style={styles.doneStars}>⭐ ⭐ ⭐</Text>
            <Text style={styles.doneTitle}>You did it!</Text>
            {round.cards.map((c, i) => (
              <Text key={i} style={styles.doneText}>
                {i + 1}. {c.label}
              </Text>
            ))}
            <View style={styles.doneButtons}>
              <Pressable style={[styles.bigButton, styles.bigButtonOutline]} onPress={startOver}>
                <Text style={[styles.bigButtonText, { color: sectionColors.games }]}>Play again</Text>
              </Pressable>
              {nextRound ? (
                <Pressable style={styles.bigButton} onPress={() => router.replace(`/games/mixup/${nextRound.id}`)}>
                  <Text style={styles.bigButtonText}>Next</Text>
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
  column: { width: "100%", maxWidth: 960, alignSelf: "center", gap: 16, alignItems: "center" },
  hint: {
    fontSize: 20,
    color: colors.text,
    textAlign: "center",
    backgroundColor: "rgba(255, 249, 236, 0.92)",
    borderRadius: 14,
    padding: 10,
    overflow: "hidden",
    alignSelf: "stretch",
  },
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
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: "#E8DDC4",
    overflow: "hidden",
  },
  cardPicked: { borderColor: colors.gold },
  cardRight: { borderColor: sectionColors.games },
  cardWrong: { borderColor: "#D64545" },
  pressed: { opacity: 0.75 },
  label: { fontSize: 16, fontWeight: "bold", color: colors.text, textAlign: "center", padding: 6, minHeight: 50 },
  badge: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.blue,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: colors.white, fontSize: 24, fontWeight: "bold" },
  smallButton: {
    borderWidth: 2,
    borderColor: sectionColors.games,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  smallButtonText: { color: sectionColors.games, fontWeight: "bold", fontSize: 16 },
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
    gap: 6,
    borderWidth: 3,
    borderColor: colors.gold,
    maxWidth: 420,
  },
  doneStars: { fontSize: 30 },
  doneTitle: { fontSize: 32, fontWeight: "bold", color: sectionColors.games, marginBottom: 4 },
  doneText: { fontSize: 18, color: colors.text, textAlign: "center" },
  doneButtons: { flexDirection: "row", gap: 12, marginTop: 12 },
  bigButton: { backgroundColor: sectionColors.games, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 20 },
  bigButtonOutline: { backgroundColor: colors.white, borderWidth: 2, borderColor: sectionColors.games },
  bigButtonText: { color: colors.white, fontSize: 18, fontWeight: "bold" },
});
