import { useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

type Size = { width: number; height: number; rotated: boolean };

// Gives a game a landscape space to draw in.
// - Wide screens: the space under the header, as is.
// - Tall screens (phone held upright): the same space turned a quarter turn left,
//   so kids turn the phone (top to the right) and the game gets the full length
//   of the screen. The header stays where it is.
// The space is measured on the device (not from the screen size), so the
// web site's pre-built pages work too. Games get `rotated` so drag code can
// turn finger movement to match.
export default function LandscapeStage({ children }: { children: (size: Size) => ReactNode }) {
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const rotated = box ? box.h > box.w : false;

  return (
    <View style={styles.fill} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {box &&
        (rotated ? (
          <View
            style={{
              position: "absolute",
              width: box.h,
              height: box.w,
              left: (box.w - box.h) / 2,
              top: (box.h - box.w) / 2,
              transform: [{ rotate: "-90deg" }],
            }}
          >
            {children({ width: box.h, height: box.w, rotated: true })}
          </View>
        ) : (
          children({ width: box.w, height: box.h, rotated: false })
        ))}
    </View>
  );
}

// Finger movement on the glass -> movement inside the stage.
// When the stage is turned a quarter turn left, "up" on the glass is "left" in the game.
export function toStage(dx: number, dy: number, rotated: boolean) {
  return rotated ? { x: -dy, y: dx } : { x: dx, y: dy };
}

const styles = StyleSheet.create({
  fill: { flex: 1, overflow: "hidden" },
});
