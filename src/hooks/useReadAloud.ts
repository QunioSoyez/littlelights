import * as Speech from "expo-speech";
import { useCallback, useEffect, useRef, useState } from "react";

// Reads text aloud with the device's built-in voice (expo-speech).
//
// - playAll(): read every paragraph from the start (or keep going after Pause)
// - playOne(i): read just paragraph i
// - pause(): stop and remember the place, so playAll() continues from there
// - stop(): stop and forget the place
//
// Paragraphs are spoken one sentence at a time. That keeps each piece short
// (some browsers cut off long speech) and lets Pause resume mid-paragraph.
// Pause works by stopping and restarting, because Android has no real pause.

export type ReadAloudState = {
  status: "idle" | "playing" | "paused";
  mode: "all" | "one";
  paragraph: number | null; // paragraph being read (for highlighting)
};

const VOICE_OPTIONS: Speech.SpeechOptions = {
  language: "en-US",
  rate: 0.9, // a little slower than normal for young listeners
};

function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) ?? [text];
  return parts.map((p) => p.trim()).filter(Boolean);
}

export function useReadAloud(paragraphs: string[]) {
  const [state, setState] = useState<ReadAloudState>({ status: "idle", mode: "all", paragraph: null });

  // Where we are: paragraph + sentence. A run id lets us ignore callbacks from
  // speech that was already stopped.
  const pos = useRef({ paragraph: 0, sentence: 0 });
  const runId = useRef(0);
  const sentences = useRef<string[][]>([]);
  sentences.current = paragraphs.map(splitSentences);

  const speakFrom = useCallback((mode: "all" | "one", paragraph: number, sentence: number) => {
    const run = ++runId.current;
    pos.current = { paragraph, sentence };
    setState({ status: "playing", mode, paragraph });

    const step = () => {
      if (run !== runId.current) return; // stopped or restarted meanwhile
      let { paragraph: p, sentence: s } = pos.current;
      // Move past the end of a paragraph
      while (p < sentences.current.length && s >= sentences.current[p].length) {
        if (mode === "one") p = sentences.current.length; // reading one paragraph only: finish
        else {
          p += 1;
          s = 0;
        }
      }
      if (p >= sentences.current.length) {
        pos.current = { paragraph: 0, sentence: 0 };
        setState({ status: "idle", mode, paragraph: null });
        return;
      }
      pos.current = { paragraph: p, sentence: s };
      setState({ status: "playing", mode, paragraph: p });
      Speech.speak(sentences.current[p][s], {
        ...VOICE_OPTIONS,
        onDone: () => {
          if (run !== runId.current) return;
          pos.current = { paragraph: p, sentence: s + 1 };
          step();
        },
        onError: () => {
          if (run !== runId.current) return;
          runId.current++;
          setState({ status: "idle", mode, paragraph: null });
        },
      });
    };
    step();
  }, []);

  const playAll = useCallback(() => {
    // Continue after Pause; otherwise start at the top
    if (state.status === "paused" && state.mode === "all") {
      speakFrom("all", pos.current.paragraph, pos.current.sentence);
    } else {
      Speech.stop();
      speakFrom("all", 0, 0);
    }
  }, [speakFrom, state.status, state.mode]);

  const playOne = useCallback(
    (paragraph: number) => {
      Speech.stop();
      speakFrom("one", paragraph, 0);
    },
    [speakFrom]
  );

  const pause = useCallback(() => {
    runId.current++; // ignore the stopped speech's callbacks
    Speech.stop();
    setState((s) => ({ ...s, status: "paused" }));
  }, []);

  const stop = useCallback(() => {
    runId.current++;
    Speech.stop();
    pos.current = { paragraph: 0, sentence: 0 };
    setState({ status: "idle", mode: "all", paragraph: null });
  }, []);

  // Stop talking when the screen closes or the story changes
  useEffect(() => {
    pos.current = { paragraph: 0, sentence: 0 };
    setState({ status: "idle", mode: "all", paragraph: null });
    return () => {
      runId.current++;
      Speech.stop();
    };
  }, [paragraphs]);

  return { state, playAll, playOne, pause, stop };
}
