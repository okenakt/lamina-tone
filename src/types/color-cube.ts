import { Range } from "./range";

export type ColorAxis = {
  range: Range;
  num: number;
};

export type ColorCube = {
  hue: ColorAxis;
  lightness: ColorAxis;
  chroma: ColorAxis;
};

export type AxisType = keyof ColorCube;
