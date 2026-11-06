import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import PatternBackground from "@/components/PatternBackground";
import { getSection, type Section } from "@/constants/sections";
import { colors, sizes } from "@/constants/theme";

// Placeholder for sections that aren't built yet. Shows that section's round icon.
export default function ComingSoon({ section, message }: { section: Section["name"]; message: string }) {
  const s = getSection(section);
  return (
    <PatternBackground>
      <View style={styles.container}>
        <Image source={s.icon} style={styles.icon} accessibilityLabel={s.title} />
        <Text style={[styles.title, { color: s.color }]}>Coming soon!</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </PatternBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  icon: { width: 120, height: 120 },
  title: { fontSize: sizes.title, fontWeight: "bold" },
  message: { fontSize: sizes.body, color: colors.textLight, textAlign: "center", maxWidth: 480 },
});
