import { CSSProperties } from "react";

// ARIA metadata for a single focusable handle, derived from its coordinate.
export type HandleAria = {
  valuemin: number;
  valuemax: number;
  valuenow: number;
  valuetext?: string;
};

export type Geometry = {
  valueAt: (rect: DOMRect, x: number, y: number) => number[]; // pointer → coordinate
  placeHandle: (value: number[]) => CSSProperties; // coordinate → handle placement
  distance: (a: number[], b: number[]) => number; // nearest metric
  hitStart?: (rect: DOMRect, x: number, y: number) => boolean; // ignore e.g. the donut hole
  // Keyboard nudge: dx/dy are -1|0|+1 from the arrow keys, coarse is the Shift
  // modifier. Returns the next coordinate. Enables keyboard operation.
  nudge?: (
    value: number[],
    dx: number,
    dy: number,
    coarse: boolean,
  ) => number[];
  // Per-handle ARIA value metadata, so the handle can expose role="slider".
  aria?: (value: number[]) => HandleAria;
};
