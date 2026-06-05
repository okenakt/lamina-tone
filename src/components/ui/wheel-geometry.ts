// Shared geometry for circular hue wheels.
// Coordinate system: 0° at top, clockwise — matches CSS conic-gradient.

// Default ring: pure HSL hues.
export const HSL_HUE_GRADIENT =
  "conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)";

// Point on the wheel for an angle (deg) at radius r, given centre cx (= size/2).
export const wheelPoint = (cx: number, deg: number, r: number) => {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cx - r * Math.cos(rad) };
};

// Pointer position → angle (0-360), given the wheel element's rect and centre cx.
export const pointerAngle = (
  rect: DOMRect,
  cx: number,
  clientX: number,
  clientY: number,
) =>
  ((Math.atan2(clientX - rect.left - cx, -(clientY - rect.top - cx)) * 180) /
    Math.PI +
    360) %
  360;
