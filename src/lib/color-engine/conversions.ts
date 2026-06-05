import { Color as ColorType } from "@/types";
import Color from "colorjs.io";

// Engine interface uses normalized C (0-1) where 1 = MAX_CHROMA.
export const MAX_CHROMA = 0.4;

export function rgbToColor(r: number, g: number, b: number): ColorType {
  const color = new Color("srgb", [r / 255, g / 255, b / 255]);
  // colorjs.io v0.6 coords are (number | null)[]; null is a powerless component
  // (e.g. an achromatic hue), which we treat as 0.
  const [L, C, h] = color.to("oklch").coords;
  return {
    hex: `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`,
    rgb: [r, g, b],
    oklch: [L ?? 0, (C ?? 0) / MAX_CHROMA, h == null || isNaN(h) ? 0 : h],
  };
}

function isInSRGBGamut(L: number, C_native: number, h: number): boolean {
  try {
    return new Color("oklch", [L, C_native, h])
      .to("srgb")
      .coords.every((v) => v != null && v >= -0.001 && v <= 1.001);
  } catch {
    return false;
  }
}

// Convert OKLCH to Color. C is normalized (0-1), where 1 = MAX_CHROMA.
// Out-of-gamut colors: C is reduced via binary search, preserving L and h.
export function oklchToColor(L: number, C: number, h: number): ColorType {
  let finalC_native = C * MAX_CHROMA;

  if (!isInSRGBGamut(L, finalC_native, h)) {
    let lo = 0,
      hi = finalC_native;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (isInSRGBGamut(L, mid, h)) lo = mid;
      else hi = mid;
    }
    finalC_native = lo;
  }

  const srgb = new Color("oklch", [L, finalC_native, h]).to("srgb").coords;
  const rgb: [number, number, number] = [
    Math.max(0, Math.min(255, Math.round((srgb[0] ?? 0) * 255))),
    Math.max(0, Math.min(255, Math.round((srgb[1] ?? 0) * 255))),
    Math.max(0, Math.min(255, Math.round((srgb[2] ?? 0) * 255))),
  ];
  return {
    hex: `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`,
    rgb,
    oklch: [L, finalC_native / MAX_CHROMA, h],
  };
}

// Fast OKLCH → sRGB 0-255 (Björn Ottosson), with no gamut mapping — out-of-gamut
// channels are simply clipped. C is normalized (0-1, 1 = MAX_CHROMA), matching
// oklchToColor. Hand-rolled (not colorjs.io) for bulk/per-pixel work where a
// Color allocation + general conversion graph per call would be too slow
// (e.g. painting a color field).
export function oklchToRgb(
  L: number,
  C: number,
  h: number,
): [number, number, number] {
  const c = C * MAX_CHROMA;
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const lc = l_ ** 3,
    mc = m_ ** 3,
    sc = s_ ** 3;

  const lr = +4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc;
  const lg = -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc;
  const lb = -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc;

  const enc = (x: number) => {
    const v = Math.max(0, Math.min(1, x));
    return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  };
  return [
    Math.round(enc(lr) * 255),
    Math.round(enc(lg) * 255),
    Math.round(enc(lb) * 255),
  ];
}
