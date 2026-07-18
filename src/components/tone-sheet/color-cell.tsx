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
    <button
      type="button"
      aria-label={`Copy ${color.hex}`}
      className="group relative flex h-full min-h-0 w-full min-w-0 cursor-pointer touch-manipulation items-center justify-center border border-rule outline-none transition-transform duration-200 ease-out hover:scale-105 hover:border-ink active:scale-95 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-focus"
      style={{
        backgroundColor: color.hex,
        transformStyle: "preserve-3d",
      }}
      onClick={() => onClick?.(color)}
      onMouseEnter={() => onHover?.(color)}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(color)}
      onBlur={() => onHover?.(null)}
    />
  );
});
