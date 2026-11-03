import { Image } from "expo-image";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeTile from "@/components/HomeTile";
import { colors, sectionColors, sizes } from "@/constants/theme";

export default function Home() {
  return (
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

        <View style={styles.grid}>
          <HomeTile href="/bible" emoji="📖" label="Bible Stories" color={sectionColors.bible} />
          <HomeTile href="/games" emoji="🧩" label="Games" color={sectionColors.games} />
          <HomeTile href="/songs" emoji="🎵" label="Sing-Along" color={sectionColors.songs} />
          <HomeTile href="/prayer" emoji="🙏" label="Family Prayer" color={sectionColors.prayer} />
          <HomeTile href="/journal" emoji="💛" label="Thank-You Journal" color={sectionColors.journal} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  container: {
    padding: 20,
    alignItems: "center",
    gap: 16,
    width: "100%",
    maxWidth: 960,
    alignSelf: "center",
  },
  logo: { width: 200, height: 200 },
  verse: {
    fontSize: sizes.body,
    color: colors.text,
    textAlign: "center",
    fontStyle: "italic",
  },
  ref: { fontSize: sizes.small, color: colors.textLight, fontStyle: "normal" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    width: "100%",
  },
});
