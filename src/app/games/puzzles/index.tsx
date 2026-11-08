import { ScrollView, StyleSheet, Text, View } from "react-native";
import HomeTile from "@/components/HomeTile";
import PatternBackground from "@/components/PatternBackground";
import { puzzles } from "@/content/puzzles";
import { colors, sectionColors } from "@/constants/theme";

// Puzzles: pick a puzzle (easiest first)
export default function PuzzleList() {
  return (
    <PatternBackground>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <Text style={styles.intro}>Pick a puzzle, then drag the pieces into place!</Text>
          {puzzles.map((p) => (
            <HomeTile
              key={p.id}
              href={`/games/puzzles/${p.id}`}
              label={`${p.title} · ${p.cols * p.rows} pieces`}
              color={sectionColors.games}
              picture={p.image}
            />
          ))}
        </View>
      </ScrollView>
    </PatternBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  column: { width: "100%", maxWidth: 640, alignSelf: "center", gap: 20 },
  intro: {
    fontSize: 20,
    color: colors.text,
    textAlign: "center",
    backgroundColor: "rgba(255, 249, 236, 0.9)",
    borderRadius: 14,
    padding: 10,
    overflow: "hidden",
  },
});
