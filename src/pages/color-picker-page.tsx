import { ColorPicker } from "@/components/color-picker";
import { RgbSlider } from "@/components/color-slider";
import { generateRandomColors, oklchToColor } from "@/lib/color-engine";
import { Color } from "@/types";
import { useState } from "react";

type ColorPickerPageProps = {
  onColorSelect: (color: Color) => void;
};

const INITIAL: Color = oklchToColor(0.7, 0.4, 30);

export const ColorPickerPage = ({ onColorSelect }: ColorPickerPageProps) => {
  const [preview, setPreview] = useState<Color>(INITIAL);
  // Legible text on the tinted Start button: dark text on light colors, white on dark.
  const startText = preview.oklch[0] > 0.6 ? "#1f2937" : "#ffffff";

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-8">
      <div className="flex w-full max-w-xl flex-col items-center gap-6">
        <p className="text-center text-sm text-gray-400">
          Pick a starting color
        </p>

        <div className="flex w-full flex-col gap-6 md:flex-row md:items-stretch md:justify-center">
          {/* Wheel + random shortcut */}
          <div className="flex flex-shrink-0 flex-col items-center gap-3">
            <ColorPicker value={preview} onColorChange={setPreview} />
            <button
              onClick={() => setPreview(generateRandomColors(1)[0])}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
            >
              🎲 Random
            </button>
          </div>

          {/* Sliders + preview / Start */}
          <div className="flex w-full flex-1 flex-col justify-center gap-4">
            <RgbSlider value={preview} onChange={setPreview} />

            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-gray-400 select-all">
                {preview.hex.toUpperCase()}
              </span>
              <button
                onClick={() => onColorSelect(preview)}
                className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium shadow-sm transition hover:brightness-95"
                style={{ backgroundColor: preview.hex, color: startText }}
              >
                Start →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
