export const clamp = (t: number, min: number = 0, max: number = 1): number =>
  Math.max(min, Math.min(max, t));
