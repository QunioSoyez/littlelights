import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import PatternBackground from "@/components/PatternBackground";
import PlacedSticker, { MAX_SCALE, MIN_SCALE, type Placed } from "@/components/PlacedSticker";
import { getScene, scenes, type Scene } from "@/content/scenes";
import { colors, sectionColors } from "@/constants/theme";

// Pre-build one web page per scene (the web site uses static output)
export function generateStaticParams(): { id: string }[] {
  return scenes.map((s) => ({ id: s.id }));
}

// Build a Scene. Two layouts, picked by measuring the space under the header:
// - Wide (PC, tablet, phone turned sideways): sticker panel on the left, scene on the right.
// - Tall (phone held upright): the same layout drawn sideways - turned a quarter turn
//   to the left - so kids turn the phone (top to the right) and get the whole length
//   of the screen for the scene. The header stays where it is.
export default function SceneBuilder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scene = getScene(id);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  if (!scene) {
    return (
      <PatternBackground>
        <Stack.Screen options={{ title: "Scene not found" }} />
        <Text style={styles.message}>We couldn't find that scene.</Text>
      </PatternBackground>
    );
  }

  const rotated = box ? box.h > box.w : false;

  return (
    <PatternBackground>
      <Stack.Screen options={{ title: scene.title }} />
      <View style={styles.fill} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        {box &&
          (rotated ? (
            // Swap width/height and turn a quarter turn left around the center
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
              <Builder scene={scene} width={box.h} height={box.w} rotated />
            </View>
          ) : (
            <Builder scene={scene} width={box.w} height={box.h} rotated={false} />
          ))}
      </View>
    </PatternBackground>
  );
}

let nextUid = 1;

// The landscape builder: sticker panel | scene + tools. width/height = the space it has.
function Builder({ scene, width, height, rotated }: { scene: Scene; width: number; height: number; rotated: boolean }) {
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  // ---- sizes (all worked out from the measured space) ----
  const compact = height < 520; // small screens (phones) get smaller text and buttons
  const pad = compact ? 10 : 20;
  const gap = compact ? 12 : 24;
  const toolsH = compact ? 50 : 72;
  const panelW = Math.round(Math.min(Math.max(width * 0.3, 190), 420));
  const areaW = width - panelW - pad * 2 - gap; // room for the scene
  const areaH = height - pad * 2 - toolsH - (compact ? 8 : 16);
  const sceneW = Math.max(100, Math.min(areaW, areaH * scene.aspect));
  const sceneH = sceneW / scene.aspect;

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
    const jitter = () => (Math.random() - 0.5) * 0.2; // so stickers don't stack exactly
    setPlaced((list) => [...list, { uid, stickerId, x: 0.5 + jitter(), y: 0.55 + jitter() / 2, scale: 1, flipped: false }]);
    setSelected(uid);
  }

  function resize(factor: number) {
    if (current) update(current.uid, { scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, current.scale * factor)) });
  }

  function remove() {
    if (!current) return;
    setPlaced((list) => list.filter((p) => p.uid !== current.uid));
    setSelected(null);
  }

  const cardW = (panelW - 16 - 2 * 8) / 3; // 3 columns (16 = room for the scrollbar)

  return (
    <View style={[styles.builder, { padding: pad, gap }]}>
      {/* ---- Left: sticker panel ---- */}
      <View style={{ width: panelW, height: height - pad * 2 }}>
        <Text style={[styles.hint, { fontSize: compact ? 17 : 26 }]}>Tap a sticker below to add it to the scene.</Text>
        <ScrollView
          style={styles.panelScroll}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator
          persistentScrollbar // Android: keep the scrollbar visible
          indicatorStyle="black"
        >
          {scene.stickers.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => add(s.id)}
              accessibilityRole="button"
              accessibilityLabel={`Add ${s.label}`}
              style={({ pressed }) => [styles.card, { width: cardW, opacity: pressed ? 0.7 : 1 }]}
            >
              <Image source={s.image} style={{ width: cardW - 12, height: cardW * 0.8 }} contentFit="contain" />
              <Text style={[styles.cardLabel, { fontSize: compact ? 13 : 17 }]} numberOfLines={2}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* ---- Right: scene + tools ---- */}
      <View style={[styles.right, { gap: compact ? 8 : 16 }]}>
        <View style={[styles.scene, { width: sceneW, height: sceneH, borderWidth: compact ? 3 : 6 }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelected(null)} accessibilityLabel="Scene">
            <Image source={scene.background} style={styles.background} contentFit="cover" />
          </Pressable>
          {placed.map((p) => (
            <PlacedSticker
              key={p.uid}
              placed={p}
              sticker={stickerById[p.stickerId]}
              sceneW={sceneW - (compact ? 6 : 12)}
              sceneH={sceneH - (compact ? 6 : 12)}
              selected={p.uid === selected}
              rotated={rotated}
              onSelect={select}
              onMove={(uid, x, y) => update(uid, { x, y })}
              onScale={(uid, scale) => update(uid, { scale })}
            />
          ))}
        </View>

        {/* Tool buttons only show while a sticker is selected. The row keeps its
            height when hidden, so the scene doesn't jump. */}
        <View style={[styles.tools, { height: toolsH, gap: compact ? 6 : 12 }]}>
          {current && (
            <>
              <Tool label="−  Smaller" onPress={() => resize(1 / 1.2)} compact={compact} />
              <Tool label="+  Bigger" onPress={() => resize(1.2)} compact={compact} />
              <Tool label="↔  Flip" onPress={() => update(current.uid, { flipped: !current.flipped })} compact={compact} />
              <Tool label="✕  Remove" onPress={remove} compact={compact} danger />
              <Tool
                label="Clear all"
                onPress={() => {
                  setPlaced([]);
                  setSelected(null);
                }}
                compact={compact}
                outline
              />
            </>
          )}
        </View>
      </View>
    </View>
  );
}

type ToolProps = { label: string; onPress: () => void; disabled?: boolean; danger?: boolean; outline?: boolean; compact: boolean };

function Tool({ label, onPress, disabled, danger, outline, compact }: ToolProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label.replace(/^\W+/, "")}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.tool,
        compact && styles.toolCompact,
        danger && styles.toolDanger,
        outline && styles.toolOutline,
        { opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
      ]}
    >
      <Text style={[styles.toolText, { fontSize: compact ? 14 : 20 }, outline && styles.toolOutlineText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, overflow: "hidden" },
  message: { fontSize: 20, textAlign: "center", marginTop: 40, color: colors.text },
  builder: { flex: 1, flexDirection: "row" },
  hint: { color: colors.text, textAlign: "center", marginBottom: 10 },
  panelScroll: { flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingRight: 16, paddingBottom: 12 },
  card: {
    alignItems: "center",
    gap: 2,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: "#E8DDC4",
  },
  cardLabel: { fontWeight: "bold", color: colors.text, textAlign: "center" },
  right: { flex: 1, alignItems: "center" },
  scene: { borderColor: sectionColors.games, backgroundColor: colors.white, overflow: "hidden" },
  background: { width: "100%", height: "100%" },
  tools: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  tool: { backgroundColor: sectionColors.games, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 22 },
  toolCompact: { borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10 },
  toolDanger: { backgroundColor: "#C2453A" },
  toolOutline: { backgroundColor: colors.white, borderWidth: 2, borderColor: sectionColors.games },
  toolText: { color: colors.white, fontWeight: "bold" },
  toolOutlineText: { color: sectionColors.games },
});
