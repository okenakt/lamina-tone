import { clamp } from "@/components/geometry-controls/clamp";
import type { CSSProperties, ReactNode } from "react";
import { Geometry } from "./geometry";
import { Track } from "./track";

const lineGeometry = (min: number, max: number): Geometry => {
  const step = (max - min) / 100;
  return {
    valueAt: (rect, x) => [
      min + clamp((x - rect.left) / rect.width, 0, 1) * (max - min),
    ],
    placeHandle: ([v]) => ({
      left: `${((v - min) / (max - min)) * 100}%`,
      top: "50%",
    }),
    distance: ([a], [b]) => Math.abs(a - b),
    nudge: ([v], dx, dy, coarse) => {
      const dir = dx !== 0 ? dx : dy;
      return [clamp(v + dir * step * (coarse ? 10 : 1), min, max)];
    },
    aria: ([v]) => ({
      valuemin: min,
      valuemax: max,
      valuenow: Math.round(v),
    }),
  };
};

type SliderProps = {
  values: number[];
  onChange: (index: number, value: number) => void;
  max: number;
  min?: number;
  className?: string;
  barStyle?: CSSProperties;
  children?: ReactNode;
  // Accessible name(s) for the handle(s); enables keyboard operation.
  labels?: string[];
};

export const Slider = ({
  values,
  onChange,
  max,
  min = 0,
  className = "",
  barStyle,
  children,
  labels,
}: SliderProps) => (
  <Track
    geometry={lineGeometry(min, max)}
    values={values.map((v) => [v])}
    onChange={(i, [v]) => onChange(i, v)}
    handleLabels={labels}
    className={`relative h-2.5 w-full cursor-pointer touch-none rounded-full select-none ${className}`}
  >
    <div
      className="pointer-events-none absolute inset-0 rounded-full"
      style={barStyle}
    />
    {children}
  </Track>
);
