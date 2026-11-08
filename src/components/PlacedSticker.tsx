import { Image } from "expo-image";
import { useEffect, useRef } from "react";
import { Animated, PanResponder, StyleSheet, type GestureResponderEvent } from "react-native";
import { toStage } from "@/components/LandscapeStage";
import type { SceneSticker } from "@/content/scenes";
import { colors } from "@/constants/theme";

export type Placed = {
  uid: number;
  stickerId: string;
  x: number; // center, as a share of the scene width (0-1)
  y: number; // center, as a share of the scene height (0-1)
  scale: number; // 1 = the sticker's normal size
  flipped: boolean;
};

type Props = {
  placed: Placed;
  sticker: SceneSticker;
  sceneW: number;
  sceneH: number;
  selected: boolean;
  rotated: boolean; // builder is drawn sideways (phone held upright)
  onSelect: (uid: number) => void;
  onMove: (uid: number, x: number, y: number) => void;
  onScale: (uid: number, scale: number) => void;
};

export const MIN_SCALE = 0.4;
export const MAX_SCALE = 3;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function distance(e: GestureResponderEvent) {
  const [a, b] = e.nativeEvent.touches;
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
}

// One sticker placed on the scene. Drag it with one finger (or the mouse);
// pinch with two fingers to resize. Uses React Native's built-in touch system
// (PanResponder), which works the same on iOS, Android and the web.
export default function PlacedSticker({ placed, sticker, sceneW, sceneH, selected, rotated, onSelect, onMove, onScale }: Props) {
  const drag = useRef(new Animated.ValueXY()).current; // live offset while dragging
  const pinch = useRef(new Animated.Value(1)).current; // live scale while pinching

  // Latest values for the touch handlers (kept up to date after each render)
  const latest = useRef({ placed, sceneW, sceneH, rotated, onSelect, onMove, onScale });
  useEffect(() => {
    latest.current = { placed, sceneW, sceneH, rotated, onSelect, onMove, onScale };
  });

  // Finger movement is measured on the glass; turn it to match a sideways builder
  const toScene = (dx: number, dy: number) => toStage(dx, dy, latest.current.rotated);

  const pinchStart = useRef<number | null>(null);
  const pinchRatio = useRef(1);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        latest.current.onSelect(latest.current.placed.uid);
        pinchStart.current = null;
        pinchRatio.current = 1;
      },
      onPanResponderMove: (e, g) => {
        if (e.nativeEvent.touches.length >= 2) {
          // Two fingers: resize
          if (pinchStart.current === null) pinchStart.current = distance(e);
          const { scale } = latest.current.placed;
          const ratio = distance(e) / pinchStart.current;
          pinchRatio.current = clamp(scale * ratio, MIN_SCALE, MAX_SCALE) / scale;
          pinch.setValue(pinchRatio.current);
        } else if (pinchStart.current === null) {
          // One finger: move
          drag.setValue(toScene(g.dx, g.dy));
        }
      },
      onPanResponderRelease: (_e, g) => finish(g.dx, g.dy),
      onPanResponderTerminate: (_e, g) => finish(g.dx, g.dy),
    })
  ).current;

  function finish(dx: number, dy: number) {
    const { placed: p, sceneW: w, sceneH: h, onMove: move, onScale: scale } = latest.current;
    if (pinchStart.current !== null) {
      scale(p.uid, clamp(p.scale * pinchRatio.current, MIN_SCALE, MAX_SCALE));
    } else if (w > 0 && h > 0) {
      // Keep the sticker's center inside the scene
      const d = toScene(dx, dy);
      move(p.uid, clamp(p.x + d.x / w, 0.02, 0.98), clamp(p.y + d.y / h, 0.02, 0.98));
    }
    drag.setValue({ x: 0, y: 0 });
    pinch.setValue(1);
    pinchStart.current = null;
  }

  const width = sticker.size * placed.scale * sceneW;
  const height = width / sticker.aspect;

  return (
    <Animated.View
      {...responder.panHandlers}
      accessibilityLabel={sticker.label}
      style={[
        styles.sticker,
        {
          left: placed.x * sceneW - width / 2,
          top: placed.y * sceneH - height / 2,
          width,
          height,
          transform: [{ translateX: drag.x }, { translateY: drag.y }, { scale: pinch }],
        },
        selected && styles.selected,
      ]}
    >
      <Image
        source={sticker.image}
        style={[styles.image, placed.flipped && styles.flipped]}
        contentFit="contain"
        pointerEvents="none"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sticker: { position: "absolute", cursor: "grab" },
  selected: { borderWidth: 2, borderColor: colors.gold, borderStyle: "dashed", borderRadius: 8 },
  image: { width: "100%", height: "100%" },
  flipped: { transform: [{ scaleX: -1 }] },
});
