import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import PatternBackground from "@/components/PatternBackground";
import { verses } from "@/content/verses";
import { colors, sectionColors } from "@/constants/theme";

// Memory Verse Scramble: pick a verse (Easy = words, Harder = phrases)
export default function VerseList() {
  return (
    <PatternBackground>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <Text style={styles.intro}>Put the words of the Bible verse back in order!</Text>
          {(["easy", "harder"] as const).map((level) => (
            <View key={level} style={styles.section}>
              <Text style={styles.heading}>{level === "easy" ? "Easy" : "Harder"}</Text>
              <View style={styles.grid}>
                {verses
                  .filter((v) => v.level === level)
                  .map((v) => (
                    <Pressable
                      key={v.id}
                      onPress={() => router.push(`/games/verses/${v.id}`)}
                      accessibilityRole="link"
                      accessibilityLabel={v.ref}
                      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
                    >
                      <Text style={styles.ref}>{v.ref}</Text>
                      <Text style={styles.count}>
                        {v.pieces.length} {level === "easy" ? "words" : "parts"}
                      </Text>
                    </Pressable>
                  ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </PatternBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  column: { width: "100%", maxWidth: 720, alignSelf: "center", gap: 20 },
  section: { gap: 12 },
  intro: {
    fontSize: 20,
    color: colors.text,
    textAlign: "center",
    backgroundColor: "rgba(255, 249, 236, 0.92)",
    borderRadius: 14,
    padding: 10,
    overflow: "hidden",
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    color: sectionColors.games,
    backgroundColor: "rgba(255, 249, 236, 0.9)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: "hidden",
  },
  // Two tiles per row (fixed share of the width, so the pre-built web pages match)
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 },
  tile: {
    width: "48.5%",
    minHeight: 96,
    borderRadius: 20,
    padding: 12,
    backgroundColor: sectionColors.games,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  pressed: { opacity: 0.85 },
  ref: { fontSize: 21, fontWeight: "bold", color: colors.white, textAlign: "center" },
  count: { fontSize: 16, color: "rgba(255,255,255,0.85)" },
});
