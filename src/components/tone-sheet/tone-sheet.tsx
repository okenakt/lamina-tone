import React, { useMemo } from "react";
import { ToneSheetProps } from "@/types";
import { generateColorGrid } from "@/utils/color-space";
import ColorGrid from "./color-grid";

const ToneSheet: React.FC<ToneSheetProps> = ({
  hue,
  dimensions,
  chromaRange,
  lightnessRange,
}) => {
  // Generate colors for this sheet
  const colors = useMemo(() => {
    const gridSize = { rows: dimensions.lightness, cols: dimensions.chroma };
    return generateColorGrid(hue, gridSize, chromaRange, lightnessRange);
  }, [hue, dimensions, chromaRange, lightnessRange]);

  return (
    <div className="relative w-full h-full">
      {/* Color grid */}
      <ColorGrid colors={colors} />
    </div>
  );
};

export default React.memo(ToneSheet);