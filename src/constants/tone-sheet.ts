// Tone-sheet layout ratios. Sheets scale with their container, so every gap is
// expressed as a fraction of the sheet size rather than an absolute px value.
export const SHEET_GAP_NORMAL_RATIO = 0.2; // sheet-to-sheet gap when no sheet is active
export const SHEET_GAP_COMPACT_RATIO = 0.05; // sheet-to-sheet gap around the active sheet
export const CELL_GAP_RATIO = 0.01; // gap between color cells within a sheet

export const AXIS_LIMITS = {
  minSize: 1,
  maxSize: 9,
} as const;
