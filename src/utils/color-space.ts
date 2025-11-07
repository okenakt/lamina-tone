import Color from "colorjs.io";
import { Color as ColorType } from "@/types";

// Convert RGB to OkLCh (better perceptual uniformity than CAM16-JMh)
export function rgbToColor(r: number, g: number, b: number): ColorType {
  const color = new Color("srgb", [r / 255, g / 255, b / 255]);
  
  // Convert to CAM16-JMh for hue extraction
  const [J, M, H] = color.to("cam16-jmh").coords;
  
  // Convert to OkLCh for uniform spacing calculations
  const [L, C, h] = color.to("oklch").coords;
  
  return {
    hex: color.to("srgb").toString({ format: "hex" }),
    rgb: [r, g, b],
    cam16jmh: [J, M, H],
    cam16ucs: [L, C, h] // Using OkLCh as UCS substitute
  };
}

// Convert CAM16-JMh to Color object
export function cam16JmhToColor(J: number, M: number, H: number): ColorType {
  try {
    const color = new Color("cam16-jmh", [J, M, H]);
    const rgbCoords = color.to("srgb").coords;
    const [L, C, h] = color.to("oklch").coords;
    
    // Clamp RGB values to valid range
    const rgb: [number, number, number] = [
      Math.max(0, Math.min(255, Math.round(rgbCoords[0] * 255))),
      Math.max(0, Math.min(255, Math.round(rgbCoords[1] * 255))),
      Math.max(0, Math.min(255, Math.round(rgbCoords[2] * 255)))
    ];
    
    return {
      hex: `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`,
      rgb,
      cam16jmh: [J, M, H],
      cam16ucs: [L, C, h] // Using OkLCh
    };
  } catch {
    // Fallback for out-of-gamut colors using OkLCh
    console.warn(`CAM16-JMh conversion failed for J=${J}, M=${M}, H=${H}, trying OkLCh fallback`);
    
    try {
      // Convert hue to radians for OkLCh
      const hueRad = H * Math.PI / 180;
      const color = new Color("oklch", [J / 100, M / 100, hueRad]);
      const rgbCoords = color.to("srgb").coords;
      
      const rgb: [number, number, number] = [
        Math.max(0, Math.min(255, Math.round(rgbCoords[0] * 255))),
        Math.max(0, Math.min(255, Math.round(rgbCoords[1] * 255))),
        Math.max(0, Math.min(255, Math.round(rgbCoords[2] * 255)))
      ];
      
      return {
        hex: `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`,
        rgb,
        cam16jmh: [J, M, H],
        cam16ucs: [J / 100, M / 100, H] // Normalized values
      };
    } catch {
      // Ultimate fallback
      return {
        hex: "#808080",
        rgb: [128, 128, 128],
        cam16jmh: [J, M, H],
        cam16ucs: [0.5, 0, H]
      };
    }
  }
}

// Calculate perceptual distance between two colors in OkLCh space
export function calculateColorDistance(color1: ColorType, color2: ColorType): number {
  const [L1, C1, h1] = color1.cam16ucs; // Actually OkLCh
  const [L2, C2, h2] = color2.cam16ucs;
  
  // Convert to Cartesian coordinates for distance calculation
  const a1 = C1 * Math.cos(h1 * Math.PI / 180);
  const b1 = C1 * Math.sin(h1 * Math.PI / 180);
  const a2 = C2 * Math.cos(h2 * Math.PI / 180);
  const b2 = C2 * Math.sin(h2 * Math.PI / 180);
  
  return Math.sqrt((L1 - L2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
}

// Generate a 2D grid of colors with specified parameters
export function generateColorGrid(
  baseHue: number,
  gridSize: { rows: number; cols: number },
  chromaRange: { min: number; max: number },
  lightnessRange: { min: number; max: number }
): ColorType[][] {
  const { rows, cols } = gridSize;
  const colors: ColorType[][] = [];
  
  for (let i = 0; i < rows; i++) {
    const row: ColorType[] = [];
    
    for (let j = 0; j < cols; j++) {
      // Interpolate chroma (horizontal axis)
      const chroma = cols === 1 ? 
        (chromaRange.min + chromaRange.max) / 2 :
        chromaRange.min + (chromaRange.max - chromaRange.min) * j / (cols - 1);
      
      // Interpolate lightness (vertical axis, inverted)
      const lightness = rows === 1 ?
        (lightnessRange.min + lightnessRange.max) / 2 :
        lightnessRange.max - (lightnessRange.max - lightnessRange.min) * i / (rows - 1);
      
      const color = cam16JmhToColor(lightness, chroma, baseHue);
      row.push(color);
    }
    
    colors.push(row);
  }
  
  return colors;
}

// Generate random color suggestions
export function generateRandomColors(count: number = 8): ColorType[] {
  const colors: ColorType[] = [];
  
  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    
    colors.push(rgbToColor(r, g, b));
  }
  
  return colors;
}

// Extract hue from a color
export function getHueFromColor(color: ColorType): number {
  return color.cam16jmh[2]; // H component
}

// Copy color to clipboard
export async function copyColorToClipboard(color: ColorType): Promise<void> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(color.hex);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = color.hex;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  } catch (error) {
    console.error("Failed to copy color to clipboard:", error);
  }
}