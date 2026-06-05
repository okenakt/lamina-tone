import { useRef } from "react";

type ColorSliderProps = {
  value: number;
  max: number;
  min?: number;
  onChange: (value: number) => void;
  gradient: string; // CSS background painted on the track (the live preview)
  className?: string;
};

// A single slider with a gradient track and a draggable ring thumb. Built from
// divs + pointer capture (no native <input type=range>), so it needs no CSS
// file — everything is inline / Tailwind. The thumb is a transparent ring, so
// the track color shows through at the current value.
export const ColorSlider = ({
  value,
  max,
  min = 0,
  onChange,
  gradient,
  className = "",
}: ColorSliderProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const pct = ((value - min) / (max - min)) * 100;

  const update = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const t = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onChange(min + t * (max - min));
  };

  return (
    <div
      ref={trackRef}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e.clientX);
      }}
      onPointerMove={(e) => e.buttons === 1 && update(e.clientX)}
      className={`relative h-2.5 cursor-pointer touch-none rounded-full select-none ${className}`}
      style={{ background: gradient }}
    >
      <div
        className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
        style={{
          left: `${pct}%`,
          boxShadow: "0 0 0 1px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
};
