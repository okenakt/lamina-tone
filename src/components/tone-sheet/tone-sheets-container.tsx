import React, { useState, useEffect, useRef } from "react";
import { ToneSheetData } from "@/types";
import ToneSheet from "./tone-sheet";
import { TONESHEET_SIZE, GRID_CONTROLS } from "@/constants/ui";

interface ToneSheetsContainerProps {
  toneSheets: ToneSheetData[];
  activeSheetIndex: number;
  dimensions: { lightness: number; chroma: number };
  chromaRange: { min: number; max: number };
  lightnessRange: { min: number; max: number };
  onSheetClick: (index: number) => void;
  onContainerClick: () => void;
}

// Helper function to calculate dynamic spacing and container dimensions
const calculateDynamicLayout = (sheetCount: number, activeSheetIndex: number, containerWidth: number) => {
  const H = TONESHEET_SIZE.height;
  const W = TONESHEET_SIZE.width;
  const skewExtension = H; // Horizontal expansion due to skewY(45°)
  const minSpacing = 20; // Minimum spacing between sheets
  
  if (sheetCount <= 1) {
    return {
      spacing: 0,
      containerDimensions: {
        width: W + skewExtension,
        height: H + W + 40
      }
    };
  }
  
  // Calculate available width for spacing
  const availableWidth = containerWidth - (sheetCount * W) - skewExtension;
  const totalGaps = sheetCount - 1;
  
  // Add extra gap for selected sheet (if not first)
  const extraGaps = activeSheetIndex > 0 && activeSheetIndex !== -1 ? 1 : 0;
  const totalGapsWithExtra = totalGaps + extraGaps;
  
  // Calculate dynamic spacing (minimum 20px)
  const dynamicSpacing = Math.max(minSpacing, availableWidth / totalGapsWithExtra);
  
  return {
    spacing: dynamicSpacing,
    containerDimensions: {
      width: containerWidth,
      height: H + W + 40
    }
  };
};

// Helper function to calculate positioning offsets
const calculateOffsets = () => {
  const H = TONESHEET_SIZE.height;
  const W = TONESHEET_SIZE.width;
  
  return {
    vertical: (H + W + 40) / 2 - H / 2, // Center vertically with proper transform origin
    horizontal: H / 2 // Start from the skew offset, sheets will be positioned relative to this
  };
};

export const ToneSheetsContainer: React.FC<ToneSheetsContainerProps> = ({
  toneSheets,
  activeSheetIndex,
  dimensions,
  chromaRange,
  lightnessRange,
  onSheetClick,
  onContainerClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerWidth(rect.width);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Use measured container width for calculations
  const parentWidth = containerWidth;
  
  const { spacing, containerDimensions } = calculateDynamicLayout(
    toneSheets.length, 
    activeSheetIndex, 
    parentWidth
  );
  const { vertical: verticalOffset } = calculateOffsets();

  // Calculate the total width occupied by all sheets including gaps
  const extraGap = activeSheetIndex > 0 && activeSheetIndex !== -1 ? spacing : 0;
  const totalSheetsWidth = toneSheets.length > 0 
    ? TONESHEET_SIZE.width + (toneSheets.length - 1) * spacing + extraGap
    : 0;
  
  // Calculate positioning based on selection
  let startX: number;
  if (activeSheetIndex === -1 || toneSheets.length === 0) {
    // No selection: center entire group
    startX = (containerDimensions.width - totalSheetsWidth) / 2;
  } else {
    // Selection exists: center the selected sheet
    // Calculate where the selected sheet would be positioned relative to startX = 0
    const extraOffsetForSelected = activeSheetIndex > 0 ? spacing : 0;
    const selectedSheetRelativePosition = activeSheetIndex * spacing + extraOffsetForSelected;
    const selectedSheetCenter = selectedSheetRelativePosition + TONESHEET_SIZE.width / 2;
    const containerCenter = containerDimensions.width / 2;
    startX = containerCenter - selectedSheetCenter;
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex justify-center items-center overflow-hidden"
      style={{ perspective: '1500px' }}
      onClick={onContainerClick}
    >
      <div 
        className="relative"
        style={{ 
          width: `${containerDimensions.width}px`,
          height: `${containerDimensions.height}px`
        }}
        onClick={(e) => e.stopPropagation()} // Prevent deselection when clicking on sheets area
      >
        {toneSheets.map((sheet, index) => {
          // Add extra spacing before the active sheet
          const extraOffset = index >= activeSheetIndex && activeSheetIndex > 0 && activeSheetIndex !== -1 ? spacing : 0;
          const horizontalOffset = startX + index * spacing + extraOffset;
          
          return (
            <div
              key={sheet.id}
              className="cursor-pointer transition-all duration-300 absolute"
              style={{
                left: `${horizontalOffset}px`,
                top: `${verticalOffset}px`,
                zIndex: 50 - index,
                transformStyle: 'preserve-3d',
                width: `${TONESHEET_SIZE.width}px`,
                height: `${TONESHEET_SIZE.height}px`,
              }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent container click
                onSheetClick(index);
              }}
            >
              <ToneSheet
                hue={sheet.hue}
                dimensions={dimensions}
                chromaRange={chromaRange}
                lightnessRange={lightnessRange}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};