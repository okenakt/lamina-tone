import React, { CSSProperties, KeyboardEvent, ReactNode, useRef } from "react";
import { Geometry } from "./geometry";

type TrackProps = {
  geometry: Geometry;
  values: number[][]; // control points in coordinate form
  onChange: (index: number, value: number[]) => void;
  className?: string;
  children?: ReactNode; // control surface + decoration, drawn under the handles
  // Accessible name for each handle (by index). When provided together with the
  // geometry's `aria`/`nudge`, handles become focusable role="slider" controls.
  handleLabels?: string[];
};

const ARROW_DELTA: Record<string, { dx: number; dy: number }> = {
  ArrowRight: { dx: 1, dy: 0 },
  ArrowUp: { dx: 0, dy: 1 },
  ArrowLeft: { dx: -1, dy: 0 },
  ArrowDown: { dx: 0, dy: -1 },
};

type HandleProps = {
  style: CSSProperties;
  a11y?: React.HTMLAttributes<HTMLDivElement> & {
    "aria-valuemin"?: number;
    "aria-valuemax"?: number;
    "aria-valuenow"?: number;
    "aria-valuetext"?: string;
    "aria-label"?: string;
  };
};

const Handle = ({ style, a11y }: HandleProps) => (
  <div
    className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full border-2 border-white outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-paper"
    style={{
      boxShadow: "0 0 0 1px oklch(27% 0.012 250 / 0.35)",
      pointerEvents: a11y ? "auto" : "none",
      ...style,
    }}
    {...a11y}
  />
);

export const Track = ({
  geometry,
  values,
  onChange,
  className = "",
  children,
  handleLabels,
}: TrackProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const active = useRef<number | null>(null);
  const dist = geometry.distance;

  const drag = (x: number, y: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || active.current === null) return;
    onChange(active.current, geometry.valueAt(rect, x, y));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || geometry.hitStart?.(rect, e.clientX, e.clientY) === false)
      return;
    const v = geometry.valueAt(rect, e.clientX, e.clientY);
    active.current = values.reduce(
      (nearest, p, i) => (dist(p, v) < dist(values[nearest], v) ? i : nearest),
      0,
    );
    e.currentTarget.setPointerCapture(e.pointerId);
    drag(e.clientX, e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (active.current !== null) drag(e.clientX, e.clientY);
  };

  const onPointerUp = () => {
    active.current = null;
  };

  const onHandleKeyDown =
    (index: number) => (e: KeyboardEvent<HTMLDivElement>) => {
      if (!geometry.nudge) return;
      const delta = ARROW_DELTA[e.key];
      if (!delta) return;
      e.preventDefault();
      onChange(
        index,
        geometry.nudge(values[index], delta.dx, delta.dy, e.shiftKey),
      );
    };

  const keyboard = Boolean(geometry.nudge && geometry.aria && handleLabels);

  return (
    <div
      ref={trackRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={className}
    >
      {children}
      {values.map((v, i) => {
        const a11y = keyboard
          ? (() => {
              const meta = geometry.aria!(v);
              return {
                role: "slider",
                tabIndex: 0,
                "aria-label": handleLabels![i],
                "aria-valuemin": meta.valuemin,
                "aria-valuemax": meta.valuemax,
                "aria-valuenow": meta.valuenow,
                "aria-valuetext": meta.valuetext,
                onKeyDown: onHandleKeyDown(i),
              };
            })()
          : undefined;
        return <Handle key={i} style={geometry.placeHandle(v)} a11y={a11y} />;
      })}
    </div>
  );
};
