import { rgbToColor } from "@/lib/color-engine";
import { Color } from "@/types";
import { ColorSlider } from "./color-slider";

type RgbSliderProps = {
  value: Color;
  onChange: (color: Color) => void;
};

const CHANNELS = ["R", "G", "B"] as const;

// Track gradient for channel i: vary that channel 0→255, keep the other two fixed.
const channelGradient = (rgb: [number, number, number], i: number) => {
  const lo = [...rgb] as [number, number, number];
  const hi = [...rgb] as [number, number, number];
  lo[i] = 0;
  hi[i] = 255;
  return `linear-gradient(to right, rgb(${lo.join(",")}), rgb(${hi.join(",")}))`;
};

export const RgbSlider = ({ value, onChange }: RgbSliderProps) => {
  const setChannel = (i: number, raw: number) => {
    const rgb = [...value.rgb] as [number, number, number];
    rgb[i] = Math.max(0, Math.min(255, Math.round(raw) || 0));
    onChange(rgbToColor(rgb[0], rgb[1], rgb[2]));
  };

  return (
    <div className="flex w-full flex-col gap-2.5">
      {CHANNELS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <span className="w-3 text-xs font-medium text-gray-500">{label}</span>
          <ColorSlider
            value={value.rgb[i]}
            max={255}
            gradient={channelGradient(value.rgb, i)}
            onChange={(v) => setChannel(i, v)}
            className="flex-1"
          />
          <input
            type="number"
            min={0}
            max={255}
            value={value.rgb[i]}
            onChange={(e) => setChannel(i, Number(e.target.value))}
            className="w-14 rounded border border-gray-200 px-1.5 py-1 text-center font-mono text-sm text-gray-700"
          />
        </div>
      ))}
    </div>
  );
};
