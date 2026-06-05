import { Range } from "@/types";
import { AxisControl } from "./axis-control";
import { HueRangeWheel } from "./hue-range-wheel";

type HueAxisControlProps = {
  count: number;
  hueRange: Range;
  onCountChange: (change: number) => void;
  onRangeChange: (min: number, max: number) => void;
  disabled?: boolean;
};

export const HueAxisControl = ({
  count,
  hueRange,
  onCountChange,
  onRangeChange,
  disabled,
}: HueAxisControlProps) => (
  <AxisControl
    title="Hue (Depth)"
    size={count}
    onSizeChange={onCountChange}
    disabled={disabled}
  >
    <HueRangeWheel
      startHue={hueRange.min}
      endHue={hueRange.max}
      onChange={onRangeChange}
    />
  </AxisControl>
);
