import { Color } from "@/types";
import React from "react";
import { ColorGrid } from "./color-grid";

type ToneSheetProps = {
  colors: Color[][];
  isActive: boolean;
  onColorHover: (color: Color | null) => void;
};

export const ToneSheet = React.memo(function ToneSheet({
  colors,
  isActive,
  onColorHover,
}: ToneSheetProps) {
  return (
    <div className="relative h-full w-full">
      <ColorGrid
        colors={colors}
        canCopy={isActive}
        onColorHover={onColorHover}
      />
    </div>
  );
});
