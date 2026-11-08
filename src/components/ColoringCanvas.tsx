import { Image } from "expo-image";
import { useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import { PanResponder, Platform, Pressable, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";
import Svg, { Path } from "react-native-svg";
import { toStage } from "@/components/LandscapeStage";
import type { ColoringPage } from "@/content/coloringPages";
import { colors } from "@/constants/theme";

type Props = {
  page: ColoringPage;
  width: number; // size on screen
  height: number;
  rotated: boolean; // drawn sideways (phone held upright)
  fills: Record<number, string>; // area id -> color
  onTap: (areaId: number) => void;
};

const MAX_ZOOM = 4;
const TAP_SLOP = 10; // a finger moving less than this is a tap, not a drag

// Coloring page: filled areas (SVG shapes) under the line art, plus touch handling:
// tap = color an area, drag with one finger = move around when zoomed in,
// pinch with two fingers = zoom. + / - / Fit buttons do the same for mouse users.
export default function ColoringCanvas({ page, width, height, rotated, fills, onTap }: Props) {
  const { data } = page;
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });

  // Unpack the tap grid once: which area is under each 5 x 5 pixel cell
  const grid = useMemo(() => {
    const cells = new Uint16Array(data.grid.cols * data.grid.rows);
    let i = 0;
    for (let k = 0; k < data.grid.rle.length; k += 2) {
      cells.fill(data.grid.rle[k], i, i + data.grid.rle[k + 1]);
      i += data.grid.rle[k + 1];
    }
    return cells;
  }, [data]);
  const shapes = useMemo(() => Object.fromEntries(data.regions.map((r) => [r.id, r.d])), [data]);

  // Which area is at this spot on the page? Taps on a line pick the nearest area.
  function areaAt(px: number, py: number): number {
    const { cols, rows, cell } = data.grid;
    const cx = Math.floor(px / cell);
    const cy = Math.floor(py / cell);
    for (let r = 0; r <= 3; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const x = cx + dx;
          const y = cy + dy;
          if (x >= 0 && y >= 0 && x < cols && y < rows && grid[y * cols + x]) return grid[y * cols + x];
        }
      }
    }
    return 0;
  }

  // Keep the zoomed page covering the frame (no empty edges)
  function clampView(scale: number, x: number, y: number) {
    const s = Math.min(MAX_ZOOM, Math.max(1, scale));
    const mx = ((s - 1) * width) / 2;
    const my = ((s - 1) * height) / 2;
    return { scale: s, x: Math.min(mx, Math.max(-mx, x)), y: Math.min(my, Math.max(-my, y)) };
  }

  // Where on the touch layer the finger is (in the layer's own, unturned coordinates)
  const layerRef = useRef<ComponentRef<typeof View>>(null);
  function localPoint(e: GestureResponderEvent) {
    if (Platform.OS === "web") {
      // On the web, work it out from the layer's box on the page (the box is turned when sideways)
      const el = layerRef.current as unknown as HTMLElement | null;
      const r = el?.getBoundingClientRect();
      const px = e.nativeEvent.pageX - (window.scrollX || 0);
      const py = e.nativeEvent.pageY - (window.scrollY || 0);
      if (!r) return { x: 0, y: 0 };
      return latest.current.rotated ? { x: r.bottom - py, y: px - r.left } : { x: px - r.left, y: py - r.top };
    }
    return { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY };
  }

  // Latest values for the touch handlers
  const latest = useRef({ view, width, height, rotated, onTap });
  useEffect(() => {
    latest.current = { view, width, height, rotated, onTap };
  });

  const gesture = useRef({ start: { x: 0, y: 0 }, moved: false, pinched: false, startView: view, startDist: 0 });

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        gesture.current = { start: localPoint(e), moved: false, pinched: false, startView: latest.current.view, startDist: 0 };
      },
      onPanResponderMove: (e, g) => {
        const t = e.nativeEvent.touches;
        const st = gesture.current;
        const d = toStage(g.dx, g.dy, latest.current.rotated);
        if (t.length >= 2) {
          // Pinch: zoom, and move with the fingers
          const dist = Math.hypot(t[0].pageX - t[1].pageX, t[0].pageY - t[1].pageY);
          if (!st.pinched) {
            st.pinched = true;
            st.startDist = dist;
            st.startView = latest.current.view;
          }
          const sv = st.startView;
          setView(clampView(sv.scale * (dist / st.startDist), sv.x + d.x, sv.y + d.y));
        } else if (Math.hypot(g.dx, g.dy) > TAP_SLOP || st.moved) {
          st.moved = true;
          if (!st.pinched && st.startView.scale > 1) {
            setView(clampView(st.startView.scale, st.startView.x + d.x, st.startView.y + d.y));
          }
        }
      },
      onPanResponderRelease: () => {
        const st = gesture.current;
        if (st.moved || st.pinched) return;
        // A tap: turn the spot on the screen into a spot on the page
        const { view: v, width: w, height: h } = latest.current;
        const cx = w / 2;
        const cy = h / 2;
        const px = (cx + (st.start.x - v.x - cx) / v.scale) * (data.width / w);
        const py = (cy + (st.start.y - v.y - cy) / v.scale) * (data.height / h);
        const area = areaAt(px, py);
        if (area) latest.current.onTap(area);
      },
    })
  ).current;

  const zoom = (factor: number) => setView((v) => clampView(v.scale * factor, v.x * factor, v.y * factor));

  return (
    <View style={[styles.frame, { width, height }]}>
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ translateX: view.x }, { translateY: view.y }, { scale: view.scale }] },
        ]}
      >
        <Svg width={width} height={height} viewBox={`0 0 ${data.width} ${data.height}`}>
          {Object.entries(fills).map(([id, fill]) => (
            <Path key={id} d={shapes[Number(id)]} fill={fill} fillRule="evenodd" />
          ))}
        </Svg>
        <Image source={page.lines} style={StyleSheet.absoluteFill} contentFit="fill" />
      </View>

      {/* Touch layer on top of the picture */}
      <View ref={layerRef} style={StyleSheet.absoluteFill} {...responder.panHandlers} accessibilityLabel="Coloring page" />

      {/* Zoom buttons */}
      <View style={styles.zoom}>
        <ZoomButton label="+" onPress={() => zoom(1.5)} name="Zoom in" />
        <ZoomButton label="−" onPress={() => zoom(1 / 1.5)} name="Zoom out" />
        {view.scale > 1 && <ZoomButton label="Fit" onPress={() => setView({ scale: 1, x: 0, y: 0 })} name="Show whole page" />}
      </View>
    </View>
  );
}

function ZoomButton({ label, onPress, name }: { label: string; onPress: () => void; name: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={name}
      style={({ pressed }) => [styles.zoomButton, { opacity: pressed ? 0.7 : 0.92 }]}
    >
      <Text style={styles.zoomText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: "hidden", backgroundColor: colors.white },
  zoom: { position: "absolute", right: 8, bottom: 8, flexDirection: "row", gap: 6 },
  zoomButton: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  zoomText: { fontSize: 20, fontWeight: "bold", color: colors.blue },
});
