import { Slider } from "@/components/geometry-controls";
import { rgbToColor } from "@/lib/color-engine";
import { Color, RGB } from "@/types";
import { CSSProperties } from "react";

type RgbSliderProps = {
  color: Color;
  onChange: (color: Color) => void;
};

// Track gradient for a channel: vary it 0→255, keeping the other two fixed.
const channelGradient = (rgb: RGB, key: keyof RGB): CSSProperties => {
  const lo = { ...rgb, [key]: 0 };
  const hi = { ...rgb, [key]: 255 };
  return {
    background: `linear-gradient(to right, rgb(${lo.r},${lo.g},${lo.b}), rgb(${hi.r},${hi.g},${hi.b}))`,
  };
};

export const RgbSlider = ({ color, onChange }: RgbSliderProps) => {
  const setChannel = (key: keyof RGB, raw: number) => {
    const v = Math.max(0, Math.min(255, Math.round(raw) || 0));
    const rgb = { ...color.rgb, [key]: v };
    onChange(rgbToColor(rgb));
  };

  return (
    <div className="flex h-full w-full flex-col gap-4">
      {Object.entries(color.rgb).map(([key, value]) => (
        <div key={key} className="flex items-center gap-4">
          <span className="w-2 text-sm font-medium text-gray-500">
            {key.toUpperCase()}
          </span>
          <Slider
            values={[value]}
            onChange={(_, v) => setChannel(key as keyof RGB, v)}
            max={255}
            className="flex-1"
            barStyle={channelGradient(color.rgb, key as keyof RGB)}
          />
          <input
            type="number"
            min={0}
            max={255}
            value={value}
            onChange={(e) =>
              setChannel(key as keyof RGB, Number(e.target.value))
            }
            className="w-14 rounded border border-gray-200 px-1.5 py-1 text-center font-mono text-sm text-gray-700"
          />
        </div>
      ))}
    </div>
  );
};
