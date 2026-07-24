import { ColorTooltip } from "@/components/ui/color-tooltip";
import {
  SHEET_GAP_COMPACT_RATIO,
  SHEET_GAP_NORMAL_RATIO,
} from "@/constants/tone-sheet";
import { Color } from "@/types";
import { useEffect, useRef, useState } from "react";
import { ToneSheet } from "./tone-sheet";
import { useTooltipState } from "./use-tooltip-state";

// Sheet box is square (W === H). skewY(45deg) extends each sheet by ±size/2
// vertically, so the layer band needs size * HEIGHT_FACTOR of vertical room
// (2 for the skew span, 0.2 for breathing space).
const HEIGHT_FACTOR = 2.2;
const MIN_SHEET = 96;
// Band height used for the first paint, before the ResizeObserver reports the
// real container size.
const INITIAL_BAND_HEIGHT = 440;

// Resolve the sheet size from the available container height. There is no
// upper bound: the parent owns the sizing, so the container's height alone
// drives how large the sheets render. A small floor guards against degenerate
// (near-zero) heights before the first measurement settles.
function resolveSheetSize(containerHeight: number): number {
  return Math.max(MIN_SHEET, containerHeight / HEIGHT_FACTOR);
}

function sheetOffset(
  index: number,
  activeIndex: number,
  size: number,
  normalSpacing: number,
  compactSpacing: number,
): number {
  if (activeIndex === -1) {
    return index * normalSpacing;
  }

  if (index < activeIndex) {
    return index * compactSpacing;
  }

  const activePos =
    activeIndex > 0 ? (activeIndex - 1) * compactSpacing + size : 0;

  if (index === activeIndex) {
    return activePos;
  }

  // A full sheet-width gap after the active sheet, then compact spacing
  return activePos + size + (index - activeIndex) * compactSpacing;
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
  size: number;
  verticalOffset: number;
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
  size,
  verticalOffset,
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

  const entryOffset = entryDirection === "left" ? -size : size;

  return (
    <div
      className="absolute cursor-pointer transition-[left,transform,opacity] duration-300 ease-out"
      style={{
        left: `${left}px`,
        top: `${verticalOffset}px`,
        width: `${size}px`,
        height: `${size}px`,
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
        size={size}
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
  const [containerHeight, setContainerHeight] = useState(INITIAL_BAND_HEIGHT);
  const { tooltipProps, onColorHover, onColorCopy, pointerProps } =
    useTooltipState(containerRef);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setContainerWidth(rect.width);
      setContainerHeight(rect.height);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const n = grids.length;
  // Sheet size follows the available container height (capped at the design
  // maximum), and all geometry derives from it so sheets scale as a whole.
  const size = resolveSheetSize(containerHeight);
  const containerBandHeight = size * HEIGHT_FACTOR;
  const verticalOffset = containerBandHeight / 2 - size / 2;
  const normalSpacing = size * SHEET_GAP_NORMAL_RATIO;
  const compactSpacing = size * SHEET_GAP_COMPACT_RATIO;

  // Rightmost sheet's offset from startX
  const lastOffset =
    n > 0
      ? sheetOffset(n - 1, activeSheetIndex, size, normalSpacing, compactSpacing)
      : 0;
  // Total visual width accounts for skewY ±size/2 extension on each side
  const totalVisualWidth = n > 0 ? lastOffset + size + size : 0;
  // Center the group: leftmost content edge (startX - size/2) = (containerWidth - totalVisualWidth) / 2
  const startX =
    n > 0
      ? (containerWidth - totalVisualWidth) / 2 + size / 2
      : containerWidth / 2;

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full min-w-0 items-center overflow-hidden"
      onClick={onContainerClick}
      {...pointerProps}
    >
      <div
        className="relative isolate shrink-0"
        style={{
          width: `${containerWidth}px`,
          height: `${containerBandHeight}px`,
        }}
      >
        {grids.map((colors, index) => {
          const isActive = index === activeSheetIndex;
          const left =
            startX +
            sheetOffset(
              index,
              activeSheetIndex,
              size,
              normalSpacing,
              compactSpacing,
            );

          return (
            <ToneSheetLayer
              key={index}
              colors={colors}
              index={index}
              size={size}
              verticalOffset={verticalOffset}
              isActive={isActive}
              isDimmed={activeSheetIndex !== -1 && !isActive}
              left={left}
              zIndex={isActive ? 100 : n - index}
              entryDirection={index < initialSheetCount ? "left" : "right"}
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
