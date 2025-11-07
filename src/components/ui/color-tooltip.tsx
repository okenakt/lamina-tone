import React from "react";
import { Color } from "@/types";

interface ColorTooltipProps {
  color: Color;
  position: { x: number; y: number };
}

export const ColorTooltip: React.FC<ColorTooltipProps> = ({ color, position }) => {
  return (
    <div 
      className="fixed bg-gray-900 text-white p-2 sm:p-3 z-50 pointer-events-none text-xs sm:text-sm border border-gray-700 max-w-xs"
      style={{ 
        left: Math.min(position.x + 10, window.innerWidth - 200), 
        top: position.y - 10,
        transform: 'translate(0, -100%)'
      }}
    >
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Color preview */}
        <div 
          className="w-4 h-4 sm:w-6 sm:h-6 border border-gray-600 flex-shrink-0"
          style={{ backgroundColor: color.hex }}
        />
        
        {/* Color info */}
        <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
          <div className="font-mono font-bold truncate">{color.hex}</div>
          <div className="text-gray-300 text-xs">
            RGB: {color.rgb.join(", ")}
          </div>
          <div className="text-gray-400 text-xs hidden sm:block">
            Click to copy
          </div>
          <div className="text-gray-400 text-xs sm:hidden">
            Tap to copy
          </div>
        </div>
      </div>
    </div>
  );
};