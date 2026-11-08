import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import LandscapeStage from "@/components/LandscapeStage";
import PatternBackground from "@/components/PatternBackground";
import PuzzlePiece from "@/components/PuzzlePiece";
import { getPuzzle, puzzles, type Puzzle } from "@/content/puzzles";
import { colors, sectionColors } from "@/constants/theme";

// Pre-build one web page per puzzle (the web site uses static output)
export function generateStaticParams(): { id: string }[] {
  return puzzles.map((p) => ({ id: p.id }));
}

// Puzzle: loose pieces on the left, the board on the right. Drag each piece to its
// spot; it snaps in when it's close. LandscapeStage turns it sideways on upright phones.
export default function PuzzleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const puzzle = getPuzzle(id);

  if (!puzzle) {
    return (
      <PatternBackground>
        <Stack.Screen options={{ title: "Puzzle not found" }} />
        <Text style={styles.message}>We couldn't find that puzzle.</Text>
      </PatternBackground>
    );
  }

  return (
    <PatternBackground>
      <Stack.Screen options={{ title: puzzle.title }} />
      <LandscapeStage>
        {({ width, height, rotated }) => <PuzzleGame puzzle={puzzle} width={width} height={height} rotated={rotated} />}
      </LandscapeStage>
    </PatternBackground>
  );
}

