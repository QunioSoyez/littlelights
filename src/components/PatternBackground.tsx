import type { ReactNode } from "react";
import { ImageBackground, Platform, StyleSheet, View, type ViewStyle } from "react-native";
import { colors } from "@/constants/theme";

// Muted repeating pattern (candles, stars and crosses) used behind screens.
// pattern.png has @2x and @3x versions so it stays sharp on high-res phones and tablets.
const pattern = require("../../assets/images/pattern.png");
const TILE = 240; // size of one pattern tile on screen

export default function PatternBackground({ children }: { children: ReactNode }) {
  if (Platform.OS === "web") {
    // On web, ImageBackground's "repeat" only drew one tile, so use CSS background tiling instead.
    // On web, require() of an image gives its URL (as a string or as { uri }).
    const uri: string = typeof pattern === "string" ? pattern : pattern.uri;
    const webStyle = {
      backgroundImage: `url(${uri})`,
      backgroundRepeat: "repeat",
      backgroundSize: `${TILE}px ${TILE}px`,
    } as unknown as ViewStyle;
    return <View style={[styles.bg, webStyle]}>{children}</View>;
  }
  return (
    <ImageBackground source={pattern} resizeMode="repeat" style={styles.bg}>
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.cream },
});
