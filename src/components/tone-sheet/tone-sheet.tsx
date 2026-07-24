import { CELL_GAP_RATIO } from "@/constants/tone-sheet";
import { Color } from "@/types";
import React from "react";
import { ColorCell } from "./color-cell";

const calculateCellSize = (
  rows: number,
  cols: number,
  containerSize: number = 180,
): { width: number; height: number } => {
  const maxDimension = Math.max(rows, cols);
  const baseSize = containerSize / maxDimension;

  const width = baseSize;
  const height = baseSize / Math.cos(Math.PI / 4); // Compensate for 45deg skew

  return {
    width,
    height,
  };
};

type ToneSheetProps = {
  colors: Color[][];
  // Sheet box size in px; the grid fills 90% of it, matching the original
  // 180/200 inset. Driven by the parent so sheets scale with the container.
  size: number;
  isActive: boolean;
  // Withheld (undefined) for inactive sheets so only the active sheet can
  // drive the tooltip and copy.
  onColorHover?: (color: Color | null) => void;
  onColorCopy?: (color: Color) => void;
};

export const ToneSheet = React.memo(function ToneSheet({
  colors,
  size,
  onColorHover,
  onColorCopy,
}: ToneSheetProps) {
  const rows = colors.length;
  const cols = colors[0]?.length ?? 0;
  if (rows === 0 || cols === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-ink-3">No colors to display</div>
      </div>
    );
  }

  const { width, height } = calculateCellSize(rows, cols, size * 0.9);

  return (
    <div
      className="relative flex h-full w-full items-center justify-center"
      style={{ perspective: "1000px" }}
    >
      <div
        className="grid touch-manipulation"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${width}px)`,
          gridTemplateRows: `repeat(${rows}, ${height}px)`,
          gap: `${size * CELL_GAP_RATIO}px`,
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
              onHover={onColorHover}
              onClick={onColorCopy}
            />
          )),
        )}
      </div>
    </div>
  );
});