function shuffled(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Layout = { x: number; y: number; w: number; h: number };

function PuzzleGame({ puzzle, width, height, rotated }: { puzzle: Puzzle; width: number; height: number; rotated: boolean }) {
  const count = puzzle.cols * puzzle.rows;
  const [order, setOrder] = useState(() => shuffled(count)); // order[slot] = piece number
  const [placed, setPlaced] = useState<boolean[]>(() => Array(count).fill(false));
  const [dragging, setDragging] = useState<number | null>(null);
  const done = placed.every(Boolean);

  // ---- sizes (worked out from the measured space) ----
  const compact = height < 520;
  const pad = compact ? 10 : 20;
  const gap = compact ? 14 : 28;
  const hintH = compact ? 50 : 80;
  const statusH = compact ? 44 : 64; // includes room for the board's frame
  const panelW = Math.round(Math.min(Math.max(width * 0.32, 190), 460));

  // Board: as big as fits on the right
  const areaW = width - panelW - pad * 2 - gap;
  const areaH = height - pad * 2 - statusH;
  const boardW = Math.max(120, Math.min(areaW, areaH * puzzle.aspect));
  const boardH = boardW / puzzle.aspect;
  const board: Layout = { x: pad + panelW + gap + (areaW - boardW) / 2, y: pad + 4, w: boardW, h: boardH };
  const cellW = boardW / puzzle.cols;
  const cellH = boardH / puzzle.rows;

  // Tray: pick the number of columns that makes the loose pieces as big as possible
  const tray: Layout = { x: pad, y: pad + hintH, w: panelW, h: height - pad * 2 - hintH };
  const tgap = compact ? 6 : 10;
  const pieceAspect = cellW / cellH;
  let best = { cols: 1, w: 0 };
  for (let c = 1; c <= 6; c++) {
    const r = Math.ceil(count / c);
    const w = Math.min((tray.w - (c - 1) * tgap) / c, ((tray.h - (r - 1) * tgap) / r) * pieceAspect);
    if (w > best.w) best = { cols: c, w };
  }
  const trayPieceW = Math.min(best.w, cellW); // never bigger than on the board
  const trayPieceH = trayPieceW / pieceAspect;

  // Loose pieces close up toward the top of the tray as pieces get placed
  const slotOf = (piece: number) => order.filter((p) => !placed[p]).indexOf(piece);
  const slotCenter = (slot: number) => ({
    x: tray.x + (slot % best.cols) * (trayPieceW + tgap) + trayPieceW / 2,
    y: tray.y + Math.floor(slot / best.cols) * (trayPieceH + tgap) + trayPieceH / 2,
  });
  const cellOf = (piece: number) => ({ col: piece % puzzle.cols, row: Math.floor(piece / puzzle.cols) });

  function dropped(piece: number, dx: number, dy: number) {
    setDragging(null);
    // While dragging, the piece is drawn at board size, centered on its tray spot
    const start = slotCenter(slotOf(piece));
    const { col, row } = cellOf(piece);
    const target = { x: board.x + (col + 0.5) * cellW, y: board.y + (row + 0.5) * cellH };
    const dist = Math.hypot(start.x + dx - target.x, start.y + dy - target.y);
    if (dist < Math.min(cellW, cellH) * 0.45) {
      setPlaced((p) => p.map((v, i) => (i === piece ? true : v)));
    }
  }

  function playAgain() {
    setOrder(shuffled(count));
    setPlaced(Array(count).fill(false));
  }

  const done_count = placed.filter(Boolean).length;
  // Draw the piece being dragged last, so it's on top
  const drawOrder = Array.from({ length: count }, (_, i) => i).sort((a, b) => (a === dragging ? 1 : b === dragging ? -1 : 0));

  return (
    <View style={[styles.game, { width, height }]}>
      <Text style={[styles.hint, { left: pad, top: pad, width: panelW, fontSize: compact ? 16 : 24 }]}>
        Drag each piece to its place in the picture.
      </Text>

      {/* Board: green frame, faint picture + grid lines to help */}
      <View style={[styles.frame, { left: board.x - 4, top: board.y - 4, width: boardW + 8, height: boardH + 8 }]} />
      <View style={[styles.board, { left: board.x, top: board.y, width: boardW, height: boardH }]} accessibilityLabel="Puzzle board">
        <Image source={puzzle.image} style={styles.ghost} contentFit="fill" />
        {Array.from({ length: count }, (_, i) => {
          const { col, row } = cellOf(i);
          return <View key={i} style={[styles.cell, { left: col * cellW, top: row * cellH, width: cellW, height: cellH }]} />;
        })}
      </View>

      {drawOrder.map((piece) => {
        const { col, row } = cellOf(piece);
        let pos: Layout;
        if (placed[piece]) {
          pos = { x: board.x + col * cellW, y: board.y + row * cellH, w: cellW, h: cellH };
        } else if (dragging === piece) {
          const c = slotCenter(slotOf(piece));
          pos = { x: c.x - cellW / 2, y: c.y - cellH / 2, w: cellW, h: cellH };
        } else {
          const c = slotCenter(slotOf(piece));
          pos = { x: c.x - trayPieceW / 2, y: c.y - trayPieceH / 2, w: trayPieceW, h: trayPieceH };
        }
        return (
          <PuzzlePiece
            key={piece}
            image={puzzle.image}
            cols={puzzle.cols}
            rows={puzzle.rows}
            col={col}
            row={row}
            left={pos.x}
            top={pos.y}
            width={pos.w}
            height={pos.h}
            placed={placed[piece]}
            rotated={rotated}
            onDragStart={() => setDragging(piece)}
            onDragEnd={(dx, dy) => dropped(piece, dx, dy)}
          />
        );
      })}

      {/* Under the board: progress + start over */}
      <View style={[styles.status, { left: board.x, top: board.y + boardH + 4, width: boardW, height: statusH - 8 }]}>
        <Text style={[styles.progress, { fontSize: compact ? 15 : 20 }]}>
          {done_count} of {count} pieces
        </Text>
        {done_count > 0 && !done && (
          <Pressable onPress={playAgain} accessibilityRole="button" style={({ pressed }) => [styles.smallButton, { opacity: pressed ? 0.7 : 1 }]}>
            <Text style={[styles.smallButtonText, { fontSize: compact ? 14 : 18 }]}>Start over</Text>
          </Pressable>
        )}
      </View>

      {/* Finished! */}
      {done && (
        <View style={styles.doneWrap}>
          <View style={styles.doneCard}>
            <Text style={styles.doneStars}>⭐ ⭐ ⭐</Text>
            <Text style={styles.doneTitle}>You did it!</Text>
            <Text style={styles.doneText}>You finished {puzzle.title}.</Text>
            <View style={styles.doneButtons}>
              <Pressable onPress={playAgain} accessibilityRole="button" style={({ pressed }) => [styles.bigButton, { opacity: pressed ? 0.8 : 1 }]}>
                <Text style={styles.bigButtonText}>Play again</Text>
              </Pressable>
              <Pressable
                onPress={() => router.navigate("/games/puzzles")}
                accessibilityRole="button"
                style={({ pressed }) => [styles.bigButton, styles.bigButtonOutline, { opacity: pressed ? 0.8 : 1 }]}
              >
                <Text style={[styles.bigButtonText, { color: sectionColors.games }]}>More puzzles</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  message: { fontSize: 20, textAlign: "center", marginTop: 40, color: colors.text },
  game: { userSelect: "none" }, // web: dragging with a mouse shouldn't highlight the page
  hint: { position: "absolute", color: colors.text, textAlign: "center" },
  frame: { position: "absolute", borderWidth: 4, borderColor: sectionColors.games, borderRadius: 6 },
  board: { position: "absolute", backgroundColor: colors.white, overflow: "hidden" },
  ghost: { width: "100%", height: "100%", opacity: 0.18 },
  cell: { position: "absolute", borderWidth: 1, borderColor: "rgba(46, 158, 106, 0.35)", borderStyle: "dashed" },
  status: { position: "absolute", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14 },
  progress: { fontWeight: "bold", color: colors.text },
  smallButton: { borderWidth: 2, borderColor: sectionColors.games, borderRadius: 12, paddingVertical: 4, paddingHorizontal: 12, backgroundColor: colors.white },
  smallButtonText: { color: sectionColors.games, fontWeight: "bold" },
  doneWrap: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.25)" },
  doneCard: { backgroundColor: colors.cream, borderRadius: 24, padding: 24, alignItems: "center", gap: 8, borderWidth: 3, borderColor: colors.gold, maxWidth: 420 },
  doneStars: { fontSize: 30 },
  doneTitle: { fontSize: 32, fontWeight: "bold", color: sectionColors.games },
  doneText: { fontSize: 20, color: colors.text, textAlign: "center" },
  doneButtons: { flexDirection: "row", gap: 12, marginTop: 10 },
  bigButton: { backgroundColor: sectionColors.games, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 20 },
  bigButtonOutline: { backgroundColor: colors.white, borderWidth: 2, borderColor: sectionColors.games },
  bigButtonText: { color: colors.white, fontSize: 18, fontWeight: "bold" },
});
