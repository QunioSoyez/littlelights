import { Stack, useLocalSearchParams } from "expo-router";
import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import ColoringCanvas from "@/components/ColoringCanvas";
import { CrossIcon, RecycleIcon, UndoIcon } from "@/components/Icons";
import LandscapeStage from "@/components/LandscapeStage";
import PatternBackground from "@/components/PatternBackground";
import { coloringPages, getColoringPage, type ColoringPage } from "@/content/coloringPages";
import { colors, sectionColors } from "@/constants/theme";

// Pre-build one web page per coloring page (the web site uses static output)
export function generateStaticParams(): { id: string }[] {
  return coloringPages.map((p) => ({ id: p.id }));
}

// Crayon box: bright colors plus skin, hair and earth tones
const PALETTE = [
  "#E53935", "#FB8C00", "#FDD835", "#C0CA33",
  "#43A047", "#00897B", "#4FC3F7", "#1E88E5",
  "#3949AB", "#8E24AA", "#EC407A", "#F8BBD0",
  "#FFE0B2", "#E0A878", "#8D5524", "#8D6E63",
  "#5D4037", "#9E9E9E",
];
const ERASER = "eraser";

// Coloring book: color palette on the left, the page on the right.
// LandscapeStage turns it sideways on phones held upright.
export default function ColoringScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const page = getColoringPage(id);

  if (!page) {
    return (
      <PatternBackground>
        <Stack.Screen options={{ title: "Page not found" }} />
        <Text style={styles.message}>We couldn't find that coloring page.</Text>
      </PatternBackground>
    );
  }

  return (
    <PatternBackground>
      <Stack.Screen options={{ title: page.title }} />
      <LandscapeStage>
        {({ width, height, rotated }) => <Coloring page={page} width={width} height={height} rotated={rotated} />}
      </LandscapeStage>
    </PatternBackground>
  );
}

function Coloring({ page, width, height, rotated }: { page: ColoringPage; width: number; height: number; rotated: boolean }) {
  const [color, setColor] = useState(PALETTE[0]);
  const [fills, setFills] = useState<Record<number, string>>({});
  const [history, setHistory] = useState<Record<number, string>[]>([]); // for Undo

  // ---- sizes (worked out from the measured space) ----
  const compact = height < 520;
  const pad = compact ? 10 : 20;
  const gap = compact ? 12 : 24;
  const panelW = Math.round(Math.min(Math.max(width * 0.26, 170), 340));
  const areaW = width - panelW - pad * 2 - gap;
  const areaH = height - pad * 2;
  const aspect = page.data.width / page.data.height;
  const pageW = Math.max(120, Math.min(areaW, areaH * aspect));
  const pageH = pageW / aspect;
  const swatch = (panelW - 3 * 8 - 8) / 4; // 4 across

  function tap(area: number) {
    const next = { ...fills };
    if (color === ERASER) {
      if (!(area in next)) return;
      delete next[area];
    } else {
      if (next[area] === color) return;
      next[area] = color;
    }
    setHistory((h) => [...h.slice(-49), fills]);
    setFills(next);
  }

  function undo() {
    if (!history.length) return;
    setFills(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
  }

  function startOver() {
    if (!Object.keys(fills).length) return;
    setHistory((h) => [...h.slice(-49), fills]); // Undo can bring it back
    setFills({});
  }

  return (
    <View style={[styles.layout, { padding: pad, gap }]}>
      {/* ---- Left: crayon box ---- */}
      <View style={{ width: panelW, height: height - pad * 2 }}>
        <Text style={[styles.hint, { fontSize: compact ? 16 : 22 }]}>Pick a color, then tap the picture.</Text>
        <ScrollView contentContainerStyle={styles.palette} showsVerticalScrollIndicator persistentScrollbar>
          {PALETTE.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              accessibilityRole="button"
              accessibilityLabel={`Color ${c}`}
              accessibilityState={{ selected: color === c }}
              style={[
                styles.swatch,
                { width: swatch, height: swatch, backgroundColor: c },
                color === c && styles.swatchSelected,
              ]}
            />
          ))}
          <Pressable
            onPress={() => setColor(ERASER)}
            accessibilityRole="button"
            accessibilityLabel="Eraser"
            accessibilityState={{ selected: color === ERASER }}
            style={[styles.swatch, styles.eraser, { width: swatch, height: swatch }, color === ERASER && styles.swatchSelected]}
          >
            <CrossIcon size={swatch * 0.55} color="#D32F2F" />
          </Pressable>

          <View style={styles.actions}>
            <Action name="Undo" onPress={undo} disabled={!history.length} compact={compact}>
              <UndoIcon size={compact ? 30 : 46} color={colors.white} />
            </Action>
            <Action name="Start over" onPress={startOver} disabled={!Object.keys(fills).length} compact={compact} danger>
              <RecycleIcon size={compact ? 30 : 46} color={colors.white} />
            </Action>
          </View>
        </ScrollView>
      </View>

      {/* ---- Right: the page ---- */}
      <View style={styles.right}>
        <View style={[styles.pageFrame, { padding: compact ? 3 : 5 }]}>
          <ColoringCanvas page={page} width={pageW - (compact ? 6 : 10)} height={pageH - (compact ? 6 : 10)} rotated={rotated} fills={fills} onTap={tap} />
        </View>
      </View>
    </View>
  );
}

type ActionProps = { name: string; onPress: () => void; disabled: boolean; compact: boolean; danger?: boolean; children: ReactNode };

// Icon-only button (the name is still read out by screen readers)
function Action({ name, onPress, disabled, compact, danger, children }: ActionProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={name}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.action,
        compact && styles.actionCompact,
        danger && styles.actionDanger,
        { opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  message: { fontSize: 20, textAlign: "center", marginTop: 40, color: colors.text },
  layout: { flex: 1, flexDirection: "row", userSelect: "none" }, // web: no blue highlight while tapping
  hint: { color: colors.text, textAlign: "center", marginBottom: 10 },
  palette: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingRight: 8, paddingBottom: 12 },
  swatch: { borderRadius: 14, borderWidth: 3, borderColor: colors.white },
  swatchSelected: { borderColor: colors.text, borderWidth: 4, transform: [{ scale: 1.08 }] },
  eraser: { backgroundColor: colors.white, borderColor: "#CFCFCF", alignItems: "center", justifyContent: "center" },
  actions: { width: "100%", flexDirection: "row", gap: 8, marginTop: 6 },
  action: { flex: 1, backgroundColor: sectionColors.games, borderRadius: 14, paddingVertical: 8, alignItems: "center", justifyContent: "center" },
  actionCompact: { borderRadius: 10, paddingVertical: 4 },
  actionDanger: { backgroundColor: "#D32F2F" },
  right: { flex: 1, alignItems: "center", justifyContent: "center" },
  pageFrame: { backgroundColor: sectionColors.games, borderRadius: 8 },
});
