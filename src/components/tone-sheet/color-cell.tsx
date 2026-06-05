import { FEEDBACK } from "@/constants/ui";
import { Color } from "@/types";
import { copyColorToClipboard } from "@/utils/clipboard";
import React, { useState } from "react";

type ColorCellProps = {
  color: Color;
  canCopy?: boolean;
  showTooltip?: boolean;
  onColorHover?: (color: Color | null) => void;
};

export const ColorCell = React.memo(function ColorCell({
  color,
  canCopy = false,
  showTooltip = true,
  onColorHover,
}: ColorCellProps) {
  const [showCopied, setShowCopied] = useState(false);

  const handleClick = async () => {
    if (!canCopy) return;
    try {
      await copyColorToClipboard(color);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), FEEDBACK.copyDisplayDuration);
    } catch (error) {
      console.error("Failed to handle color click:", error);
    }
  };

  const handleMouseEnter = () => {
    if (onColorHover) {
      onColorHover(color);
    }
  };

  const handleMouseLeave = () => {
    if (onColorHover) {
      onColorHover(null);
    }
  };

  const [L, C, h] = color.oklch;
  const tooltipContent = showTooltip
    ? `${color.hex}\nRGB: ${color.rgb.join(", ")}\nOKLCH: L=${L.toFixed(2)} C=${C.toFixed(3)} h=${Math.round(h)}°\nClick to copy`
    : color.hex;

  return (
    <div
      className="group relative flex h-full min-h-0 w-full min-w-0 cursor-pointer touch-manipulation items-center justify-center border border-gray-300 transition-all duration-200 hover:scale-105 hover:border-gray-600 active:scale-95"
      style={{
        backgroundColor: color.hex,
        transformStyle: "preserve-3d",
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={tooltipContent}
    >
      {showCopied && (
        <div className="absolute inset-0 z-10 flex animate-pulse items-center justify-center bg-white/60 text-xs font-medium text-black">
          Copied!
        </div>
      )}
    </div>
  );
});
