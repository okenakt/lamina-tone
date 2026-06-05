import { Color } from "@/types";

type ColorTooltipProps = {
  color: Color;
};

export const ColorTooltip = ({ color }: ColorTooltipProps) => {
  return (
    <div className="pointer-events-none absolute bottom-2 left-2 z-50 max-w-xs border border-gray-700 bg-gray-900 p-2 text-xs text-white sm:p-3 sm:text-sm">
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Color preview */}
        <div
          className="h-4 w-4 flex-shrink-0 border border-gray-600 sm:h-6 sm:w-6"
          style={{ backgroundColor: color.hex }}
        />

        {/* Color info */}
        <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
          <div className="truncate font-mono font-bold">{color.hex}</div>
          <div className="text-xs text-gray-300">
            RGB: {color.rgb.join(", ")}
          </div>
          <div className="hidden text-xs text-gray-400 sm:block">
            Click to copy
          </div>
          <div className="text-xs text-gray-400 sm:hidden">Tap to copy</div>
        </div>
      </div>
    </div>
  );
};
