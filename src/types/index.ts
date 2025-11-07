export interface Color {
  hex: string;
  rgb: [number, number, number];
  cam16jmh: [number, number, number]; // J, M, H values
  cam16ucs: [number, number, number]; // UCS coordinates
}

export interface ToneSheetData {
  id: string;
  hue: number;
  baseColor: Color;
}

export interface AppState {
  toneSheets: ToneSheetData[];
  activeSheetIndex: number;
  dimensions: { lightness: number; chroma: number; hue: number };
  globalChromaRange: { min: number; max: number };
  globalLightnessRange: { min: number; max: number };
  globalHueRange: { min: number; max: number };
  showColorInfo: boolean;
  selectedColor: Color | null;
}

export type AxisType = 'lightness' | 'chroma' | 'hue';

export interface ToneSheetProps {
  hue: number;
  dimensions: { lightness: number; chroma: number };
  chromaRange: { min: number; max: number };
  lightnessRange: { min: number; max: number };
}

export interface ColorGridProps {
  colors: Color[][];
}

export interface ColorPickerProps {
  onColorSelect: (color: Color) => void;
}