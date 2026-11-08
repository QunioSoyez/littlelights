import { ScrollView, StyleSheet, Text, View } from "react-native";
import HomeTile from "@/components/HomeTile";
import PatternBackground from "@/components/PatternBackground";
import { puzzles } from "@/content/puzzles";
import { scenes } from "@/content/scenes";
import { colors, sectionColors } from "@/constants/theme";

// Games still to come (shown as a "coming soon" list)
const comingSoon = ["Story Mix-Up", "Memory Verse Scramble", "Coloring Book"];

export default function GamesList() {
  return (
    <PatternBackground>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <HomeTile
            href="/games/scenes"
            label="Build a Scene"
            color={sectionColors.games}
            picture={scenes[0].background}
          />
          <HomeTile
            href="/games/puzzles"
            label="Puzzles"
            color={sectionColors.games}
            picture={puzzles[0].image}
          />
          <View style={styles.soon}>
            <Text style={styles.soonTitle}>Coming soon</Text>
            {comingSoon.map((g) => (
              <Text key={g} style={styles.soonItem}>
                • {g}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </PatternBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  column: { width: "100%", maxWidth: 640, alignSelf: "center", gap: 20 },
  soon: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: 20,
    padding: 18,
    gap: 6,
    borderWidth: 2,
    borderColor: "#E8DDC4",
  },
  soonTitle: { fontSize: 22, fontWeight: "bold", color: sectionColors.games },
  soonItem: { fontSize: 19, color: colors.textLight },
});
