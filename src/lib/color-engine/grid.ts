import { ColorAxis, Color as ColorType } from "@/types";
import { oklchToColor } from "./conversions";

// Generate one ToneSheet's color grid for a single hue.
// lightness/chroma axes carry engine-normalized ranges (L 0-1, C 0-1) and the
// sample count per axis: lightness.num = rows, chroma.num = cols.
// Row 0 = highest lightness (top of visual grid).
export function generateColorGrid(
  hue: number,
  lightness: ColorAxis,
  chroma: ColorAxis,
): ColorType[][] {
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

      return oklchToColor(L, C, hue);
    });
  });
}
