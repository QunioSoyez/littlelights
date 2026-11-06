import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import PatternBackground from "@/components/PatternBackground";
import { lathburyImages } from "@/content/lathburyImages";
import { getNeighbors, getStory, stories, testamentNames } from "@/content/stories";
import { colors, sectionColors } from "@/constants/theme";

// Pre-build one web page per story (the web site uses static output)
export function generateStaticParams(): { id: string }[] {
  return stories.map((s) => ({ id: s.id }));
}

// Story reader: title, story text and pictures, then buttons to the previous/next story.
export default function StoryReader() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = getStory(id);

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

  return (
    <PatternBackground>
      <Stack.Screen options={{ title: `Story ${story.number}` }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.page}>
          <Text style={styles.testament}>
            {testamentNames[story.testament]} · Story {story.number}
          </Text>
          <Text style={styles.title}>{story.title}</Text>

          {story.blocks.map((block, i) =>
            block.type === "text" ? (
              <Text key={i} style={styles.paragraph}>
                {block.text}
              </Text>
            ) : (
              <View key={i} style={styles.figure}>
                <Image
                  source={lathburyImages[block.image]}
                  style={[styles.picture, { aspectRatio: block.width / block.height }]}
                  contentFit="contain"
                  accessibilityLabel={block.caption}
                />
                <Text style={styles.caption}>{block.caption}</Text>
              </View>
            )
          )}

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
  scroll: { padding: 16, paddingBottom: 40 },
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
  paragraph: { fontSize: 21, lineHeight: 34, color: colors.text },
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
