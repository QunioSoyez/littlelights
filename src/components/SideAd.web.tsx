import { useEffect, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { usePathname } from "expo-router";
import AdUnit, { SIDE_AD_MIN_WIDTH } from "./AdUnit.web";

// Desktop-only vertical AdSense block ("vertical-ad-1").
// Sits fixed in the empty space to the right of the centered content column.

const AD_SLOT = "7819589659";

// Only these pages get the side ad (exact paths, so game/story/topic pages are skipped).
// /songs is left out while it is still a "Coming soon" page (no ads on pages without content).
const AD_PATHS = ["/", "/bible", "/games", "/prayer", "/journal", "/about"];

const AD_WIDTH = 160;
const AD_HEIGHT = 600;

export default function SideAd() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  // Pages are pre-built, so wait until we're in the browser before rendering the ad.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || width < SIDE_AD_MIN_WIDTH || !AD_PATHS.includes(pathname)) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "fixed" as any,
        top: 96,
        right: 24,
        width: AD_WIDTH,
        height: AD_HEIGHT,
        zIndex: 10,
      }}
    >
      {/* key = pathname so each listed page gets its own ad request */}
      <AdUnit key={pathname} slot={AD_SLOT} style={{ width: AD_WIDTH, height: AD_HEIGHT }} />
    </View>
  );
}
