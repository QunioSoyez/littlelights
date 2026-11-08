import { Image, type ImageSource } from "expo-image";
import { useEffect, useRef } from "react";
import { Animated, PanResponder, StyleSheet } from "react-native";
import { toStage } from "@/components/LandscapeStage";
import { colors } from "@/constants/theme";

type Props = {
  image: ImageSource;
  cols: number;
  rows: number;
  col: number; // this piece's spot in the picture
  row: number;
  left: number; // where to draw it (inside the puzzle area)
  top: number;
  width: number;
  height: number;
  placed: boolean; // locked in its right spot
  rotated: boolean; // puzzle drawn sideways (phone held upright)
  onDragStart: () => void;
  onDragEnd: (dx: number, dy: number) => void; // movement inside the puzzle area
};

// One puzzle piece: a window onto part of the picture. Drag it with a finger or the
// mouse (React Native's PanResponder - works on iOS, Android and the web).
export default function PuzzlePiece(props: Props) {
  const { image, cols, rows, col, row, left, top, width, height, placed } = props;
  const drag = useRef(new Animated.ValueXY()).current;

  const latest = useRef(props);
  useEffect(() => {
    latest.current = props;
  });

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !latest.current.placed,
      onMoveShouldSetPanResponder: () => !latest.current.placed,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => latest.current.onDragStart(),
      onPanResponderMove: (_e, g) => drag.setValue(toStage(g.dx, g.dy, latest.current.rotated)),
      onPanResponderRelease: (_e, g) => end(g.dx, g.dy),
      onPanResponderTerminate: (_e, g) => end(g.dx, g.dy),
    })
  ).current;

  function end(dx: number, dy: number) {
    const d = toStage(dx, dy, latest.current.rotated);
    drag.setValue({ x: 0, y: 0 });
    latest.current.onDragEnd(d.x, d.y);
  }

  return (
    <Animated.View
      {...(placed ? {} : responder.panHandlers)}
      accessibilityLabel={placed ? undefined : "Puzzle piece"}
      style={[
        styles.piece,
        placed ? styles.placed : styles.loose,
        { left, top, width, height, transform: [{ translateX: drag.x }, { translateY: drag.y }] },
      ]}
    >
      {/* The whole picture, shifted so only this piece's part shows */}
      <Image
        source={image}
        pointerEvents="none"
        style={{ position: "absolute", width: width * cols, height: height * rows, left: -col * width, top: -row * height }}
        contentFit="fill"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  piece: { position: "absolute", overflow: "hidden" },
  loose: {
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.white,
    cursor: "grab",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  placed: {},
});
