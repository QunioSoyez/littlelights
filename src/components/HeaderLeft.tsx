import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { homeIcon } from "@/constants/sections";
import { colors } from "@/constants/theme";

// Left side of the blue header on every page except Home:
// the round logo (tap = go Home), then a back arrow when there's somewhere to go back to.
export default function HeaderLeft({ canGoBack }: { canGoBack?: boolean }) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => router.navigate("/")}
        accessibilityRole="link"
        accessibilityLabel="Go to Home"
        hitSlop={6}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <Image source={homeIcon} style={styles.logo} />
      </Pressable>
      {canGoBack && (
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={({ pressed }) => [styles.back, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginLeft: 8, marginRight: 6 },
  logo: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: colors.white },
  back: { paddingHorizontal: 8, paddingVertical: 2 },
  backText: { color: colors.white, fontSize: 26, fontWeight: "bold" },
});
