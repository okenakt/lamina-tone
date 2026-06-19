import { Wheel } from "@/components/geometry-controls";

type RangeWheelProps = {
  start: number; // 0-360, clockwise from top
  end: number;
  onChange: (start: number, end: number) => void;
  size?: number;
  inner?: number;
  outer?: number;
  background?: string;
  className?: string;
};

// Clockwise span from start to end.
const spanCW = (start: number, end: number) =>
  end >= start ? end - start : 360 - start + end;

// Dark overlay covering the unselected complement of the ring, expressed as a
// conic gradient with hard stops at the range ends. Same angle convention as
// the ring itself (0° at top, clockwise), so no arc/endpoint math is needed.
const dimGradient = (start: number, end: number): string | undefined => {
  const span = spanCW(start, end);
  if (span >= 359) return undefined; // full range → dim nothing
  const DARK = "rgba(0,0,0,0.45)";
  if (360 - span >= 359) return DARK; // empty range → dim everything
  // Dark over the complement [end → start]; transparent over [start → end].
  return start <= end
    ? `conic-gradient(from 0deg, ${DARK} 0deg ${start}deg, transparent ${start}deg ${end}deg, ${DARK} ${end}deg 360deg)`
    : `conic-gradient(from 0deg, transparent 0deg ${end}deg, ${DARK} ${end}deg ${start}deg, transparent ${start}deg 360deg)`;
};

// L2 — range on a ring = generic Wheel with 2 points + a dimmed-complement
// overlay. Unlike the linear range there is no ordering constraint: the two
// points are the endpoints of a directed (clockwise) arc, so they wrap freely.
export const RangeWheel = ({
  start,
  end,
  onChange,
  size = 96,
  inner = 0.29,
  outer = 0.41,
  background,
  className = "",
}: RangeWheelProps) => {
  const dim = dimGradient(start, end);
  // dim layered over the hue ring (first = topmost; dim is transparent over the
  // selected arc so the hues show, dark over the complement).
  const ring = [dim, background].filter(Boolean).join(", ");

  return (
    <div className={className} style={{ width: size }}>
      <Wheel
        values={[start, end]}
        onChange={(index, v) =>
          index === 0 ? onChange(v, end) : onChange(start, v)
        }
        inner={inner}
        outer={outer}
        ringStyle={{ background: ring || undefined }}
      />
    </div>
  );
};
