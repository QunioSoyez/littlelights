import { createContext, useContext, useState, type ReactNode } from "react";
import { Linking, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, sectionColors } from "@/constants/theme";

// Parent gate: a "grown-ups only" multiplication question shown before anything
// that leaves the app (websites, email). Apple Kids and Google Families require it.
// Right answer -> opens the link. Wrong answer -> just closes (no hints, no retry).

type Question = { a: number; b: number; choices: number[] };

function makeQuestion(): Question {
  const pick = () => 6 + Math.floor(Math.random() * 7); // 6..12
  const a = pick();
  const b = pick();
  const answer = a * b;
  // Wrong answers that look believable: neighbours in the times table
  const wrong = new Set<number>();
  const nearby = [answer + a, answer - a, answer + b, answer - b, answer + 10, answer - 10, answer + 2, answer - 2];
  for (const n of nearby.sort(() => Math.random() - 0.5)) {
    if (n > 0 && n !== answer) wrong.add(n);
    if (wrong.size === 3) break;
  }
  const choices = [answer, ...wrong].sort(() => Math.random() - 0.5);
  return { a, b, choices };
}

type Props = {
  visible: boolean;
  onPass: () => void;
  onClose: () => void;
};

export function ParentGate({ visible, onPass, onClose }: Props) {
  // A new question every time the gate opens
  const [question, setQuestion] = useState<Question>(makeQuestion);
  const [lastVisible, setLastVisible] = useState(visible);
  if (visible !== lastVisible) {
    setLastVisible(visible);
    if (visible) setQuestion(makeQuestion());
  }

  const answer = question.a * question.b;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close">
        {/* Inner Pressable stops taps on the card from closing it */}
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>Grown-ups only</Text>
          <Text style={styles.text}>To continue, please answer:</Text>
          <Text style={styles.question}>
            {question.a} × {question.b} = ?
          </Text>
          <View style={styles.choices}>
            {question.choices.map((c) => (
              <Pressable
                key={c}
                style={({ pressed }) => [styles.choice, pressed && styles.pressed]}
                onPress={() => (c === answer ? onPass() : onClose())}
                accessibilityRole="button"
              >
                <Text style={styles.choiceText}>{c}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
            onPress={onClose}
            accessibilityRole="button"
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function openUrl(url: string) {
  if (Platform.OS === "web" && url.startsWith("http")) {
    window.open(url, "_blank", "noopener");
  } else {
    Linking.openURL(url);
  }
}

// One gate per screen. Wrap the screen in <ParentGateProvider>, then use <GatedLink>
// anywhere inside it. (The pop-up must not live inside a <Text>, or it picks up the
// paragraph's text styles on web and can misbehave on phones.)
const GateContext = createContext<(url: string) => void>(openUrl);

export function ParentGateProvider({ children }: { children: ReactNode }) {
  const [url, setUrl] = useState<string | null>(null);
  return (
    <GateContext.Provider value={setUrl}>
      {children}
      <ParentGate
        visible={url !== null}
        onPass={() => {
          if (url) openUrl(url);
          setUrl(null);
        }}
        onClose={() => setUrl(null)}
      />
    </GateContext.Provider>
  );
}

// A tappable link inside text that asks the parent-gate question first.
export function GatedLink({ url, children, style }: { url: string; children: ReactNode; style?: object }) {
  const askGate = useContext(GateContext);
  return (
    <Text accessibilityRole="link" onPress={() => askGate(url)} style={[styles.link, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    gap: 12,
    alignItems: "center",
    cursor: "auto",
  },
  title: { fontSize: 26, fontWeight: "bold", color: sectionColors.bible },
  text: { fontSize: 18, color: colors.text },
  question: { fontSize: 36, fontWeight: "bold", color: colors.text, marginVertical: 4 },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center" },
  choice: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.goldLight,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceText: { fontSize: 26, fontWeight: "bold", color: colors.text },
  cancel: { marginTop: 4, paddingVertical: 10, paddingHorizontal: 24 },
  cancelText: { fontSize: 18, color: colors.textLight, textDecorationLine: "underline" },
  pressed: { opacity: 0.6 },
  link: { color: colors.blue, textDecorationLine: "underline" },
});
