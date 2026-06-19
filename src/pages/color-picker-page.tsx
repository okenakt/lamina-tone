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
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <p className="text-center text-sm text-gray-400">
        Pick a starting color or{" "}
        <button
          className="text-gray-500 underline decoration-gray-300 underline-offset-2 transition-colors hover:text-gray-700 hover:decoration-gray-400"
          onClick={() => setCurrentColor(generateRandomColor())}
        >
          🎲 generate one
        </button>
      </p>
      <div className="flex flex-col items-center gap-4 md:w-full md:flex-row">
        <div className="w-full max-w-60 shrink-0">
          <ColorPicker color={currentColor} onChange={setCurrentColor} />
        </div>
        <div className="flex w-full flex-col gap-4">
          <RgbSlider color={currentColor} onChange={setCurrentColor} />
          <HexInput color={currentColor} onChange={setCurrentColor} />
        </div>
      </div>
      <Button
        className="bg-linear-135 from-cyan-500 to-purple-500 text-white hover:brightness-110"
        onClick={() => onColorSelect(currentColor)}
      >
        Start →
      </Button>
    </div>
  );
};
