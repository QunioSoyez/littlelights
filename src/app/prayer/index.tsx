import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import PatternBackground from "@/components/PatternBackground";
import PulsoIcon from "@/components/PulsoIcon";
import { prayerTopics, type PrayerTopic } from "@/content/prayers";
import { colors } from "@/constants/theme";

// Family Prayer: pick a topic
export default function PrayerTopics() {
  return (
    <PatternBackground>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <Text style={styles.intro}>What would you like to talk to God about?</Text>
          <View style={styles.grid}>
            {prayerTopics.map((t, i) => (
              <PrayerTile key={t.id} topic={t} index={i} />
            ))}
          </View>
        </View>
      </ScrollView>
    </PatternBackground>
  );
}

// One topic tile. The icon plays its animation once when the page opens (one after
// another), and again on hover (web) or touch.
function PrayerTile({ topic, index }: { topic: PrayerTopic; index: number }) {
  const [playKey, setPlayKey] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setPlayKey((k) => k + 1), 300 + index * 150);
    return () => clearTimeout(timer);
  }, [index]);
  const play = () => setPlayKey((k) => k + 1);
  return (
    <Pressable
      onPress={() => router.push(`/prayer/${topic.id}`)}
      onHoverIn={play}
      onPressIn={play}
      accessibilityRole="link"
      accessibilityLabel={topic.title}
      style={({ pressed }) => [styles.tile, { backgroundColor: topic.color, opacity: pressed ? 0.85 : 1 }]}
    >
      <PulsoIcon name={topic.icon} size={52} color="#FFFFFF" strokeWidth={1.8} playKey={playKey} />
      <Text style={styles.title}>{topic.title}</Text>
    </Pressable>
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
  title: { fontSize: 20, fontWeight: "bold", color: colors.white, textAlign: "center" },
});
