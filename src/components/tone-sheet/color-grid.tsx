import { Color } from "@/types";
import { calculateGridDimensions } from "@/utils/grid";
import React from "react";
import { ColorCell } from "./color-cell";

type ColorGridProps = {
  colors: Color[][];
  canCopy: boolean;
  onColorHover: (color: Color | null) => void;
};

export const ColorGrid = React.memo(function ColorGrid({
  colors,
  canCopy,
  onColorHover,
}: ColorGridProps) {
  if (colors.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">No colors to display</div>
      </div>
    );
  }

  const { cellWidth, cellHeight, rows, cols } = calculateGridDimensions(colors);

  return (
    <div
      className="relative flex h-full w-full items-center justify-center"
      style={{ perspective: "1000px" }}
    >
      <div
        className="grid touch-manipulation"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellWidth}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellHeight}px)`,
          gap: "2px",
          transform: "skewY(45deg)",
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
        }}
      >
        {colors.map((row, rowIndex) =>
          row.map((color, colIndex) => (
            <ColorCell
              key={`${rowIndex}-${colIndex}`}
              color={color}
              canCopy={canCopy}
              showTooltip={false}
              onColorHover={onColorHover}
            />
          )),
        )}
      </div>
    </div>
  );
});
