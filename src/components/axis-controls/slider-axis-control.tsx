import { Range } from "@/types";
import { AxisControl } from "./axis-control";
import { DualRangeSlider } from "./dual-range-slider";

type SliderAxisControlProps = {
  title: string;
  size: number;
  range: Range;
  onSizeChange: (change: number) => void;
  onRangeChange: (min: number, max: number) => void;
  strips?: Array<(value: number) => string>;
};

export const SliderAxisControl = ({
  title,
  size,
  range,
  onSizeChange,
  onRangeChange,
  strips,
}: SliderAxisControlProps) => (
  <AxisControl title={title} size={size} onSizeChange={onSizeChange}>
    <DualRangeSlider
      min={0}
      max={100}
      minValue={range.min}
      maxValue={range.max}
      onChange={onRangeChange}
      strips={strips}
    />
  </AxisControl>
);
