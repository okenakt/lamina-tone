import type { CSSProperties, ReactNode } from "react";
import { Geometry } from "./geometry";
import { Track } from "./track";

// Math convention: 0° on the right (+x axis), increasing counterclockwise.
const circlePoint = (cx: number, deg: number, r: number) => {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cx - r * Math.sin(rad) };
};

const pointerAngle = (
  rect: DOMRect,
  cx: number,
  clientX: number,
  clientY: number,
) =>
  ((Math.atan2(-(clientY - rect.top - cx), clientX - rect.left - cx) * 180) /
    Math.PI +
    360) %
  360;

const circleGeometry = (inner: number, outer: number): Geometry => {
  const mid = (inner + outer) / 2;
  return {
    valueAt: (rect, x, y) => [pointerAngle(rect, rect.width / 2, x, y)],
    placeHandle: ([deg]) => {
      const p = circlePoint(0.5, deg, mid); // unit (0..1) coordinates
      return { left: `${p.x * 100}%`, top: `${p.y * 100}%` };
    },
    distance: ([a], [b]) => {
      const d = Math.abs(a - b) % 360;
      return Math.min(d, 360 - d);
    },
    hitStart: (rect, x, y) => {
      const cx = rect.width / 2;
      const r = Math.hypot(x - rect.left - cx, y - rect.top - cx) / rect.width;
      return r >= inner && r <= outer;
    },
    nudge: ([deg], dx, dy, coarse) => {
      const dir = dx !== 0 ? dx : dy;
      return [(deg + dir * (coarse ? 10 : 1) + 360) % 360];
    },
    aria: ([deg]) => ({
      valuemin: 0,
      valuemax: 360,
      valuenow: Math.round(deg),
      valuetext: `${Math.round(deg)} degrees`,
    }),
  };
};

type WheelProps = {
  values: number[];
  onChange: (index: number, value: number) => void;
  inner?: number;
  outer?: number;
  className?: string;
  ringStyle?: CSSProperties;
  children?: ReactNode;
  // Accessible name(s) for the handle(s); enables keyboard operation.
  labels?: string[];
};

export const Wheel = ({
  values,
  onChange,
  inner = 0.4,
  outer = 0.5,
  className = "",
  ringStyle,
  children,
  labels,
}: WheelProps) => {
  // %-based donut mask: `closest-side` makes the radius half the (square) box,
  // so ratio*200% maps a fraction of the box to that radius (outer 0.5 → 100%,
  // touching the sides). No pixel size — the wheel fills its parent.
  const innerPct = inner * 200;
  const outerPct = outer * 200;
  const mask = `radial-gradient(circle closest-side at center, transparent ${innerPct}%, #000 ${innerPct}%, #000 ${outerPct}%, transparent ${outerPct}%)`;

  return (
    <Track
      geometry={circleGeometry(inner, outer)}
      values={values.map((v) => [v])}
      onChange={(i, [v]) => onChange(i, v)}
      handleLabels={labels}
      className={`relative aspect-square cursor-pointer touch-none select-none ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ WebkitMaskImage: mask, maskImage: mask, ...ringStyle }}
      />
      {children}
    </Track>
  );
};
