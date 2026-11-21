import { useEffect, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import AdUnit, { SIDE_AD_MIN_WIDTH } from "./AdUnit.web";

// Horizontal AdSense block ("horz-ad-1") placed at the end of a page's content.
// Only shows on narrower windows (phones, tablets), where the side ad doesn't.
// Add <BottomAd /> as the last item inside a page's scroll content.

const AD_SLOT = "5193426311";

export default function BottomAd() {
  const { width } = useWindowDimensions();

  // Pages are pre-built, so wait until we're in the browser before rendering the ad.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || width >= SIDE_AD_MIN_WIDTH) return null;

  return (
    <View style={{ width: "100%", maxWidth: 720, alignSelf: "center", marginTop: 24 }}>
      <AdUnit slot={AD_SLOT} style={{ width: "100%" }} fullWidthResponsive />
    </View>
  );
}
