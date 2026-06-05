import { Range } from "./range";

// One axis of the discrete color cube: a continuous range sampled into `num` steps.
// Reused for all three axes (hue / lightness / chroma).
export type ColorAxis = {
  range: Range;
  num: number;
};

// The app's color model: a discrete 3D grid in OKLCH space.
// Sampling the axes yields the rendered result — ToneSheets (one per hue sample),
// each a ColorCell grid of lightness × chroma samples.
export type ColorCube = {
  hue: ColorAxis;
  lightness: ColorAxis;
  chroma: ColorAxis;
};

export type AxisType = keyof ColorCube; // 'hue' | 'lightness' | 'chroma'
