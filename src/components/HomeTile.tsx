import { Link, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, sizes } from "@/constants/theme";

type Props = {
  href: Href;
  emoji: string;
  label: string;
  color: string;
};

// A big, colorful button for the home screen.
export default function HomeTile({ href, emoji, label, color }: Props) {
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [
          styles.tile,
          { backgroundColor: color, transform: [{ scale: pressed ? 0.96 : 1 }] },
        ]}
      >
        <View style={styles.inner}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexGrow: 1,
    flexBasis: 220,
    minHeight: sizes.tileMinHeight,
    borderRadius: sizes.radius,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  inner: { alignItems: "center", gap: 8 },
  emoji: { fontSize: 56 },
  label: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
});
