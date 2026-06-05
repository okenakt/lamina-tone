import React, { useCallback, useRef, useState } from "react";
import { HueWheel } from "./hue-wheel";
import { pointerAngle, wheelPoint } from "./wheel-geometry";

type DualRangeWheelProps = {
  start: number; // 0-360, clockwise from top
  end: number; // 0-360
  onChange: (start: number, end: number) => void;
  size?: number;
  outerR?: number;
  innerR?: number;
  gradient?: string;
  startColor?: string;
  endColor?: string;
};

const HANDLE_R = 5;

// Clockwise span from start to end.
const spanCW = (start: number, end: number) =>
  end >= start ? end - start : 360 - start + end;

/**
 * Generalized two-handle range selector on a circular wheel. Renders a HueWheel
 * ring, dims the non-selected (complement) arc, and drags a start/end handle.
 * Hue-specific concerns (gradient colors, degree labels) live in the consumer.
 */
export const DualRangeWheel = ({
  start,
  end,
  onChange,
  size = 96,
  outerR = 39,
  innerR = 28,
  gradient,
  startColor = "#3b82f6",
  endColor = "#f97316",
}: DualRangeWheelProps) => {
  const cx = size / 2;
  const midR = (outerR + innerR) / 2;

  const [dragging, setDragging] = useState<"start" | "end" | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const makeArc = (from: number, to: number, r: number): string => {
    const span = spanCW(from, to);
    if (span > 359.5) {
      const top = wheelPoint(cx, 0, r);
      const bot = wheelPoint(cx, 180, r);
      return `M ${top.x},${top.y} A ${r},${r} 0 1,1 ${bot.x},${bot.y} A ${r},${r} 0 1,1 ${top.x},${top.y}`;
    }
    if (span < 0.5) return "";
    const s = wheelPoint(cx, from, r);
    const e = wheelPoint(cx, to, r);
    const large = span > 180 ? 1 : 0;
    return `M ${s.x},${s.y} A ${r},${r} 0 ${large},1 ${e.x},${e.y}`;
  };

  const handleDown = useCallback((e: React.PointerEvent<SVGCircleElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(e.currentTarget.dataset.handle as "start" | "end");
    ref.current?.setPointerCapture(e.pointerId);
  }, []);

  const handleMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !ref.current) return;
      const a = Math.round(
        pointerAngle(
          ref.current.getBoundingClientRect(),
          cx,
          e.clientX,
          e.clientY,
        ),
      );
      if (dragging === "start") onChange(a, end);
      else onChange(start, a);
    },
    [dragging, start, end, onChange, cx],
  );

  const handleUp = useCallback(() => setDragging(null), []);

  const span = spanCW(start, end);
  const dimPath = (() => {
    if (span >= 359) return ""; // full range, nothing dimmed
    if (360 - span >= 359) return makeArc(0, 360, midR); // empty range, dim all
    return makeArc(end, start, midR);
  })();

  const startPt = wheelPoint(cx, start, outerR);
  const endPt = wheelPoint(cx, end, outerR);

  return (
    <div
      ref={ref}
      className="relative"
      style={{
        width: size,
        height: size,
        touchAction: "none",
        userSelect: "none",
        cursor: dragging ? "grabbing" : "default",
      }}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
    >
      <HueWheel
        size={size}
        outerR={outerR}
        innerR={innerR}
        gradient={gradient}
      />

      <svg
        width={size}
        height={size}
        className="absolute inset-0"
        style={{ pointerEvents: "none" }}
      >
        {dimPath && (
          <path
            d={dimPath}
            fill="none"
            stroke="rgba(0,0,0,0.45)"
            strokeWidth={outerR - innerR + 2}
          />
        )}

        <circle
          cx={startPt.x}
          cy={startPt.y}
          r={HANDLE_R}
          fill="white"
          stroke={startColor}
          strokeWidth={2.5}
          style={{ pointerEvents: "auto", cursor: "grab" }}
          data-handle="start"
          onPointerDown={handleDown}
        />
        <circle
          cx={endPt.x}
          cy={endPt.y}
          r={HANDLE_R}
          fill="white"
          stroke={endColor}
          strokeWidth={2.5}
          style={{ pointerEvents: "auto", cursor: "grab" }}
          data-handle="end"
          onPointerDown={handleDown}
        />
      </svg>
    </div>
  );
};
