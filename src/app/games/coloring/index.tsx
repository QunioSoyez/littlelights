import { ScrollView, StyleSheet, Text, View } from "react-native";
import HomeTile from "@/components/HomeTile";
import PatternBackground from "@/components/PatternBackground";
import { coloringPages } from "@/content/coloringPages";
import { colors, sectionColors } from "@/constants/theme";

// Coloring book: pick a page
export default function ColoringList() {
  return (
    <PatternBackground>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <Text style={styles.intro}>Pick a page to color!</Text>
          {coloringPages.map((p) => (
            <HomeTile key={p.id} href={`/games/coloring/${p.id}`} label={p.title} color={sectionColors.games} picture={p.thumb} />
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
