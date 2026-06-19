import { ColorTooltip } from "@/components/ui/color-tooltip";
import { GRID_CONTROLS, TONESHEET_SIZE } from "@/constants/tone-sheet";
import { Color } from "@/types";
import { useEffect, useRef, useState } from "react";
import { ToneSheet } from "./tone-sheet";
import { useTooltipState } from "./use-tooltip-state";

const W = TONESHEET_SIZE.width;
const H = TONESHEET_SIZE.height;
const CONTAINER_HEIGHT = (H + W) * 1.1;
const VERTICAL_OFFSET = CONTAINER_HEIGHT / 2 - H / 2;

const COMPACT_SPACING = 10;

function sheetOffset(
  index: number,
  activeIndex: number,
  normalSpacing: number,
): number {
  if (activeIndex === -1) {
    return index * normalSpacing;
  }

  if (index < activeIndex) {
    return index * COMPACT_SPACING;
  }

  const activePos =
    activeIndex > 0 ? (activeIndex - 1) * COMPACT_SPACING + W : 0;

  if (index === activeIndex) {
    return activePos;
  }

  // W gap after active sheet, then compact spacing for the rest
  return activePos + W + (index - activeIndex) * COMPACT_SPACING;
}

type ToneSheetsContainerProps = {
  grids: Color[][][];
  activeSheetIndex: number;
  onSheetClick: (index: number) => void;
  onContainerClick: () => void;
};

export const ToneSheetsContainer = ({
  grids,
  activeSheetIndex,
  onSheetClick,
  onContainerClick,
}: ToneSheetsContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(600);
  const { tooltipProps, onColorHover, onColorCopy, pointerProps } =
    useTooltipState(containerRef);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.getBoundingClientRect().width);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const n = grids.length;
  const normalSpacing = GRID_CONTROLS.spacing;

  // Rightmost sheet's offset from startX
  const lastOffset =
    n > 0 ? sheetOffset(n - 1, activeSheetIndex, normalSpacing) : 0;
  // Total visual width accounts for skewY ±H/2 extension on each side
  const totalVisualWidth = n > 0 ? lastOffset + W + H : 0;
  // Center the group: leftmost content edge (startX - H/2) = (containerWidth - totalVisualWidth) / 2
  const startX =
    n > 0
      ? (containerWidth - totalVisualWidth) / 2 + H / 2
      : containerWidth / 2;

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center overflow-hidden"
      onClick={onContainerClick}
      {...pointerProps}
    >
      <div
        className="relative isolate shrink-0"
        style={{
          width: `${containerWidth}px`,
          height: `${CONTAINER_HEIGHT}px`,
        }}
      >
        {grids.map((colors, index) => {
          const isActive = index === activeSheetIndex;
          const left =
            startX + sheetOffset(index, activeSheetIndex, normalSpacing);

          return (
            <div
              key={index}
              className="absolute cursor-pointer transition-all duration-300"
              style={{
                left: `${left}px`,
                top: `${VERTICAL_OFFSET}px`,
                width: `${W}px`,
                height: `${H}px`,
                zIndex: isActive ? 100 : n - index,
                opacity: activeSheetIndex !== -1 && !isActive ? 0.3 : 1,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSheetClick(index);
              }}
            >
              <ToneSheet
                colors={colors}
                isActive={isActive}
                onColorHover={isActive ? onColorHover : undefined}
                onColorCopy={isActive ? onColorCopy : undefined}
              />
            </div>
          );
        })}
      </div>

      {tooltipProps && <ColorTooltip {...tooltipProps} />}
    </div>
  );
};
