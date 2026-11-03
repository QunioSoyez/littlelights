import { Image, type ImageSource } from "expo-image";
import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, sizes } from "@/constants/theme";

type Props = {
  href: Href;
  picture: ImageSource; // large scene picture
  icon: ImageSource; // small round icon
  label: string;
  color: string;
  width: number;
};

// A big picture card with rounded corners that opens a section of the app.
export default function HomeTile({ href, picture, icon, label, color, width }: Props) {
  return (
    // The outer View sets the size, border and rounded corners so they work the same on
    // web, iOS and Android. (Styling the Pressable through <Link asChild> was ignored on web.)
    <View style={[styles.card, { width, borderColor: color }]}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={label}
        onPress={() => router.push(href)}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        <Image source={picture} style={styles.picture} contentFit="cover" />
        <View style={[styles.labelBar, { backgroundColor: color }]}>
          <Image source={icon} style={styles.icon} />
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: sizes.radius,
    borderWidth: 4,
    overflow: "hidden", // clips the picture to the rounded corners
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  picture: { width: "100%", aspectRatio: 1408 / 768 }, // same shape as the original pictures
  labelBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  icon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.white },
  label: { color: colors.white, fontSize: 24, fontWeight: "bold", flexShrink: 1 },
});
