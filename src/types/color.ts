export type RGB = {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
};

export type OKLCH = {
  l: number; // 0-1
  c: number; // 0-1 normalized, 1=max sRGB chroma (0.4)
  h: number; // 0-360°
};

export type Color = {
  hex: string;
  rgb: RGB;
  oklch: OKLCH;
};
