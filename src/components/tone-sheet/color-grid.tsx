import React from "react";
import { ColorGridProps } from "@/types";
import ColorCell from "./color-cell";
import { useHover } from "@/hooks";
import { ColorTooltip } from "@/components/ui/color-tooltip";
import { calculateGridDimensions } from "@/utils/grid";

const ColorGrid: React.FC<ColorGridProps> = ({ colors }) => {
  const { hoverState, handleHover } = useHover();

  if (colors.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">No colors to display</div>
      </div>
    );
  }

  const { cellWidth, cellHeight, rows, cols } = calculateGridDimensions(colors);

  return (
    <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: '1000px' }}>
      {/* Color grid */}
      <div 
        className="grid touch-manipulation"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellWidth}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellHeight}px)`,
          gap: '2px',
          transform: 'skewY(45deg)', // Skew entire ToneSheet to create parallelogram shape
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center'
        }}
      >
        {colors.map((row, rowIndex) =>
          row.map((color, colIndex) => (
            <ColorCell
              key={`${rowIndex}-${colIndex}`}
              color={color}
              showTooltip={false} // We'll use our custom tooltip
              onColorHover={(color, event) => handleHover(color, event as React.MouseEvent)}
            />
          ))
        )}
      </div>

      {/* Responsive tooltip */}
      {hoverState.color && hoverState.position && (
        <ColorTooltip color={hoverState.color} position={hoverState.position} />
      )}
    </div>
  );
};

export default React.memo(ColorGrid);