import { Pad, Wheel } from "@/components/geometry-controls";
import { oklchToColor, oklchToRgb } from "@/lib/color-engine";
import { Color, OKLCH } from "@/types";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";

type ColorPickerProps = {
  color: Color;
  onChange: (color: Color) => void;
  maxChroma?: number;
  ringInner?: number;
  ringOuter?: number;
  rectRes?: number;
};

// conic-gradient always runs clockwise from its start angle, while hue runs
// counterclockwise from the right, so start at 90° (screen right) and walk
// the stops in decreasing hue order.
const hueGradient = (l: number, c: number): CSSProperties => {
  const hex = (h: number) => oklchToColor({ l, c, h }).hex;
  const stops = Array.from(
    { length: 72 },
    (_, i) => `${hex((360 - i * 5) % 360)} ${i * 5}deg`,
  ).join(", ");
  return {
    background: `conic-gradient(from 90deg, ${stops}, ${hex(0)} 360deg)`,
  };
};

const lcGradient = (
  hue: number,
  maxChroma: number,
  rectRes: number,
): ImageData => {
  const img = new ImageData(rectRes, rectRes);
  for (let yi = 0; yi < rectRes; yi++) {
    const l = 1 - yi / (rectRes - 1);
    for (let xi = 0; xi < rectRes; xi++) {
      const c = (xi / (rectRes - 1)) * maxChroma;
      const [r, g, b] = oklchToRgb(l, c, hue);
      const k = (yi * rectRes + xi) * 4;
      img.data[k] = r;
      img.data[k + 1] = g;
      img.data[k + 2] = b;
      img.data[k + 3] = 255;
    }
  }
  return img;
};

export const ColorPicker = ({
  color,
  onChange,
  maxChroma = 1,
  ringInner = 0.4,
  ringOuter = 0.5,
  rectRes = 64,
}: ColorPickerProps) => {
  const [lch, setLch] = useState<OKLCH>(color.oklch);
  const selfHex = useRef(color.hex);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const hueRing = useMemo(() => hueGradient(lch.l, lch.c), [lch.l, lch.c]);
  const squareRatio = (ringInner - 0.02) * Math.SQRT2;
  const squarePct = squareRatio * 100;
  const offsetPct = ((1 - squareRatio) / 2) * 100;

  useEffect(() => {
    if (color.hex === selfHex.current) return;
    selfHex.current = color.hex;
    setLch(color.oklch);
  }, [color]);

  const commit = (next: OKLCH) => {
    setLch(next);
    const mapped = oklchToColor(next);
    selfHex.current = mapped.hex;
    onChange(mapped);
  };

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.putImageData(lcGradient(lch.h, maxChroma, rectRes), 0, 0);
  }, [lch.h, maxChroma, rectRes]);

  return (
    <Wheel
      values={[lch.h]}
      onChange={(_, h) => commit({ ...lch, h })}
      inner={ringInner}
      outer={ringOuter}
      ringStyle={hueRing}
      labels={["Hue"]}
    >
      <div
        className="absolute"
        style={{
          left: `${offsetPct}%`,
          top: `${offsetPct}%`,
          width: `${squarePct}%`,
          height: `${squarePct}%`,
        }}
      >
        <Pad
          values={[[lch.c, lch.l]]}
          onChange={(_, [c, l]) => commit({ ...lch, c, l })}
          xMax={maxChroma}
          yMax={1}
          labels={["Chroma and lightness"]}
        >
          <canvas
            ref={canvasRef}
            width={rectRes}
            height={rectRes}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              pointerEvents: "none",
            }}
          />
        </Pad>
      </div>
    </Wheel>
  );
};
