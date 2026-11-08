import Svg, { Line, Path } from "react-native-svg";

// Small drawn icons, so they look the same on iOS, Android and the web
// (emoji look different on every device). All drawn on a 24 x 24 grid.

type IconProps = { size: number; color: string };

// Curved "go back one step" arrow
export function UndoIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6.5 8.5h9a5.25 5.25 0 0 1 0 10.5H6.5" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10.5 4 6 8.5l4.5 4.5" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Three arrows chasing each other around a triangle (recycle / start over)
export function RecycleIcon({ size, color }: IconProps) {
  const c = 12;
  const r = 10;
  const corners = [-90, 30, 150].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return { x: c + r * Math.cos(a), y: c + r * Math.sin(a) };
  });
  const arrows = corners.map((from, i) => {
    const to = corners[(i + 1) % 3];
    // Leave a gap at each corner, then put an arrowhead on the end
    const sx = from.x + (to.x - from.x) * 0.16;
    const sy = from.y + (to.y - from.y) * 0.16;
    const ex = from.x + (to.x - from.x) * 0.84;
    const ey = from.y + (to.y - from.y) * 0.84;
    const ang = Math.atan2(ey - sy, ex - sx);
    const head = 3.6;
    const h1 = { x: ex - head * Math.cos(ang - 0.6), y: ey - head * Math.sin(ang - 0.6) };
    const h2 = { x: ex - head * Math.cos(ang + 0.6), y: ey - head * Math.sin(ang + 0.6) };
    return `M${sx.toFixed(2)} ${sy.toFixed(2)}L${ex.toFixed(2)} ${ey.toFixed(2)}M${h1.x.toFixed(2)} ${h1.y.toFixed(2)}L${ex.toFixed(2)} ${ey.toFixed(2)}L${h2.x.toFixed(2)} ${h2.y.toFixed(2)}`;
  });
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={arrows.join("")} stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Red X (eraser)
export function CrossIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1={5} y1={5} x2={19} y2={19} stroke={color} strokeWidth={3.2} strokeLinecap="round" />
      <Line x1={19} y1={5} x2={5} y2={19} stroke={color} strokeWidth={3.2} strokeLinecap="round" />
    </Svg>
  );
}
