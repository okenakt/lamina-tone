import { AXIS_LIMITS } from "@/constants/ui";
import { initialRangesFromColor } from "@/lib/color-engine";
import { AxisType, Color, ColorCube } from "@/types";
import { useState } from "react";

function createInitialCube(seedColor: Color): ColorCube {
  const ranges = initialRangesFromColor(seedColor);
  // Lightness/chroma ranges are stored on the 0-100 slider scale; hue on 0-360°.
  // num starts at 1 on every axis (a single hue sheet, a 1×1 cell grid).
  // The seed hue is recoverable as the midpoint of the hue range (see sampleAxis).
  return {
    hue: { range: ranges.hueRange, num: 1 },
    lightness: {
      range: {
        min: ranges.lightnessRange.min * 100,
        max: ranges.lightnessRange.max * 100,
      },
      num: 1,
    },
    chroma: {
      range: {
        min: ranges.chromaRange.min * 100,
        max: ranges.chromaRange.max * 100,
      },
      num: 1,
    },
  };
}

export const useColorCube = (seedColor: Color) => {
  const [cube, setCube] = useState<ColorCube>(() =>
    createInitialCube(seedColor),
  );

  // Grow/shrink an axis's sample count, clamped to AXIS_LIMITS.
  const resizeAxis = (axis: AxisType, change: number) => {
    setCube((prev) => {
      const num = Math.max(
        AXIS_LIMITS.minSize,
        Math.min(AXIS_LIMITS.maxSize, prev[axis].num + change),
      );
      return { ...prev, [axis]: { ...prev[axis], num } };
    });
  };

  const setRange = (axis: AxisType, min: number, max: number) => {
    setCube((prev) => ({
      ...prev,
      [axis]: { ...prev[axis], range: { min, max } },
    }));
  };

  return { cube, resizeAxis, setRange };
};
