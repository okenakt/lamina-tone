import type { ReactNode } from "react";
import { clamp } from "./clamp";
import { Geometry } from "./geometry";
import { Track } from "./track";

const rectGeometry = (
  left: number,
  right: number,
  top: number,
  bottom: number,
): Geometry => ({
  valueAt: (r, x, y) => [
    left + clamp((x - r.left) / r.width) * (right - left),
    bottom - clamp((y - r.top) / r.height) * (bottom - top),
  ],
  placeHandle: ([x, y]) => ({
    left: `${((x - left) / (right - left)) * 100}%`,
    top: `${(1 - (y - top) / (bottom - top)) * 100}%`,
  }),
  distance: (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]),
});

type PadProps = {
  values: [number, number][];
  onChange: (index: number, value: [number, number]) => void;
  xMax: number;
  yMax: number;
  xMin?: number;
  yMin?: number;
  className?: string;
  children?: ReactNode;
};

export const Pad = ({
  values,
  onChange,
  xMax,
  yMax,
  xMin = 0,
  yMin = 0,
  className = "",
  children,
}: PadProps) => (
  <Track
    geometry={rectGeometry(xMin, xMax, yMin, yMax)}
    values={values}
    onChange={(i, [x, y]) => onChange(i, [x, y])}
    className={`relative h-full w-full cursor-crosshair touch-none overflow-hidden rounded-md select-none ${className}`}
  >
    {children}
  </Track>
);
