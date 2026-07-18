import { hexToColor } from "@/lib/color-engine";
import { Color } from "@/types";
import { useEffect, useRef } from "react";

type HexInputProps = {
  color: Color;
  onChange: (color: Color) => void;
};

export const HexInput = ({ color, onChange }: HexInputProps) => {
  // Readable text over the swatch: dark ink on light colours, light paper on
  // dark ones. Uses the theme tokens so the field tracks the palette.
  const labelColor =
    color.oklch.l > 0.6 ? "var(--color-ink)" : "var(--color-paper)";
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
      className="rounded bg-(--swatch) transition-colors duration-200 ease-out"
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
        className="w-full rounded-[8px] p-2 font-mono text-sm text-(--hex-fg) uppercase outline-none focus:bg-paper focus:text-ink focus-visible:ring-2 focus-visible:ring-focus"
        style={{ "--hex-fg": labelColor } as React.CSSProperties}
      />
    </div>
  );
};
