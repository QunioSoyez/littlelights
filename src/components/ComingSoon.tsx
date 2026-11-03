import { StyleSheet, Text, View } from "react-native";
import { colors, sizes } from "@/constants/theme";

// Placeholder for sections that aren't built yet.
export default function ComingSoon({ emoji, message }: { emoji: string; message: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>Coming soon!</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  emoji: { fontSize: 72 },
  title: { fontSize: sizes.title, fontWeight: "bold", color: colors.blue },
  message: { fontSize: sizes.body, color: colors.textLight, textAlign: "center", maxWidth: 480 },
});
