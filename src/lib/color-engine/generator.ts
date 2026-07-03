import { Color, ColorAxis, Range } from "@/types";
import { oklchToColor, rgbToColor } from "./conversions";

export function generateRandomColor(): Color {
  return rgbToColor({
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
  });
}

export function generateColorGrid(
  hue: number,
  lightness: ColorAxis,
  chroma: ColorAxis,
): Color[][] {
  const rows = lightness.num;
  const cols = chroma.num;
  const lr = lightness.range;
  const cr = chroma.range;

  return Array.from({ length: rows }, (_, i) => {
    const L =
      rows === 1
        ? (lr.min + lr.max) / 2
        : lr.max - ((lr.max - lr.min) * i) / (rows - 1);

    return Array.from({ length: cols }, (_, j) => {
      const C =
        cols === 1
          ? (cr.min + cr.max) / 2
          : cr.min + ((cr.max - cr.min) * j) / (cols - 1);

      return oklchToColor({ l: L, c: C, h: hue });
    });
  });
}

// Derive initial slider ranges from a seed color.
// Returns engine-normalized units: L 0-1, C 0-1, h 0-360°.
export function initialRangesFromColor(color: Color): {
  lightnessRange: Range;
  chromaRange: Range;
  hueRange: Range;
} {
  const { l: L, c: C, h } = color.oklch;
  return {
    lightnessRange: {
      min: Math.max(0, L - 0.1),
      max: Math.min(1, L + 0.1),
    },
    chromaRange: {
      min: Math.max(0, C - 0.1),
      max: Math.min(1, C + 0.1),
    },
    hueRange: {
      min: (h - 60 + 360) % 360,
      max: (h + 60) % 360,
    },
  };
}
