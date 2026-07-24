import { Color } from "@/types";
import { copyColorToClipboard } from "@/utils/clipboard";
import { PointerEvent, RefObject, useCallback, useState } from "react";

export const useTooltipState = (
  containerRef: RefObject<HTMLDivElement | null>,
) => {
  const [hoveredColor, setHoveredColor] = useState<Color | null>(null);
  const [copiedColor, setCopiedColor] = useState<Color | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const onColorHover = useCallback((color: Color | null) => {
    setHoveredColor(color);
  }, []);

  const onColorCopy = useCallback(async (color: Color) => {
    try {
      await copyColorToClipboard(color);
    } catch (error) {
      console.error("Failed to copy color:", error);
      return;
    }
    setCopiedColor(color);
  }, []);

  const trackPointer = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    [containerRef],
  );

  // Visibility follows the pointer alone: leaving a cell always hides the
  // tooltip. `copiedColor` only flips the message while the pointer is still on
  // the cell that was just copied.
  const justCopied = copiedColor !== null && copiedColor === hoveredColor;
  const tooltipProps = hoveredColor
    ? {
        color: hoveredColor,
        position,
        message: justCopied ? "Copied!" : "Click to copy",
        messageStyle: justCopied
          ? { fontWeight: "bold" as const, color: "#4ade80" }
          : undefined,
      }
    : null;

  return {
    tooltipProps,
    onColorHover,
    onColorCopy,
    pointerProps: { onPointerMove: trackPointer, onPointerDown: trackPointer },
  };
};
