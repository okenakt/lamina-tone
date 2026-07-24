import { ColorPicker, HexInput, RgbSlider } from "@/components/color-editor";
import { Button } from "@/components/ui/button";
import { INITIAL_COLOR } from "@/constants";
import { generateRandomColor } from "@/lib/color-engine";
import { Color } from "@/types";
import { useState } from "react";

type ColorPickerPageProps = {
  onColorSelect: (color: Color) => void;
};

export const ColorPickerPage = ({ onColorSelect }: ColorPickerPageProps) => {
  const [currentColor, setCurrentColor] = useState<Color>(INITIAL_COLOR);

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-4 text-sm text-ink-2">
        <p className="text-center">
          <span className="font-display font-medium text-ink">Lamina Tone</span>{" "}
          builds a perceptually uniform 3D grid across Hue, Lightness, and
          Chroma.
        </p>
        <ol className="list-decimal space-y-1">
          <li>Pick your starting color with the color picker.</li>
          <li>
            Explore your palette by adjusting the ranges and counts of each
            axis.
          </li>
          <li>Export your palette for your project.</li>
        </ol>
      </div>
      <p className="text-center text-sm text-ink-2">
        Pick a starting color or{" "}
        <button
          className="rounded-sm underline decoration-rule underline-offset-2 transition-colors duration-200 ease-out outline-none hover:text-accent hover:decoration-accent focus-visible:ring-2 focus-visible:ring-focus"
          onClick={() => setCurrentColor(generateRandomColor())}
        >
          🎲 generate one
        </button>
      </p>
      <div className="flex w-full max-w-2xs flex-col items-center gap-4 md:max-w-2xl md:flex-row">
        <div className="w-full shrink-0 md:max-w-2xs">
          <ColorPicker color={currentColor} onChange={setCurrentColor} />
        </div>
        <div className="flex w-full flex-col gap-4">
          <RgbSlider color={currentColor} onChange={setCurrentColor} />
          <HexInput color={currentColor} onChange={setCurrentColor} />
        </div>
      </div>
      <Button
        className="bg-accent px-4 py-2 text-sm font-medium text-accent-ink hover:bg-accent-strong"
        onClick={() => onColorSelect(currentColor)}
      >
        Start →
      </Button>
    </div>
  );
};
