import { Color } from "@/types";
import { copyColorToClipboard } from "@/utils/clipboard";
import { PointerEvent, RefObject, useCallback, useRef, useState } from "react";

export const useTooltipState = (
  containerRef: RefObject<HTMLDivElement | null>,
) => {
  const [hoveredColor, setHoveredColor] = useState<Color | null>(null);
  const [copiedColor, setCopiedColor] = useState<Color | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onColorHover = useCallback((color: Color | null) => {
    setHoveredColor(color);
    // Moving onto another cell cancels a stale "Copied!" message.
    if (color) setCopiedColor(null);
  }, []);

  const onColorCopy = useCallback(async (color: Color) => {
    try {
      await copyColorToClipboard(color);
    } catch (error) {
      console.error("Failed to copy color:", error);
      return;
    }
    setCopiedColor(color);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const trackPointer = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    [containerRef],
  );

  const target = copiedColor ?? hoveredColor;
  const tooltipProps = target
    ? {
        color: target,
        position,
        message: copiedColor ? "Copied!" : "Click to copy",
        messageStyle: copiedColor
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
