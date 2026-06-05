import { HSL_HUE_GRADIENT } from "./wheel-geometry";

// A smooth conic-gradient hue ring (donut). Purely visual: it renders an
// absolutely-positioned layer that fills its `size`×`size` (relative) parent,
// so consumers overlay their own handles / square / svg on top.
//
// Coordinate system: 0° at top, clockwise (see wheel-geometry helpers).

type HueWheelProps = {
  size: number; // square box (px)
  outerR: number; // ring outer radius
  innerR: number; // ring hole radius
  gradient?: string; // conic gradient for the ring (default: HSL hues)
  className?: string;
};

export const HueWheel = ({
  size,
  outerR,
  innerR,
  gradient = HSL_HUE_GRADIENT,
  className = "",
}: HueWheelProps) => {
  // Punch the donut: transparent inside innerR and outside outerR.
  const mask = `radial-gradient(circle at center, transparent ${innerR}px, #000 ${innerR + 0.5}px, #000 ${outerR}px, transparent ${outerR + 0.5}px)`;
  return (
    <div
      className={`absolute inset-0 rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        pointerEvents: "none",
        background: gradient,
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    />
  );
};
