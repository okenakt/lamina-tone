import { ColorAxis, Color as ColorType } from "@/types";
import { oklchToColor } from "./conversions";

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

      return oklchToColor({ l: L, c: C, h: hue });
    });
  });
}
