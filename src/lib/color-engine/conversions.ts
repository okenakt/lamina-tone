import { Color as ColorType, OKLCH, RGB } from "@/types";
import Color from "colorjs.io";

export const MAX_CHROMA = 0.4;

export function rgbToColor(rgb: RGB): ColorType {
  const color = new Color("srgb", [rgb.r / 255, rgb.g / 255, rgb.b / 255]);
  // colorjs.io v0.6 coords are (number | null)[]; null is a powerless component
  // (e.g. an achromatic hue), which we treat as 0.
  const [L, C, h] = color.to("oklch").coords;
  return {
    hex: `#${[rgb.r, rgb.g, rgb.b].map((c) => c.toString(16).padStart(2, "0")).join("")}`,
    rgb: { r: rgb.r, g: rgb.g, b: rgb.b },
    oklch: {
      l: L ?? 0,
      c: (C ?? 0) / MAX_CHROMA,
      h: h == null || isNaN(h) ? 0 : h,
    },
  };
}

export function hexToColor(hex: string): ColorType | null {
  const m = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return null;
  const h =
    m[1].length === 3
      ? m[1]
          .split("")
          .map((c) => c + c)
          .join("")
      : m[1];
  return rgbToColor({
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  });
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

export function oklchToColor(oklch: OKLCH): ColorType {
  const { l, c, h } = oklch;
  let finalC_native = c * MAX_CHROMA;

  if (!isInSRGBGamut(l, finalC_native, h)) {
    let lo = 0,
      hi = finalC_native;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (isInSRGBGamut(l, mid, h)) lo = mid;
      else hi = mid;
    }
    finalC_native = lo;
  }

  const srgb = new Color("oklch", [l, finalC_native, h]).to("srgb").coords;
  const r = Math.max(0, Math.min(255, Math.round((srgb[0] ?? 0) * 255)));
  const g = Math.max(0, Math.min(255, Math.round((srgb[1] ?? 0) * 255)));
  const b = Math.max(0, Math.min(255, Math.round((srgb[2] ?? 0) * 255)));
  return {
    hex: `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`,
    rgb: { r, g, b },
    oklch: { l, c: finalC_native / MAX_CHROMA, h },
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
