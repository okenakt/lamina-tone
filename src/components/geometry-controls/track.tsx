import React, { CSSProperties, ReactNode, useRef } from "react";
import { Geometry } from "./geometry";

type TrackProps = {
  geometry: Geometry;
  values: number[][]; // control points in coordinate form
  onChange: (index: number, value: number[]) => void;
  className?: string;
  children?: ReactNode; // control surface + decoration, drawn under the handles
};

const Handle = ({ style }: { style: CSSProperties }) => (
  <div
    className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
    style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.3)", ...style }}
  />
);

export const Track = ({
  geometry,
  values,
  onChange,
  className = "",
  children,
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
      {values.map((v, i) => (
        <Handle key={i} style={geometry.placeHandle(v)} />
      ))}
    </div>
  );
};
