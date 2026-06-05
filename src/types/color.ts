export type Color = {
  hex: string;
  rgb: [number, number, number];
  oklch: [number, number, number]; // L (0-1), C (0-1 normalized, 1=max sRGB chroma), h (0-360°)
};
