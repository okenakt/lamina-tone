import { Range } from "@/types";
import { CSSProperties } from "react";
import { AxisControl } from "./axis-control";
import { RangeSlider } from "./range-slider";

type SliderAxisControlProps = {
  title: string;
  size: number;
  range: Range;
  onSizeChange: (change: number) => void;
  onRangeChange: (min: number, max: number) => void;
  createStrips?: Array<(value: number) => string>;
  message?: string;
  messageStyle?: CSSProperties;
};

const GRADIENT_SAMPLES = 10;

const stripGradient = (fn: (value: number) => string) => {
  const stops = Array.from({ length: GRADIENT_SAMPLES }, (_, i) =>
    fn((100 * i) / (GRADIENT_SAMPLES - 1)),
  );
  return `linear-gradient(to right, ${stops.join(", ")})`;
};

export const SliderAxisControl = ({
  title,
  size,
  range,
  onSizeChange,
  onRangeChange,
  createStrips,
  message,
  messageStyle,
}: SliderAxisControlProps) => (
  <AxisControl title={title} size={size} onSizeChange={onSizeChange}>
    <div className="flex w-full flex-col gap-1 pt-4">
      <div className="relative h-4 font-mono text-xs text-ink-2">
        <span
          className="absolute -translate-x-1/2 text-accent"
          style={{ left: `${range.min}%` }}
        >
          {Math.round(range.min)}
        </span>
        <span
          className="absolute -translate-x-1/2 text-accent-warm"
          style={{ left: `${range.max}%` }}
        >
          {Math.round(range.max)}
        </span>
      </div>

      <RangeSlider
        min={0}
        max={100}
        value={[range.min, range.max]}
        onChange={([lo, hi]) => onRangeChange(Math.round(lo), Math.round(hi))}
        gap={1}
        labels={[`${title} minimum`, `${title} maximum`]}
      >
        {createStrips && createStrips.length > 0 && (
          <div className="absolute inset-0 flex flex-col overflow-hidden rounded-full">
            {createStrips.map((fn, i) => (
              <div
                key={i}
                className="flex-1"
                style={{ background: stripGradient(fn) }}
              />
            ))}
          </div>
        )}
      </RangeSlider>
      <div className="min-h-8">
        {message && (
          <p className="text-xs" aria-live="polite" style={messageStyle}>
            {message}
          </p>
        )}
      </div>
    </div>
  </AxisControl>
);
