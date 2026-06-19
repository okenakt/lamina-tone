import { hexToColor } from "@/lib/color-engine";
import { Color } from "@/types";
import { useEffect, useRef } from "react";

type HexInputProps = {
  color: Color;
  onChange: (color: Color) => void;
};

export const HexInput = ({ color, onChange }: HexInputProps) => {
  const labelColor = color.oklch.l > 0.6 ? "#1f2937" : "#f9fafb";
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldHex = useRef(color.hex);

  useEffect(() => {
    const el = inputRef.current;
    if (el && color.hex !== fieldHex.current) {
      el.value = color.hex.toUpperCase();
      fieldHex.current = color.hex;
    }
  }, [color.hex]);

  return (
    <div
      className="rounded bg-(--swatch) transition-colors"
      style={{ "--swatch": color.hex } as React.CSSProperties}
    >
      <input
        ref={inputRef}
        defaultValue={color.hex.toUpperCase()}
        onChange={(e) => {
          const color = hexToColor(e.target.value);
          if (color) {
            fieldHex.current = color.hex;
            onChange(color);
          }
        }}
        onBlur={(e) => {
          e.target.value = color.hex.toUpperCase();
        }}
        spellCheck={false}
        maxLength={7}
        aria-label="Hex color"
        className="w-full rounded p-2 font-mono text-sm text-(--hex-fg) uppercase outline-none focus:bg-white focus:text-gray-900 focus:ring-2 focus:ring-blue-500"
        style={{ "--hex-fg": labelColor } as React.CSSProperties}
      />
    </div>
  );
};
