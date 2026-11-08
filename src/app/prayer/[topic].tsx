import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import PatternBackground from "@/components/PatternBackground";
import { getPrayerTopic, prayerTopics } from "@/content/prayers";
import { colors } from "@/constants/theme";
import { useReadAloud } from "@/hooks/useReadAloud";

// Pre-build one web page per topic (the web site uses static output)
export function generateStaticParams(): { topic: string }[] {
  return prayerTopics.map((t) => ({ topic: t.id }));
}

// One prayer topic: a "try this together" idea, then prayer cards with Read to me
export default function PrayerTopicScreen() {
  const { topic: id } = useLocalSearchParams<{ topic: string }>();
  const topic = getPrayerTopic(id);

  // Every line of every prayer, in order, for reading aloud; plus where each prayer starts
  const { lines, starts } = useMemo(() => {
    const all: string[] = [];
    const firsts: number[] = [];
    topic?.prayers.forEach((p) => {
      firsts.push(all.length);
      all.push(...p.lines);
    });
    return { lines: all, starts: firsts };
  }, [topic]);
  const { state, playRange, stop } = useReadAloud(lines);

  if (!topic) {
    return (
      <PatternBackground>
        <Stack.Screen options={{ title: "Not found" }} />
        <Text style={[styles.line, { textAlign: "center", marginTop: 40 }]}>We couldn't find those prayers.</Text>
      </PatternBackground>
    );
  }

  return (
    <PatternBackground>
      <Stack.Screen options={{ title: topic.title }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          {topic.together && (
            <View style={styles.together}>
              <Text style={styles.togetherTitle}>👨‍👩‍👧 Try this together</Text>
              <Text style={styles.togetherText}>{topic.together}</Text>
            </View>
          )}

          {topic.prayers.map((p, i) => {
            const from = starts[i];
            const to = from + p.lines.length - 1;
            const reading = state.status === "playing" && state.range?.from === from;
            return (
              <View key={p.title} style={[styles.card, { borderColor: topic.color }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: topic.color }]}>{p.title}</Text>
                  <Pressable
                    onPress={() => (reading ? stop() : playRange(from, to))}
                    accessibilityRole="button"
                    accessibilityLabel={reading ? "Stop reading" : `Read ${p.title} to me`}
                    style={({ pressed }) => [styles.readButton, reading && styles.readButtonOn, { opacity: pressed ? 0.8 : 1 }]}
                  >
                    <Text style={styles.readText}>{reading ? "⏹  Stop" : "🔊  Read to me"}</Text>
                  </Pressable>
                </View>
                {p.lines.map((line, j) => (
                  <Text key={j} style={[styles.line, reading && state.paragraph === from + j && styles.lineReading]}>
                    {line}
                  </Text>
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </PatternBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  column: { width: "100%", maxWidth: 720, alignSelf: "center", gap: 16 },
  together: { backgroundColor: colors.goldLight, borderRadius: 18, padding: 16, gap: 6, borderWidth: 2, borderColor: colors.gold },
  togetherTitle: { fontSize: 18, fontWeight: "bold", color: colors.blueDark },
  togetherText: { fontSize: 18, lineHeight: 27, color: colors.text },
  card: { backgroundColor: colors.white, borderRadius: 22, padding: 18, gap: 8, borderWidth: 3 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 4 },
  cardTitle: { fontSize: 24, fontWeight: "bold", flexShrink: 1 },
  readButton: { backgroundColor: colors.gold, borderRadius: 14, paddingVertical: 8, paddingHorizontal: 14 },
  readButtonOn: { backgroundColor: colors.goldLight, borderWidth: 2, borderColor: colors.gold },
  readText: { fontSize: 16, fontWeight: "bold", color: colors.blueDark },
  line: { fontSize: 22, lineHeight: 34, color: colors.text, borderRadius: 8, paddingHorizontal: 6 },
  lineReading: { backgroundColor: colors.goldLight },
});
