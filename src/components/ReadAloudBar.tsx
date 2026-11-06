import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ReadAloudState } from "@/hooks/useReadAloud";
import { colors } from "@/constants/theme";

type Props = {
  state: ReadAloudState;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
};

// "Read to me" controls at the top of a story.
export default function ReadAloudBar({ state, onPlay, onPause, onStop }: Props) {
  const readingAll = state.status === "playing" && state.mode === "all";
  const readingOne = state.status === "playing" && state.mode === "one";

  return (
    <View style={styles.bar}>
      {state.status === "idle" && <Big label="🔊  Read to me" onPress={onPlay} />}
      {readingAll && <Big label="⏸  Pause" onPress={onPause} />}
      {state.status === "paused" && <Big label="▶  Keep reading" onPress={onPlay} />}
      {readingOne && <Big label="🔊  Read whole story" onPress={onPlay} />}
      {state.status !== "idle" && (
        <Pressable
          onPress={onStop}
          accessibilityRole="button"
          accessibilityLabel="Stop reading"
          style={({ pressed }) => [styles.stop, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={styles.stopText}>⏹  Stop</Text>
        </Pressable>
      )}
    </View>
  );
}

function Big({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label.replace(/^\W+/, "")}
      style={({ pressed }) => [styles.big, { opacity: pressed ? 0.8 : 1 }]}
    >
      <Text style={styles.bigText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", gap: 10 },
  big: {
    flex: 1, // takes the space left next to Stop, so both stay on one line
    backgroundColor: colors.gold,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  bigText: { fontSize: 19, fontWeight: "bold", color: colors.blueDark, textAlign: "center" },
  stop: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.blue,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  stopText: { fontSize: 18, fontWeight: "bold", color: colors.blue },
});
