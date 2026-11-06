import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from "react-native";
import PatternBackground from "@/components/PatternBackground";
import ReadAloudBar from "@/components/ReadAloudBar";
import { lathburyImages } from "@/content/lathburyImages";
import { getNeighbors, getStory, stories, testamentNames } from "@/content/stories";
import { colors, sectionColors } from "@/constants/theme";
import { useReadAloud } from "@/hooks/useReadAloud";

// Pre-build one web page per story (the web site uses static output)
export function generateStaticParams(): { id: string }[] {
  return stories.map((s) => ({ id: s.id }));
}

// Story reader: title, "Read to me" controls, story text and pictures,
// then buttons to the previous/next story.
export default function StoryReader() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = getStory(id);

  // What gets read aloud: the title (index 0), then each paragraph (1, 2, 3...)
  const spoken = useMemo(
    () => (story ? [story.title, ...story.blocks.flatMap((b) => (b.type === "text" ? [b.text] : []))] : []),
    [story]
  );
  const { state, playAll, playOne, pause, stop } = useReadAloud(spoken);

  // Scroll so the paragraph being read stays on screen
  const scrollRef = useRef<ScrollViewInstance>(null);
  const pageY = useRef(0);
  const paraY = useRef<Record<number, number>>({});
  useEffect(() => {
    if (state.paragraph === null) return;
    const y = paraY.current[state.paragraph];
    if (y !== undefined) scrollRef.current?.scrollTo({ y: Math.max(0, pageY.current + y - 90), animated: true });
  }, [state.paragraph]);

  if (!story) {
    return (
      <PatternBackground>
        <Stack.Screen options={{ title: "Story not found" }} />
        <Text style={[styles.paragraph, { textAlign: "center", marginTop: 40 }]}>
          We couldn't find that story.
        </Text>
      </PatternBackground>
    );
  }

  const { prev, next } = getNeighbors(story.id);

  // Block index -> read-aloud index (title is 0, first paragraph is 1, ...)
  const spokenIndex: Record<number, number> = {};
  let count = 0;
  story.blocks.forEach((b, i) => {
    if (b.type === "text") spokenIndex[i] = ++count;
  });

  return (
    <PatternBackground>
      <Stack.Screen options={{ title: `Story ${story.number}` }} />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
        <View style={styles.page} onLayout={(e) => (pageY.current = e.nativeEvent.layout.y)}>
          <Text style={styles.testament}>
            {testamentNames[story.testament]} · Story {story.number}
          </Text>
          <Text style={[styles.title, state.paragraph === 0 && styles.reading]}>{story.title}</Text>

          {/* While reading, the controls move to a bar fixed at the bottom of the screen */}
          {state.status === "idle" && (
            <ReadAloudBar state={state} onPlay={playAll} onPause={pause} onStop={stop} />
          )}

          {story.blocks.map((block, i) => {
            if (block.type === "text") {
              const n = spokenIndex[i]; // this paragraph's number in the read-aloud list
              const reading = state.paragraph === n;
              return (
                <View
                  key={i}
                  style={[styles.paraRow, reading && styles.reading]}
                  onLayout={(e) => (paraY.current[n] = e.nativeEvent.layout.y)}
                >
                  <Pressable
                    onPress={() => (reading ? stop() : playOne(n))}
                    accessibilityRole="button"
                    accessibilityLabel={reading ? "Stop reading this part" : "Read this part to me"}
                    hitSlop={8}
                    style={({ pressed }) => [styles.speaker, reading && styles.speakerOn, { opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Text style={styles.speakerIcon}>{reading ? "⏹" : "🔊"}</Text>
                  </Pressable>
                  <Text style={styles.paragraph}>{block.text}</Text>
                </View>
              );
            }
            return (
              <View key={i} style={styles.figure}>
                <Image
                  source={lathburyImages[block.image]}
                  style={[styles.picture, { aspectRatio: block.width / block.height }]}
                  contentFit="contain"
                  accessibilityLabel={block.caption}
                />
                <Text style={styles.caption}>{block.caption}</Text>
              </View>
            );
          })}

          <View style={styles.navRow}>
            {prev ? (
              <NavButton label={`‹ ${prev.title}`} onPress={() => router.replace(`/bible/${prev.id}`)} />
            ) : (
              <View style={styles.navSpacer} />
            )}
            {next ? (
              <NavButton label={`${next.title} ›`} onPress={() => router.replace(`/bible/${next.id}`)} />
            ) : (
              <View style={styles.navSpacer} />
            )}
          </View>
        </View>
      </ScrollView>

      {state.status !== "idle" && (
        <View style={styles.floating} pointerEvents="box-none">
          <View style={styles.floatingInner}>
            <ReadAloudBar state={state} onPlay={playAll} onPause={pause} onStop={stop} />
          </View>
        </View>
      )}
    </PatternBackground>
  );
}

function NavButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.navButton, { opacity: pressed ? 0.8 : 1 }]}
    >
      <Text style={styles.navText} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 120 }, // room for the floating read-aloud bar
  floating: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 12, alignItems: "center" },
  floatingInner: {
    width: "100%",
    maxWidth: 720,
    backgroundColor: "rgba(255, 249, 236, 0.96)",
    borderRadius: 22,
    padding: 10,
    borderWidth: 2,
    borderColor: "#E8DDC4",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
  // A white "page" on the pattern, with a fixed max width so lines stay easy to read
  page: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 22,
    gap: 16,
    borderWidth: 2,
    borderColor: "#E8DDC4",
  },
  testament: { fontSize: 15, fontWeight: "bold", color: colors.textLight },
  title: { fontSize: 30, fontWeight: "bold", color: sectionColors.bible, lineHeight: 38 },
  paragraph: { flex: 1, fontSize: 21, lineHeight: 34, color: colors.text },
  paraRow: { flexDirection: "row", gap: 10, alignItems: "flex-start", borderRadius: 12, padding: 6, margin: -6 },
  reading: { backgroundColor: colors.goldLight, borderRadius: 12 },
  speaker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginTop: 1,
    backgroundColor: "#EAF1F8",
    alignItems: "center",
    justifyContent: "center",
  },
  speakerOn: { backgroundColor: colors.gold },
  speakerIcon: { fontSize: 17 },
  figure: { gap: 8, alignItems: "center", marginVertical: 8 },
  picture: { width: "100%", maxWidth: 520, borderRadius: 12 },
  caption: { fontSize: 17, fontStyle: "italic", color: colors.textLight, textAlign: "center" },
  navRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  navButton: {
    flex: 1,
    backgroundColor: sectionColors.bible,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  navText: { color: colors.white, fontSize: 17, fontWeight: "bold", textAlign: "center" },
  navSpacer: { flex: 1 },
});
