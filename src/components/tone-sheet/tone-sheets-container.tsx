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
const ENTRY_OFFSET = W;

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

type ToneSheetLayerProps = {
  colors: Color[][];
  index: number;
  isActive: boolean;
  isDimmed: boolean;
  left: number;
  zIndex: number;
  entryDirection: "left" | "right";
  onSheetClick: (index: number) => void;
  onColorHover: (color: Color | null) => void;
  onColorCopy: (color: Color) => void;
};

const ToneSheetLayer = ({
  colors,
  index,
  isActive,
  isDimmed,
  left,
  zIndex,
  entryDirection,
  onSheetClick,
  onColorHover,
  onColorCopy,
}: ToneSheetLayerProps) => {
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHasEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const entryOffset = entryDirection === "left" ? -ENTRY_OFFSET : ENTRY_OFFSET;

  return (
    <div
      className="absolute cursor-pointer transition-[left,transform,opacity] duration-300"
      style={{
        left: `${left}px`,
        top: `${VERTICAL_OFFSET}px`,
        width: `${W}px`,
        height: `${H}px`,
        zIndex,
        opacity: hasEntered ? (isDimmed ? 0.3 : 1) : 0,
        transform: `translateX(${hasEntered ? 0 : entryOffset}px)`,
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
};

export const ToneSheetsContainer = ({
  grids,
  activeSheetIndex,
  onSheetClick,
  onContainerClick,
}: ToneSheetsContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [initialSheetCount] = useState(() => grids.length);
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
            <ToneSheetLayer
              key={index}
              colors={colors}
              index={index}
              isActive={isActive}
              isDimmed={activeSheetIndex !== -1 && !isActive}
              left={left}
              zIndex={isActive ? 100 : n - index}
              entryDirection={
                index < initialSheetCount ? "left" : "right"
              }
              onSheetClick={onSheetClick}
              onColorHover={onColorHover}
              onColorCopy={onColorCopy}
            />
          );
        })}
      </div>

      {tooltipProps && <ColorTooltip {...tooltipProps} />}
    </div>
  );
};
