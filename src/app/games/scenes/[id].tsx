import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import PatternBackground from "@/components/PatternBackground";
import PlacedSticker, { MAX_SCALE, MIN_SCALE, type Placed } from "@/components/PlacedSticker";
import { getScene, scenes } from "@/content/scenes";
import { colors, sectionColors } from "@/constants/theme";

// Pre-build one web page per scene (the web site uses static output)
export function generateStaticParams(): { id: string }[] {
  return scenes.map((s) => ({ id: s.id }));
}

let nextUid = 1;

// Build a Scene: tap a sticker in the tray to add it, drag it around, pinch or use
// the buttons to resize, flip it, or remove it.
export default function SceneBuilder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scene = getScene(id);

  const [placed, setPlaced] = useState<Placed[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 }); // measured scene size in pixels

  if (!scene) {
    return (
      <PatternBackground>
        <Stack.Screen options={{ title: "Scene not found" }} />
        <Text style={styles.message}>We couldn't find that scene.</Text>
      </PatternBackground>
    );
  }

  const stickerById = Object.fromEntries(scene.stickers.map((s) => [s.id, s]));
  const current = placed.find((p) => p.uid === selected);

  function update(uid: number, change: Partial<Placed>) {
    setPlaced((list) => list.map((p) => (p.uid === uid ? { ...p, ...change } : p)));
  }

  // Selecting a sticker also brings it to the front
  function select(uid: number) {
    setSelected(uid);
    setPlaced((list) => {
      const i = list.findIndex((p) => p.uid === uid);
      if (i < 0 || i === list.length - 1) return list;
      return [...list.slice(0, i), ...list.slice(i + 1), list[i]];
    });
  }

  function add(stickerId: string) {
    const uid = nextUid++;
    // Drop near the middle, nudged a little so stickers don't stack exactly
    const jitter = () => (Math.random() - 0.5) * 0.2;
    setPlaced((list) => [...list, { uid, stickerId, x: 0.5 + jitter(), y: 0.55 + jitter() / 2, scale: 1, flipped: false }]);
    setSelected(uid);
  }

  function resize(factor: number) {
    if (!current) return;
    update(current.uid, { scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, current.scale * factor)) });
  }

  function remove() {
    if (!current) return;
    setPlaced((list) => list.filter((p) => p.uid !== current.uid));
    setSelected(null);
  }

  return (
    <PatternBackground>
      <Stack.Screen options={{ title: scene.title }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          {/* The scene. Tapping empty space un-selects. */}
          <View
            style={[styles.scene, { aspectRatio: scene.aspect }]}
            onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelected(null)} accessibilityLabel="Scene">
              <Image source={scene.background} style={styles.background} contentFit="cover" />
            </Pressable>
            {size.w > 0 &&
              placed.map((p) => (
                <PlacedSticker
                  key={p.uid}
                  placed={p}
                  sticker={stickerById[p.stickerId]}
                  sceneW={size.w}
                  sceneH={size.h}
                  selected={p.uid === selected}
                  onSelect={select}
                  onMove={(uid, x, y) => update(uid, { x, y })}
                  onScale={(uid, scale) => update(uid, { scale })}
                />
              ))}
          </View>

          {/* Tools for the selected sticker */}
          <View style={styles.tools}>
            {current ? (
              <>
                <Tool label="−  Smaller" onPress={() => resize(1 / 1.2)} />
                <Tool label="+  Bigger" onPress={() => resize(1.2)} />
                <Tool label="↔  Flip" onPress={() => update(current.uid, { flipped: !current.flipped })} />
                <Tool label="✕  Remove" onPress={remove} danger />
              </>
            ) : (
              <Text style={styles.hint}>
                {placed.length === 0 ? "Tap a sticker below to add it to the scene." : "Tap a sticker in the scene to change it."}
              </Text>
            )}
            {placed.length > 0 && (
              <Tool
                label="Clear all"
                onPress={() => {
                  setPlaced([]);
                  setSelected(null);
                }}
                outline
              />
            )}
          </View>

          {/* Sticker tray */}
          <ScrollView horizontal contentContainerStyle={styles.tray} showsHorizontalScrollIndicator>
            {scene.stickers.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => add(s.id)}
                accessibilityRole="button"
                accessibilityLabel={`Add ${s.label}`}
                style={({ pressed }) => [styles.trayItem, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Image source={s.image} style={styles.trayImage} contentFit="contain" />
                <Text style={styles.trayLabel} numberOfLines={2}>
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </PatternBackground>
  );
}

function Tool({ label, onPress, danger, outline }: { label: string; onPress: () => void; danger?: boolean; outline?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label.replace(/^\W+/, "")}
      style={({ pressed }) => [
        styles.tool,
        danger && styles.toolDanger,
        outline && styles.toolOutline,
        { opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <Text style={[styles.toolText, outline && styles.toolOutlineText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 12, paddingBottom: 40 },
  // Fixed max width (not measured from the screen) so the pre-built web pages match
  column: { width: "100%", maxWidth: 1000, alignSelf: "center", gap: 12 },
  message: { fontSize: 20, textAlign: "center", marginTop: 40, color: colors.text },
  scene: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: sectionColors.games,
    backgroundColor: colors.white,
  },
  background: { width: "100%", height: "100%" },
  tools: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center", minHeight: 52 },
  hint: {
    flex: 1,
    fontSize: 18,
    color: colors.text,
    backgroundColor: "rgba(255, 249, 236, 0.92)",
    borderRadius: 12,
    padding: 10,
    overflow: "hidden",
  },
  tool: { backgroundColor: sectionColors.games, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16 },
  toolDanger: { backgroundColor: "#C2453A" },
  toolOutline: { backgroundColor: colors.white, borderWidth: 2, borderColor: sectionColors.games },
  toolText: { color: colors.white, fontSize: 18, fontWeight: "bold" },
  toolOutlineText: { color: sectionColors.games },
  tray: { gap: 10, paddingVertical: 4, paddingHorizontal: 2 },
  trayItem: {
    width: 104,
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 8,
    borderWidth: 2,
    borderColor: "#E8DDC4",
  },
  trayImage: { width: 80, height: 80 },
  trayLabel: { fontSize: 14, fontWeight: "bold", color: colors.text, textAlign: "center" },
});
