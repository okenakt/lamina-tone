import { Slider } from "@/components/geometry-controls";
import type { ReactNode } from "react";

type RangeSliderProps = {
  min: number;
  max: number;
  value: [number, number]; // [lo, hi]
  onChange: (value: [number, number]) => void;
  gap?: number; // minimum distance kept between the two handles
  background?: string;
  className?: string;
  children?: ReactNode; // decoration drawn behind the dim (e.g. gradient strips)
};

export const RangeSlider = ({
  min,
  max,
  value: [lo, hi],
  onChange,
  gap = 0,
  background,
  className = "",
  children,
}: RangeSliderProps) => {
  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <Slider
      min={min}
      max={max}
      values={[lo, hi]}
      onChange={(index, v) =>
        index === 0
          ? onChange([Math.min(v, hi - gap), hi])
          : onChange([lo, Math.max(v, lo + gap)])
      }
      barStyle={{ background: background ?? "#e5e7eb" }}
      className={className}
    >
      {children}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 rounded-l-full bg-black/40"
        style={{ width: `${pct(lo)}%` }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 rounded-r-full bg-black/40"
        style={{ width: `${100 - pct(hi)}%` }}
      />
    </Slider>
  );
};
