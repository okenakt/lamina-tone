import { HueWheel } from "@/components/ui/hue-wheel";
import { pointerAngle, wheelPoint } from "@/components/ui/wheel-geometry";
import { oklchToColor, oklchToRgb } from "@/lib/color-engine";
import { Color } from "@/types";
import React, { useEffect, useRef, useState } from "react";

type ColorPickerProps = {
  onColorChange: (color: Color) => void;
  value?: Color; // controlled color; external changes are reflected into the wheel
  chromaMax?: number; // upper bound (normalized 0-1) for the chroma axis
};

// Internal OKLCH picking coordinate (L 0-1, C normalized 0-1, h 0-360°).
type LCH = { l: number; c: number; h: number };
const DEFAULT_LCH: LCH = { l: 0.7, c: 0.4, h: 30 };
const lchFromColor = (c: Color): LCH => ({
  l: c.oklch[0],
  c: c.oklch[1],
  h: c.oklch[2],
});

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

// Conic hue-ring gradient at a fixed lightness/chroma, sampled per 5°.
const hueGradient = (l: number, c: number) => {
  const hex = (h: number) =>
    "#" +
    oklchToRgb(l, c, h)
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("");
  const stops = Array.from(
    { length: 72 },
    (_, i) => `${hex(i * 5)} ${i * 5}deg`,
  ).join(", ");
  return `conic-gradient(from 0deg, ${stops}, ${hex(0)} 360deg)`;
};

// Wheel geometry — 0° at top, clockwise.
const WHEEL = 200;
const WC = WHEEL / 2;
const OUTER_R = WC;
const INNER_R = 78;
const MID_R = (OUTER_R + INNER_R) / 2;
// Lightness × chroma square inscribed within the inner ring.
const SQUARE_R = INNER_R - 3;
const SQUARE = SQUARE_R * Math.SQRT2;
const SQUARE_OFFSET = WC - SQUARE / 2;
const FIELD_RES = 72; // canvas resolution for the L×C field

const HUE_RING = hueGradient(0.7, 0.35);

export const ColorPicker = ({
  onColorChange,
  value,
  chromaMax = 1,
}: ColorPickerProps) => {
  const [lch, setLch] = useState<LCH>(() =>
    value ? lchFromColor(value) : DEFAULT_LCH,
  );
  const [hueDragging, setHueDragging] = useState(false);

  // The hex this picker last emitted — used to ignore the echo of our own change
  // (so dragging into out-of-gamut C doesn't snap back to the gamut-mapped value).
  const selfHex = useRef(value?.hex ?? "");

  const areaRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Reflect external value changes (e.g. RGB text edits) into the wheel; skip our own echo.
  useEffect(() => {
    if (!value || value.hex === selfHex.current) return;
    selfHex.current = value.hex;
    setLch(lchFromColor(value));
  }, [value]);

  // Apply a user-driven change: update the wheel and emit the gamut-mapped Color.
  const commit = (next: LCH) => {
    setLch(next);
    const color = oklchToColor(next.l, next.c, next.h);
    selfHex.current = color.hex;
    onColorChange(color);
  };

  // Paint the lightness (vertical) × chroma (horizontal) field for the current hue.
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(FIELD_RES, FIELD_RES);
    for (let yi = 0; yi < FIELD_RES; yi++) {
      const l = 1 - yi / (FIELD_RES - 1);
      for (let xi = 0; xi < FIELD_RES; xi++) {
        const c = (xi / (FIELD_RES - 1)) * chromaMax;
        const [r, g, b] = oklchToRgb(l, c, lch.h);
        const k = (yi * FIELD_RES + xi) * 4;
        img.data[k] = r;
        img.data[k + 1] = g;
        img.data[k + 2] = b;
        img.data[k + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [lch.h, chromaMax]);

  const updateLC = (clientX: number, clientY: number) => {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const c = clamp((clientX - rect.left) / rect.width, 0, 1) * chromaMax;
    const l = clamp(1 - (clientY - rect.top) / rect.height, 0, 1);
    commit({ ...lch, l, c });
  };

  const updateHue = (clientX: number, clientY: number) => {
    const rect = wheelRef.current?.getBoundingClientRect();
    if (!rect) return;
    commit({ ...lch, h: pointerAngle(rect, WC, clientX, clientY) });
  };

  const handleAreaDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    updateLC(e.clientX, e.clientY);
  };

  const handleHueDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = wheelRef.current?.getBoundingClientRect();
    if (!rect) return;
    const r = Math.hypot(e.clientX - rect.left - WC, e.clientY - rect.top - WC);
    if (r < INNER_R - 2) return; // inside the square area
    e.currentTarget.setPointerCapture(e.pointerId);
    setHueDragging(true);
    updateHue(e.clientX, e.clientY);
  };

  const handle = wheelPoint(WC, lch.h, MID_R);

  return (
    <div
      ref={wheelRef}
      onPointerDown={handleHueDown}
      onPointerMove={(e) => hueDragging && updateHue(e.clientX, e.clientY)}
      onPointerUp={() => setHueDragging(false)}
      onPointerCancel={() => setHueDragging(false)}
      className="relative select-none"
      style={{
        width: WHEEL,
        height: WHEEL,
        touchAction: "none",
        cursor: hueDragging ? "grabbing" : "pointer",
      }}
    >
      {/* Smooth conic hue ring */}
      <HueWheel
        size={WHEEL}
        outerR={OUTER_R}
        innerR={INNER_R}
        gradient={HUE_RING}
      />

      {/* Hue handle */}
      <svg
        width={WHEEL}
        height={WHEEL}
        className="absolute inset-0"
        style={{ pointerEvents: "none" }}
      >
        <circle
          cx={handle.x}
          cy={handle.y}
          r={7}
          fill="#fff"
          stroke="rgba(0,0,0,0.45)"
          strokeWidth={2}
        />
      </svg>

      {/* Lightness × chroma square */}
      <div
        ref={areaRef}
        onPointerDown={handleAreaDown}
        onPointerMove={(e) => e.buttons === 1 && updateLC(e.clientX, e.clientY)}
        className="absolute cursor-crosshair touch-none overflow-hidden rounded-md"
        style={{
          left: SQUARE_OFFSET,
          top: SQUARE_OFFSET,
          width: SQUARE,
          height: SQUARE,
        }}
      >
        <canvas
          ref={canvasRef}
          width={FIELD_RES}
          height={FIELD_RES}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            pointerEvents: "none",
          }}
        />
        <div
          className="pointer-events-none absolute -mt-[7px] -ml-[7px] h-3.5 w-3.5 rounded-full border-2 border-white"
          style={{
            left: `${(lch.c / chromaMax) * 100}%`,
            top: `${(1 - lch.l) * 100}%`,
            boxShadow: "0 0 0 1px rgba(0,0,0,0.35)",
          }}
        />
      </div>
    </div>
  );
};
