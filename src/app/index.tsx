import { Image } from "expo-image";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeTile from "@/components/HomeTile";
import PatternBackground from "@/components/PatternBackground";
import { sections } from "@/constants/sections";
import { colors, sizes } from "@/constants/theme";

const MAX_WIDTH = 1200; // keeps cards from getting huge on wide screens
const PADDING = 20;
const GAP = 20;


export default function Home() {
  const { width } = useWindowDimensions();

  // 1 column on phones, 2 on small tablets, 3 on big screens
  const contentWidth = Math.min(width, MAX_WIDTH) - PADDING * 2;
  const columns = contentWidth >= 1000 ? 3 : contentWidth >= 560 ? 2 : 1;
  const cardWidth = (contentWidth - GAP * (columns - 1)) / columns;

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

          <View style={[styles.grid, { width: contentWidth }]}>
            {sections.map((s) => (
              <HomeTile
                key={s.name}
                href={s.href}
                label={s.title}
                color={s.color}
                picture={s.picture}
                icon={s.icon}
                width={cardWidth}
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
  container: { padding: PADDING, alignItems: "center", gap: 16 },
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center", // centers the last row when it isn't full
    gap: GAP,
  },
});
