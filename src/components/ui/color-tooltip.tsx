import { Color } from "@/types";
import { CSSProperties } from "react";

type ColorTooltipProps = {
  color: Color;
  position: { x: number; y: number };
  message?: string;
  messageStyle?: CSSProperties;
};

export const ColorTooltip = ({
  color,
  position,
  message = "",
  messageStyle = {},
}: ColorTooltipProps) => {
  return (
    <div
      className="pointer-events-none absolute z-50 max-w-xs rounded-[8px] border border-ink-2 bg-ink p-2 text-xs text-paper shadow-lg sm:p-3 sm:text-sm"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(12px, -50%)",
      }}
    >
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div
          className="h-4 w-4 shrink-0 rounded-[2px] border border-paper/30 sm:h-6 sm:w-6"
          style={{ backgroundColor: color.hex }}
        />

        <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
          <div className="truncate font-mono font-semibold">{color.hex}</div>
          <div className="text-xs text-paper/70">
            RGB: {[color.rgb.r, color.rgb.g, color.rgb.b].join(", ")}
          </div>
          {message && (
            <div className="text-xs" style={messageStyle}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
