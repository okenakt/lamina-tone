import { Color } from "@/types";
import { useState } from "react";

export const useHover = () => {
  const [hoveredColor, setHoveredColor] = useState<Color | null>(null);

  const handleHover = (color: Color | null) => {
    setHoveredColor(color);
  };

  return {
    hoveredColor,
    handleHover,
  };
};
