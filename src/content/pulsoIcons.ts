// Icon shapes and motion from PulsoIcon 6.1.0 (https://github.com/CityPulso/PulsoIcon), ISC License, (c) 2026 CityPulso.
// Based on Lucide (ISC); "hands-praying" drawn after Phosphor Icons (MIT, (c) 2023 Phosphor Icons);
// "bible" adapted from Tabler Icons (MIT, (c) 2020-2026 Pawel Kuna). Full license: public/licenses/pulsoicon-LICENSE.txt
// Copied here (only the icons we use) because the PulsoIcon packages are web-only; we draw them with react-native-svg.
// To add an icon: copy its "nodes" (and "svg" motion if any) from pulsoicon-core/dist/icons/<name>.js.

export type IconMotion = { r: string; a?: number; d?: number; x?: number; y?: number; o?: [number, number] };
export type IconNode = [kind: "path" | "circle", attrs: Record<string, string>, motion?: IconMotion];
export type IconSpec = { svg?: IconMotion; nodes: IconNode[] };

export const pulsoIcons = {
  "sun": {
    nodes: [
      ["circle", {"cx": "12", "cy": "12", "r": "4"}, {"r": "pulse", "a": 0.1, "o": [12, 12]}],
      ["path", {"d": "M12 2v2"}, {"r": "spin", "a": 90, "o": [12, 12]}],
      ["path", {"d": "M12 20v2"}, {"r": "spin", "a": 90, "o": [12, 12]}],
      ["path", {"d": "m4.93 4.93 1.41 1.41"}, {"r": "spin", "a": 90, "o": [12, 12]}],
      ["path", {"d": "m17.66 17.66 1.41 1.41"}, {"r": "spin", "a": 90, "o": [12, 12]}],
      ["path", {"d": "M2 12h2"}, {"r": "spin", "a": 90, "o": [12, 12]}],
      ["path", {"d": "M20 12h2"}, {"r": "spin", "a": 90, "o": [12, 12]}],
      ["path", {"d": "m6.34 17.66-1.41 1.41"}, {"r": "spin", "a": 90, "o": [12, 12]}],
      ["path", {"d": "m19.07 4.93-1.41 1.41"}, {"r": "spin", "a": 90, "o": [12, 12]}],
    ],
  },
  "apple": {
    svg: {"r": "wobble", "o": [12, 22]},
    nodes: [
      ["path", {"d": "M12 6.528V3a1 1 0 0 1 1-1h0"}, {"r": "swing", "a": 20, "o": [12, 6]}],
      ["path", {"d": "M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21"}],
    ],
  },
  "moon": {
    nodes: [
      ["path", {"d": "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"}, {"r": "swing", "a": 20, "o": [12, 12]}],
    ],
  },
  "heart": {
    nodes: [
      ["path", {"d": "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"}, {"r": "beat", "a": 0.2, "o": [12, 12.492]}],
    ],
  },
  "face-slightly-frowning": {
    nodes: [
      ["path", {"d": "M15 10V9"}, {"r": "blink", "d": 0.05, "o": [12, 9.5]}],
      ["path", {"d": "M9 10V9"}, {"r": "blink", "d": 0.05, "o": [12, 9.5]}],
      ["path", {"d": "M9 16a5 5 0 016 0"}, {"r": "fold", "d": 0.15, "o": [12, 15.5]}],
      ["circle", {"cx": "12", "cy": "12", "r": "10"}, {"r": "press", "a": 0.04, "o": [12, 12]}],
    ],
  },
  "handshake": {
    nodes: [
      ["path", {"d": "m11 17 2 2a1 1 0 1 0 3-3"}, {"r": "bounce", "d": 0.1, "y": -1, "a": 1.5, "o": [13.811, 17.811]}],
      ["path", {"d": "m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"}, {"r": "slide", "x": 1, "a": 1, "o": [13.939, 10.06]}],
      ["path", {"d": "m21 3 1 11h-2"}, {"r": "fade", "d": 0.1, "o": [12.5, 8.5]}],
      ["path", {"d": "M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"}, {"r": "slide", "x": -1, "a": 1, "o": [7.061, 12.061]}],
      ["path", {"d": "M3 4h8"}, {"r": "fade", "d": 0.1, "o": [12.5, 8.5]}],
    ],
  },
  "hands-praying": {
    nodes: [
      ["path", {"d": "M8.5 17.5 12 14V6a2 2 0 0 0-3.85-.77L4.5 13.5"}, {"r": "press", "a": 0.06, "o": [12, 14]}],
      ["path", {"d": "M15.5 17.5 12 14V6a2 2 0 0 1 3.85-.77l3.65 8.27"}, {"r": "press", "a": 0.06, "o": [12, 14]}],
      ["path", {"d": "M4.5 13.5l4 4-2 2-4-4Z"}, {"r": "press", "a": 0.06, "o": [12, 14]}],
      ["path", {"d": "m19.5 13.5-4 4 2 2 4-4Z"}, {"r": "press", "a": 0.06, "o": [12, 14]}],
    ],
  },
  "bible": {
    nodes: [
      ["path", {"d": "M19 4v16h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12"}, {"r": "wobble", "a": 5, "o": [12, 12]}],
      ["path", {"d": "M19 16h-12a2 2 0 0 0 -2 2"}, {"r": "wobble", "a": 5, "o": [12, 12]}],
      ["path", {"d": "M12 7v6"}, {"r": "draw", "d": 0.15}],
      ["path", {"d": "M10 9h4"}, {"r": "draw", "d": 0.3}],
    ],
  },
} satisfies Record<string, IconSpec>;

export type PulsoIconName = keyof typeof pulsoIcons;
