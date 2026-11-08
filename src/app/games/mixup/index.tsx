import { ScrollView, StyleSheet, Text, View } from "react-native";
import HomeTile from "@/components/HomeTile";
import PatternBackground from "@/components/PatternBackground";
import { mixupRounds } from "@/content/mixup";
import { colors, sectionColors } from "@/constants/theme";

// Story Mix-Up: pick a round
export default function MixupList() {
  return (
    <PatternBackground>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <Text style={styles.intro}>Put the Bible pictures in the order they happened!</Text>
          {(["easy", "harder"] as const).map((level) => (
            <View key={level} style={styles.column}>
              <Text style={styles.heading}>{level === "easy" ? "Easy" : "Harder"}</Text>
              {mixupRounds
                .filter((r) => r.level === level)
                .map((r) => (
                  <HomeTile
                    key={r.id}
                    href={`/games/mixup/${r.id}`}
                    label={`${r.title} · ${r.cards.length} pictures`}
                    color={sectionColors.games}
                    picture={r.cards[0].image}
                  />
                ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </PatternBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  column: { width: "100%", maxWidth: 640, alignSelf: "center", gap: 20 },
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
