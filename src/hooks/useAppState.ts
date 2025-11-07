import { useState } from "react";
import { AppState, Color, ToneSheetData, AxisType } from "@/types";
import { getHueFromColor } from "@/utils/color-space";
import { AXIS_LIMITS } from "@/constants/ui";

const initialState: AppState = {
  toneSheets: [],
  activeSheetIndex: -1, // -1 means no selection
  dimensions: { lightness: 1, chroma: 1, hue: 0 },
  globalChromaRange: { min: 50, max: 100 },
  globalLightnessRange: { min: 50, max: 100 },
  globalHueRange: { min: 0, max: 180 },
  showColorInfo: true,
  selectedColor: null,
};

export const useAppState = () => {
  const [appState, setAppState] = useState<AppState>(initialState);

  const handleColorSelect = (color: Color) => {
    const hue = getHueFromColor(color);
    const newSheet: ToneSheetData = {
      id: `sheet-${Date.now()}`,
      hue,
      baseColor: color,
    };

    const [lightness, chroma] = color.cam16jmh;

    setAppState((prev) => ({
      ...prev,
      toneSheets: [...prev.toneSheets, newSheet],
      activeSheetIndex: prev.toneSheets.length,
      dimensions: { ...prev.dimensions, hue: prev.toneSheets.length + 1 },
      selectedColor: color,
      globalChromaRange: prev.toneSheets.length === 0 ? {
        min: Math.max(50, chroma - 25),
        max: Math.min(100, chroma + 25)
      } : prev.globalChromaRange,
      globalLightnessRange: prev.toneSheets.length === 0 ? {
        min: Math.max(50, lightness - 25),
        max: Math.min(100, lightness + 25)
      } : prev.globalLightnessRange,
      globalHueRange: prev.toneSheets.length === 0 ? {
        min: Math.max(0, hue - 90),
        max: Math.min(180, hue + 90)
      } : prev.globalHueRange,
    }));
  };

  const redistributeHues = (toneSheets: ToneSheetData[], hueRange: { min: number; max: number }) => {
    const step = toneSheets.length === 1 ? 0 : (hueRange.max - hueRange.min) / (toneSheets.length - 1);
    
    return toneSheets.map((sheet, index) => ({
      ...sheet,
      hue: hueRange.min + (step * index),
      baseColor: {
        ...sheet.baseColor,
        cam16jmh: [
          sheet.baseColor.cam16jmh[0],
          sheet.baseColor.cam16jmh[1], 
          hueRange.min + (step * index),
        ] as [number, number, number]
      }
    }));
  };

  const handleAxisResize = (axis: AxisType, change: number) => {
    setAppState((prev) => {
      const newDimensions = { ...prev.dimensions };
      
      if (axis === "hue") {
        const currentHueCount = prev.toneSheets.length;
        const newHueCount = Math.max(AXIS_LIMITS.minSize, Math.min(AXIS_LIMITS.maxSize, currentHueCount + change));
        
        if (change > 0 && (prev.selectedColor || prev.toneSheets.length > 0) && currentHueCount < AXIS_LIMITS.maxSize) {
          // Add new hue sheet
          const { min, max } = prev.globalHueRange;
          const step = newHueCount === 1 ? 0 : (max - min) / (newHueCount - 1);
          
          const newHue = min + (step * currentHueCount);
          
          const baseColor = prev.selectedColor || prev.toneSheets[0]?.baseColor;
          if (!baseColor) return prev;
          
          const newSheet: ToneSheetData = {
            id: `sheet-${Date.now()}`,
            hue: newHue,
            baseColor: {
              ...baseColor,
              cam16jmh: [
                baseColor.cam16jmh[0],
                baseColor.cam16jmh[1],
                newHue,
              ] as [number, number, number],
            },
          };

          const updatedSheets = redistributeHues(prev.toneSheets, prev.globalHueRange);
          newDimensions.hue = newHueCount;
          
          return {
            ...prev,
            toneSheets: [...updatedSheets, newSheet],
            dimensions: newDimensions,
            activeSheetIndex: Math.min(prev.activeSheetIndex, currentHueCount),
          };
        } else if (change < 0 && currentHueCount > AXIS_LIMITS.minSize) {
          const remainingSheets = prev.toneSheets.slice(0, -1);
          const updatedSheets = redistributeHues(remainingSheets, prev.globalHueRange);
          newDimensions.hue = newHueCount;

          return {
            ...prev,
            toneSheets: updatedSheets,
            dimensions: newDimensions,
            activeSheetIndex: Math.min(prev.activeSheetIndex, newHueCount - 1),
          };
        }
      } else {
        if (axis === "lightness") {
          newDimensions.lightness = Math.max(AXIS_LIMITS.minSize, Math.min(AXIS_LIMITS.maxSize, newDimensions.lightness + change));
        } else if (axis === "chroma") {
          newDimensions.chroma = Math.max(AXIS_LIMITS.minSize, Math.min(AXIS_LIMITS.maxSize, newDimensions.chroma + change));
        }

        return {
          ...prev,
          dimensions: newDimensions,
        };
      }
      return prev;
    });
  };

  const handleSheetClick = (index: number) => {
    setAppState((prev) => ({
      ...prev,
      activeSheetIndex: index,
    }));
  };

  const handleContainerClick = () => {
    setAppState((prev) => ({
      ...prev,
      activeSheetIndex: -1, // Deselect all sheets
    }));
  };

  const resetApp = () => {
    setAppState((prev) => ({ 
      ...prev, 
      toneSheets: [], 
      dimensions: { lightness: 1, chroma: 1, hue: 0 } 
    }));
  };

  const updateRange = (rangeType: 'hue' | 'chroma' | 'lightness', min: number, max: number) => {
    setAppState(prev => {
      const updates: Partial<AppState> = {};
      
      if (rangeType === 'hue') {
        updates.globalHueRange = { min, max };
        
        if (prev.toneSheets.length > 0) {
          updates.toneSheets = redistributeHues(prev.toneSheets, { min, max });
        }
      } else if (rangeType === 'chroma') {
        updates.globalChromaRange = { min, max };
      } else {
        updates.globalLightnessRange = { min, max };
      }
      
      return { ...prev, ...updates };
    });
  };

  return {
    appState,
    handleColorSelect,
    handleAxisResize,
    handleSheetClick,
    handleContainerClick,
    resetApp,
    updateRange,
  };
};