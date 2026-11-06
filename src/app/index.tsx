import { Image } from "expo-image";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeTile from "@/components/HomeTile";
import PatternBackground from "@/components/PatternBackground";
import { sections } from "@/constants/sections";
import { colors, sizes } from "@/constants/theme";

// Cards are stacked top to bottom in one column. The column width is fixed in the
// styles (not measured from the screen), so the web site's pre-built pages and the
// app always show the cards at the same size.
const COLUMN_WIDTH = 640;

export default function Home() {
  return (
    <PatternBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            contentFit="contain"
            accessibilityLabel="Little Lights logo"
          />
          <Text style={styles.verse}>
            "Let your light so shine before men, that they may see your good works,
            and glorify your Father which is in heaven."{"\n"}
            <Text style={styles.ref}>Matthew 5:16</Text>
          </Text>

          <View style={styles.column}>
            {sections.map((s) => (
              <HomeTile
                key={s.name}
                href={s.href}
                label={s.title}
                color={s.color}
                picture={s.picture}
                icon={s.icon}
                />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </PatternBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20, alignItems: "center", gap: 16 },
  logo: { width: 180, height: 180 },
  verse: {
    backgroundColor: "rgba(255, 249, 236, 0.9)", // soft cream backing so the pattern doesn't fight the text
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    overflow: "hidden",
    fontSize: sizes.body,
    color: colors.text,
    textAlign: "center",
    fontStyle: "italic",
    maxWidth: 700,
  },
  ref: { fontSize: sizes.small, color: colors.textLight, fontStyle: "normal" },
  column: {
    width: "100%",
    maxWidth: COLUMN_WIDTH,
    gap: 24,
  },
});
