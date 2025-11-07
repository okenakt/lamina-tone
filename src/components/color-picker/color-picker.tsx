import React, { useState, useEffect } from "react";
import { Color, ColorPickerProps } from "@/types";
import { generateRandomColors, rgbToColor } from "@/utils/color-space";
import { Button } from "@/components/ui/button";

const ColorPicker: React.FC<ColorPickerProps> = ({ onColorSelect }) => {
  const [randomColors, setRandomColors] = useState<Color[]>([]);
  const [customColor, setCustomColor] = useState("#ff6b6b");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const colors = generateRandomColors(8);
      setRandomColors(colors);
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating random colors:', error);
      setIsLoading(false);
    }
  }, []);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
  };

  const handleCustomColorSelect = () => {
    try {
      // Convert hex to RGB with better validation
      const hex = customColor.replace("#", "");
      
      // Validate hex format
      if (hex.length !== 6 || !/^[0-9A-Fa-f]+$/.test(hex)) {
        console.error('Invalid hex color format');
        return;
      }
      
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      // Validate RGB values
      if (isNaN(r) || isNaN(g) || isNaN(b)) {
        console.error('Invalid RGB values');
        return;
      }
      
      const color = rgbToColor(r, g, b);
      onColorSelect(color);
    } catch (error) {
      console.error('Error selecting custom color:', error);
    }
  };

  const handleRandomColorSelect = (color: Color) => {
    try {
      onColorSelect(color);
    } catch (error) {
      console.error('Error selecting random color:', error);
    }
  };

  const refreshRandomColors = () => {
    try {
      setIsLoading(true);
      const colors = generateRandomColors(8);
      setRandomColors(colors);
      setIsLoading(false);
    } catch (error) {
      console.error('Error refreshing random colors:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center p-8 space-y-6">
        <div className="text-gray-600">Loading color suggestions...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-8 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Choose a starting color
      </h2>
      
      {/* Custom color picker */}
      <div className="flex items-center space-x-4">
        <input
          type="color"
          value={customColor}
          onChange={handleCustomColorChange}
          className="w-12 h-12 border-2 border-gray-300 rounded cursor-pointer"
        />
        <Button
          onClick={handleCustomColorSelect}
          variant="primary"
          size="md"
        >
          Use Custom Color
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-gray-600">Or choose from suggestions:</span>
        <button
          onClick={refreshRandomColors}
          disabled={isLoading}
          className="text-blue-500 hover:text-blue-600 underline disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Random color suggestions */}
      <div className="grid grid-cols-4 gap-3">
        {randomColors.length > 0 ? (
          randomColors.map((color, index) => (
            <button
              key={index}
              onClick={() => handleRandomColorSelect(color)}
              className="w-16 h-16 border-2 border-gray-300 hover:border-gray-500 transition-colors"
              style={{ backgroundColor: color.hex }}
              title={color.hex}
            />
          ))
        ) : (
          <div className="col-span-4 text-gray-500 text-center">
            No color suggestions available
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPicker;