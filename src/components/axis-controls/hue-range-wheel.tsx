import { DualRangeWheel } from "@/components/ui/dual-range-wheel";
import { oklchToColor } from "@/lib/color-engine";

type HueRangeWheelProps = {
  startHue: number; // 0-360, clockwise from top
  endHue: number; // 0-360
  onChange: (start: number, end: number) => void;
};

// Ring colored with actual CAM16-JMH/OKLCH hues (J=65, M=45) so the visual hue
// at each angle matches the H value being selected. Built once as a conic
// gradient from per-degree segment colors.
const SEGMENT_COLORS: string[] = Array.from({ length: 72 }, (_, i) => {
  try {
    return oklchToColor(0.65, 0.45, i * 5).hex;
  } catch {
    return `hsl(${i * 5 + 2.5}, 100%, 50%)`;
  }
});
const RING_GRADIENT = `conic-gradient(from 0deg, ${SEGMENT_COLORS.map(
  (c, i) => `${c} ${i * 5}deg`,
).join(", ")}, ${SEGMENT_COLORS[0]} 360deg)`;

const spanCW = (start: number, end: number) =>
  end >= start ? end - start : 360 - start + end;

export const HueRangeWheel = ({
  startHue,
  endHue,
  onChange,
}: HueRangeWheelProps) => (
  <div className="flex flex-col items-center gap-2 py-1">
    <DualRangeWheel
      start={startHue}
      end={endHue}
      onChange={onChange}
      gradient={RING_GRADIENT}
    />

    <div className="flex items-center gap-2 font-mono text-xs">
      <span className="font-semibold text-blue-500">
        {Math.round(startHue)}°
      </span>
      <span className="text-gray-400">→</span>
      <span className="font-semibold text-orange-500">
        {Math.round(endHue)}°
      </span>
      <span className="text-gray-400">
        ({Math.round(spanCW(startHue, endHue))}°)
      </span>
    </div>
  </div>
);
