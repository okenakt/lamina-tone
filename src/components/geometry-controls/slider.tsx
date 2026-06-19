import { clamp } from "@/components/geometry-controls/clamp";
import type { CSSProperties, ReactNode } from "react";
import { Geometry } from "./geometry";
import { Track } from "./track";

const lineGeometry = (min: number, max: number): Geometry => ({
  valueAt: (rect, x) => [
    min + clamp((x - rect.left) / rect.width, 0, 1) * (max - min),
  ],
  placeHandle: ([v]) => ({
    left: `${((v - min) / (max - min)) * 100}%`,
    top: "50%",
  }),
  distance: ([a], [b]) => Math.abs(a - b),
});

type SliderProps = {
  values: number[];
  onChange: (index: number, value: number) => void;
  max: number;
  min?: number;
  className?: string;
  barStyle?: CSSProperties;
  children?: ReactNode;
};

export const Slider = ({
  values,
  onChange,
  max,
  min = 0,
  className = "",
  barStyle,
  children,
}: SliderProps) => (
  <Track
    geometry={lineGeometry(min, max)}
    values={values.map((v) => [v])}
    onChange={(i, [v]) => onChange(i, v)}
    className={`relative h-2.5 w-full cursor-pointer touch-none rounded-full select-none ${className}`}
  >
    <div
      className="pointer-events-none absolute inset-0 rounded-full"
      style={barStyle}
    />
    {children}
  </Track>
);
