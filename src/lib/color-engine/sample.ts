import { ColorAxis } from "@/types";

/**
 * Sample a color axis into its `num` discrete values.
 *
 * - num === 1 → the midpoint of the range (a single sample sits in the centre).
 * - num  >  1 → evenly spaced values from range.min to range.max inclusive.
 *
 * `wrap` enables 360° wrap-around for the hue axis (e.g. a 300°→60° range
 * spans 120°, not -240°).
 */
export function sampleAxis({ range, num }: ColorAxis, wrap = false): number[] {
  const span =
    wrap && range.max < range.min
      ? 360 - range.min + range.max
      : range.max - range.min;

  const wrapped = (v: number) => (wrap ? ((v % 360) + 360) % 360 : v);

  if (num <= 1) {
    return [wrapped(range.min + span / 2)];
  }

  const step = span / (num - 1);
  return Array.from({ length: num }, (_, i) => wrapped(range.min + step * i));
}
