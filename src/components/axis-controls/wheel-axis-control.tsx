import { Range } from "@/types";
import { AxisControl } from "./axis-control";
import { RangeWheel } from "./range-wheel";

type WheelAxisControlProps = {
  title: string;
  size: number;
  range: Range;
  onSizeChange: (change: number) => void;
  onRangeChange: (min: number, max: number) => void;
  createGradient: (v: number) => string;
  disabled?: boolean;
};

export const WheelAxisControl = ({
  title,
  size,
  range,
  onSizeChange,
  onRangeChange,
  createGradient,
  disabled,
}: WheelAxisControlProps) => {
  const ringGradient = `conic-gradient(from 0deg, ${Array.from(
    { length: 72 },
    (_, i) => {
      const v = (i * 5 + 2.5) % 360;
      return `${createGradient(v)} ${i * 5}deg`;
    },
  ).join(", ")}, ${createGradient(2.5)} 360deg)`;
  return (
    <AxisControl
      title={title}
      size={size}
      onSizeChange={onSizeChange}
      disabled={disabled}
    >
      <div className="flex justify-center gap-2 py-1">
        <RangeWheel
          start={range.min}
          end={range.max}
          onChange={onRangeChange}
          background={ringGradient}
        />

        <div className="items-left flex flex-col justify-center font-mono text-xs">
          <span className="text-blue-500">{Math.round(range.min)}°</span>
          <span className="text-gray-400">↓</span>
          <span className="text-orange-500">{Math.round(range.max)}°</span>
        </div>
      </div>
    </AxisControl>
  );
};
