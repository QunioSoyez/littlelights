import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";
import { pulsoIcons, type IconMotion, type IconSpec, type PulsoIconName } from "@/content/pulsoIcons";

// Animated outline icon (PulsoIcon shapes + motion, drawn with react-native-svg so it
// works on phones and the web). The icon plays its little animation once each time
// `playKey` changes to a new number above 0. Skipped when the device asks for reduced motion.
//
//   <PulsoIcon name="sun" size={52} color="white" playKey={n} />

type Props = {
  name: PulsoIconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  playKey?: number;
};

export default function PulsoIcon({ name, size = 24, color = "#000", strokeWidth = 2, playKey = 0 }: Props) {
  const icon: IconSpec = pulsoIcons[name];
  const [time, setTime] = useState<number | null>(null); // seconds since the animation started
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduceMotion)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!playKey || reduceMotion) return;
    const motions = [icon.svg, ...icon.nodes.map((n) => n[2])];
    const total = Math.max(...motions.map((m) => (m ? recipe(m).delay + recipe(m).duration : 0))) + 0.05;
    const start = Date.now();
    let frame = 0;
    const tick = () => {
      const t = (Date.now() - start) / 1000;
      if (t >= total) {
        setTime(null);
        return;
      }
      setTime(t);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playKey, reduceMotion, icon]);

  const outer = time !== null && icon.svg ? pose(icon.svg, time) : null;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <G transform={outer?.transform} opacity={outer?.opacity}>
        {icon.nodes.map(([kind, attrs, motion], i) => {
          const p = time !== null && motion ? pose(motion, time, attrs.d) : null;
          const shape =
            kind === "circle" ? (
              <Circle cx={attrs.cx} cy={attrs.cy} r={attrs.r} />
            ) : (
              <Path d={attrs.d} strokeDasharray={p?.dash?.array} strokeDashoffset={p?.dash?.offset} />
            );
          return (
            <G key={i} transform={p?.transform} opacity={p?.opacity}>
              {shape}
            </G>
          );
        })}
      </G>
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Motion recipes (same keyframes as PulsoIcon's recipes.js). Values are spread evenly
// over `duration` seconds after `delay`, with ease-in-out between keyframes.

type Tracks = {
  rotate?: number[];
  scale?: number[];
  scaleX?: number[];
  scaleY?: number[];
  x?: number[];
  y?: number[];
  opacity?: number[];
  draw?: number[]; // 0..1 of the stroke drawn
};
type Recipe = { duration: number; delay: number; tracks: Tracks };

function recipe(m: IconMotion): Recipe {
  const delay = m.d ?? 0;
  const a = m.a;
  const x = m.x ?? 0;
  const y = m.y ?? 0;
  switch (m.r) {
    case "draw":
      return { duration: 0.55, delay, tracks: { draw: [0, 1], opacity: [0, 1] } };
    case "press":
      return { duration: 0.4, delay, tracks: { scale: [1, 1 - (a || 0.15), 1.05, 1] } };
    case "spin":
      return { duration: 0.8, delay, tracks: { rotate: [0, a || 360] } };
    case "beat": {
      const b = a || 0.16;
      return { duration: 0.65, delay, tracks: { scale: [1, 1 + b, 1 - b * 0.3, 1 + b * 0.6, 1] } };
    }
    case "pulse":
      return { duration: 0.6, delay, tracks: { scale: [1, 1 + (a || 0.08), 1] } };
    case "slide": {
      const s = a || 2.5;
      return { duration: 0.5, delay, tracks: { x: [0, x * s, 0], y: [0, y * s, 0] } };
    }
    case "bounce": {
      const s = a || 3;
      return { duration: 0.6, delay, tracks: { x: [0, x * s, 0, x * s * 0.4, 0], y: [0, y * s, 0, y * s * 0.4, 0] } };
    }
    case "swing": {
      const s = a || 10;
      return { duration: 0.8, delay, tracks: { rotate: [0, s, -s * 0.75, s * 0.4, 0] } };
    }
    case "blink":
      return { duration: 0.35, delay, tracks: { scaleY: [1, 0.1, 1] } };
    case "fold":
      return { duration: 0.6, delay, tracks: { scaleY: [1, -1, 1] } };
    case "fade":
      return { duration: 0.5, delay, tracks: { opacity: [1, 0.15, 1] } };
    case "wobble": {
      const s = a || 8;
      return { duration: 0.6, delay, tracks: { rotate: [0, -s, s, 0], scale: [1, 1.08, 1.08, 1] } };
    }
    default:
      return { duration: 0, delay: 0, tracks: {} }; // not used by our icons yet
  }
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function sample(values: number[] | undefined, progress: number, fallback: number): number {
  if (!values) return fallback;
  if (progress <= 0) return values[0];
  if (progress >= 1) return values[values.length - 1];
  const segs = values.length - 1;
  const pos = progress * segs;
  const i = Math.min(Math.floor(pos), segs - 1);
  return values[i] + (values[i + 1] - values[i]) * easeInOut(pos - i);
}

function pose(m: IconMotion, time: number, d?: string) {
  const r = recipe(m);
  const progress = r.duration ? (time - r.delay) / r.duration : 1;
  const tr = r.tracks;
  const [ox, oy] = m.o ?? [12, 12];
  const scale = sample(tr.scale, progress, 1);
  const sx = scale * sample(tr.scaleX, progress, 1);
  const sy = scale * sample(tr.scaleY, progress, 1);
  const rot = sample(tr.rotate, progress, 0);
  const tx = sample(tr.x, progress, 0);
  const ty = sample(tr.y, progress, 0);
  const transform = `translate(${ox + tx} ${oy + ty}) rotate(${rot}) scale(${sx} ${sy}) translate(${-ox} ${-oy})`;
  const opacity = tr.opacity ? sample(tr.opacity, progress, 1) : undefined;
  let dash: { array: string; offset: number } | undefined;
  if (tr.draw && d) {
    const len = lineLength(d);
    dash = { array: `${len} ${len}`, offset: len * (1 - sample(tr.draw, progress, 1)) };
  }
  return { transform, opacity, dash };
}

// Length of a simple straight-line path (M, h, v, l commands) for the "draw" motion.
function lineLength(d: string): number {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+/g) ?? [];
  let len = 0;
  let cmd = "";
  for (let i = 0; i < tokens.length; ) {
    const t = tokens[i];
    if (/[a-zA-Z]/.test(t)) {
      cmd = t;
      i++;
      continue;
    }
    const n = (k: number) => parseFloat(tokens[i + k]);
    if (cmd === "M" || cmd === "m") i += 2;
    else if (cmd === "h" || cmd === "v") (len += Math.abs(n(0))), (i += 1);
    else if (cmd === "l") (len += Math.hypot(n(0), n(1))), (i += 2);
    else i++;
  }
  return len || 24;
}
