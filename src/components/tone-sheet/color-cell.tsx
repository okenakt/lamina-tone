import { Color } from "@/types";
import React from "react";

type ColorCellProps = {
  color: Color;
  onHover?: (color: Color | null) => void;
  onClick?: (color: Color) => void;
};

export const ColorCell = React.memo(function ColorCell({
  color,
  onHover,
  onClick,
}: ColorCellProps) {
  return (
    <div
      className="group relative flex h-full min-h-0 w-full min-w-0 cursor-pointer touch-manipulation items-center justify-center border border-gray-300 transition-all duration-200 hover:scale-105 hover:border-gray-600 active:scale-95"
      style={{
        backgroundColor: color.hex,
        transformStyle: "preserve-3d",
      }}
      onClick={() => onClick?.(color)}
      onMouseEnter={() => onHover?.(color)}
      onMouseLeave={() => onHover?.(null)}
    />
  );
});
