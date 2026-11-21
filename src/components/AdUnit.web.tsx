import { useEffect, useRef, type CSSProperties } from "react";

// One AdSense ad unit. The adsbygoogle.js loader is already in src/app/+html.tsx.
// Every unit carries the child age treatment tag (TFAT = 1) for COPPA.

export const AD_CLIENT = "ca-pub-8809349846108777";

// Below this window width the side ad has no room, so the bottom ad shows instead.
export const SIDE_AD_MIN_WIDTH = 1100;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type Props = {
  slot: string;
  style?: CSSProperties;
  fullWidthResponsive?: boolean;
};

export default function AdUnit({ slot, style, fullWidthResponsive = false }: Props) {
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
      style={{ display: "block", ...style }}
      data-ad-client={AD_CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      data-tag-for-age-treatment="1"
    />
  );
}
