import { Color as ColorType, Range } from "@/types";
import { rgbToColor } from "./conversions";

export function getHueFromColor(color: ColorType): number {
  return color.oklch[2];
}

// Derive initial slider ranges from a seed color.
// Returns engine-normalized units: L 0-1, C 0-1, h 0-360°.
export function initialRangesFromColor(color: ColorType): {
  lightnessRange: Range;
  chromaRange: Range;
  hueRange: Range;
} {
  const [L, C, h] = color.oklch;
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

export function generateRandomColors(count: number = 8): ColorType[] {
  return Array.from({ length: count }, () =>
    rgbToColor(
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
    ),
  );
}
