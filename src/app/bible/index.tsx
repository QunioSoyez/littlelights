import { SectionList, StyleSheet, Text, View } from "react-native";
import PatternBackground from "@/components/PatternBackground";
import StoryRow from "@/components/StoryRow";
import { stories, storySource, testamentNames } from "@/content/stories";
import { colors, sectionColors } from "@/constants/theme";

const sections = (["ot", "nt"] as const).map((t) => ({
  title: testamentNames[t],
  data: stories.filter((s) => s.testament === t),
}));

// Bible Read-Along: list of all stories, grouped by Old and New Testament.
export default function StoryList() {
  return (
    <PatternBackground>
      <SectionList
        sections={sections}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <View style={styles.column}>
            <StoryRow story={item} />
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.column}>
            <Text style={styles.header}>{section.title}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListFooterComponent={<Text style={styles.source}>{storySource}</Text>}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.list}
      />
    </PatternBackground>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 40 },
  // Fixed max width (not measured from the screen) so the web site's pre-built pages match
  column: { width: "100%", maxWidth: 720, alignSelf: "center" },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: sectionColors.bible,
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: "rgba(255, 249, 236, 0.9)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  source: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 14,
    color: colors.textLight,
    fontStyle: "italic",
  },
});
