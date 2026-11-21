import { useEffect, useRef, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { usePathname } from "expo-router";

// Desktop-only vertical AdSense block ("vertical-ad-1").
// Sits fixed in the empty space to the right of the centered content column.
// The adsbygoogle.js loader is already in src/app/+html.tsx.

const AD_CLIENT = "ca-pub-8809349846108777";
const AD_SLOT = "7819589659";

// Only these pages get the side ad (exact paths, so game/story/topic pages are skipped).
const AD_PATHS = ["/", "/bible", "/games", "/songs", "/prayer", "/journal", "/about"];

// Content columns max out at 720px; below this width there's no room beside them.
const MIN_WIDTH = 1100;
const AD_WIDTH = 160;
const AD_HEIGHT = 600;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

function AdUnit() {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers or a not-yet-approved site can make this throw; just show nothing.
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", width: AD_WIDTH, height: AD_HEIGHT }}
      data-ad-client={AD_CLIENT}
      data-ad-slot={AD_SLOT}
      data-ad-format="auto"
      data-full-width-responsive="false"
      // COPPA: child age treatment (TFAT). Required on every ad unit.
      data-tag-for-age-treatment="1"
    />
  );
}

export default function SideAd() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  // Pages are pre-built, so wait until we're in the browser before rendering the ad.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || width < MIN_WIDTH || !AD_PATHS.includes(pathname)) return null;

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
      <AdUnit key={pathname} />
    </View>
  );
}
