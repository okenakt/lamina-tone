import React, { useState } from "react";
import { Color } from "@/types";
import { copyColorToClipboard } from "@/utils/color-space";
import { FEEDBACK } from "@/constants/ui";

interface ColorCellProps {
  color: Color;
  showTooltip?: boolean;
  onColorHover?: (color: Color | null, event?: React.MouseEvent) => void;
}

const ColorCell: React.FC<ColorCellProps> = ({ 
  color, 
  showTooltip = true,
  onColorHover
}) => {
  const [showCopied, setShowCopied] = useState(false);

  const handleClick = async () => {
    try {
      await copyColorToClipboard(color);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), FEEDBACK.copyDisplayDuration);
    } catch (error) {
      console.error("Failed to handle color click:", error);
    }
  };

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (onColorHover) {
      onColorHover(color, event);
    }
  };

  const handleMouseLeave = () => {
    if (onColorHover) {
      onColorHover(null);
    }
  };


  const tooltipContent = showTooltip ? (
    `${color.hex}\nRGB: ${color.rgb.join(", ")}\nCAM16-JMH: ${color.cam16jmh.map(v => v.toFixed(1)).join(", ")}\nClick to copy`
  ) : color.hex;

  return (
    <div
      className="w-full h-full min-w-0 min-h-0 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 border border-gray-300 hover:border-gray-600 flex items-center justify-center group relative touch-manipulation"
      style={{ 
        backgroundColor: color.hex,
        transformStyle: 'preserve-3d'
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={tooltipContent}
    >

      {/* Copied feedback overlay */}
      {showCopied && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white text-xs font-medium animate-pulse z-10">
          Copied!
        </div>
      )}
    </div>
  );
};

export default React.memo(ColorCell);