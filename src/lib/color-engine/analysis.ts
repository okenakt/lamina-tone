import { Color as ColorType, Range } from "@/types";
import { rgbToColor } from "./conversions";

// Derive initial slider ranges from a seed color.
// Returns engine-normalized units: L 0-1, C 0-1, h 0-360°.
export function initialRangesFromColor(color: ColorType): {
  lightnessRange: Range;
  chromaRange: Range;
  hueRange: Range;
} {
  const { l: L, c: C, h } = color.oklch;
  return {
    lightnessRange: {
      min: Math.max(0, L - 0.25),
      max: Math.min(1, L + 0.25),
    },
    chromaRange: {
      min: Math.max(0, C - 0.25),
      max: Math.min(1, C + 0.25),
    },
    hueRange: {
      min: (h - 90 + 360) % 360,
      max: (h + 90) % 360,
    },
  };
}

export function generateRandomColor(): ColorType {
  return rgbToColor({
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
  });
}
