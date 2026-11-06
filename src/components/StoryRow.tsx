import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { lathburyImages } from "@/content/lathburyImages";
import type { Story } from "@/content/stories";
import { colors, sectionColors } from "@/constants/theme";

// One story in the story list: picture, story number and title.
export default function StoryRow({ story }: { story: Story }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Story ${story.number}: ${story.title}`}
      onPress={() => router.push(`/bible/${story.id}`)}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.8 : 1 }]}
    >
      {story.thumbnail ? (
        <Image source={lathburyImages[story.thumbnail]} style={styles.thumb} contentFit="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbEmpty]}>
          <Text style={styles.thumbNumber}>{story.number}</Text>
        </View>
      )}
      <View style={styles.text}>
        <Text style={styles.number}>Story {story.number}</Text>
        <Text style={styles.title}>{story.title}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 10,
    borderWidth: 2,
    borderColor: "#E8DDC4",
  },
  thumb: { width: 76, height: 76, borderRadius: 12 },
  thumbEmpty: { backgroundColor: colors.goldLight, alignItems: "center", justifyContent: "center" },
  thumbNumber: { fontSize: 28, fontWeight: "bold", color: sectionColors.bible },
  text: { flex: 1, gap: 2 },
  number: { fontSize: 14, fontWeight: "bold", color: colors.textLight },
  title: { fontSize: 20, fontWeight: "bold", color: colors.text },
  chevron: { fontSize: 36, color: sectionColors.bible, paddingRight: 6 },
});
