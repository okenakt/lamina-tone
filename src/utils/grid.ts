export type GridDimensions = {
  cellWidth: number;
  cellHeight: number;
  rows: number;
  cols: number;
};

export const calculateGridDimensions = (
  colors: unknown[][],
  containerSize: number = 180,
): GridDimensions => {
  const rows = colors.length;
  const cols = colors[0]?.length || 1;

  // Calculate scaling to fit parent container
  const maxDimension = Math.max(rows, cols);
  const baseSize = containerSize / maxDimension;

  // Compensate for skewY transformation - cells need to be taller to appear square
  const cellWidth = baseSize;
  const cellHeight = baseSize / Math.cos(Math.PI / 4); // Compensate for 45deg skew

  return {
    cellWidth,
    cellHeight,
    rows,
    cols,
  };
};
