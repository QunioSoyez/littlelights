import { ScrollView, StyleSheet, Text, View } from "react-native";
import HomeTile from "@/components/HomeTile";
import PatternBackground from "@/components/PatternBackground";
import { scenes } from "@/content/scenes";
import { colors, sectionColors } from "@/constants/theme";

// Build a Scene: pick which scene to decorate
export default function ScenePicker() {
  return (
    <PatternBackground>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <Text style={styles.intro}>Pick a scene, then add people, animals and things to it!</Text>
          {scenes.map((s) => (
            <HomeTile
              key={s.id}
              href={`/games/scenes/${s.id}`}
              label={s.title}
              color={sectionColors.games}
              picture={s.background}
            />
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
