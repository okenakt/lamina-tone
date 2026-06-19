import { CSSProperties } from "react";

export type Geometry = {
  valueAt: (rect: DOMRect, x: number, y: number) => number[]; // pointer → coordinate
  placeHandle: (value: number[]) => CSSProperties; // coordinate → handle placement
  distance: (a: number[], b: number[]) => number; // nearest metric
  hitStart?: (rect: DOMRect, x: number, y: number) => boolean; // ignore e.g. the donut hole
};
