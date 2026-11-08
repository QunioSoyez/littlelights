import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import PatternBackground from "@/components/PatternBackground";
import { prayerTopics } from "@/content/prayers";
import { colors } from "@/constants/theme";

// Family Prayer: pick a topic
export default function PrayerTopics() {
  return (
    <PatternBackground>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <Text style={styles.intro}>What would you like to talk to God about?</Text>
          <View style={styles.grid}>
            {prayerTopics.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => router.push(`/prayer/${t.id}`)}
                accessibilityRole="link"
                accessibilityLabel={t.title}
                style={({ pressed }) => [styles.tile, { backgroundColor: t.color, opacity: pressed ? 0.85 : 1 }]}
              >
                <Text style={styles.emoji}>{t.emoji}</Text>
                <Text style={styles.title}>{t.title}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </PatternBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  column: { width: "100%", maxWidth: 720, alignSelf: "center", gap: 16 },
  intro: {
    fontSize: 21,
    color: colors.text,
    textAlign: "center",
    backgroundColor: "rgba(255, 249, 236, 0.92)",
    borderRadius: 14,
    padding: 10,
    overflow: "hidden",
  },
  // Two tiles per row (fixed share of the width, so the pre-built web pages match)
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 14 },
  tile: {
    width: "48.5%",
    minHeight: 130,
    borderRadius: 22,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  emoji: { fontSize: 42 },
  title: { fontSize: 20, fontWeight: "bold", color: colors.white, textAlign: "center" },
});
