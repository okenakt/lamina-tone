import { useState } from "react";
import { Color } from "@/types";

export interface HoverState {
  color: Color | null;
  position: { x: number; y: number } | null;
}

export const useHover = () => {
  const [hoverState, setHoverState] = useState<HoverState>({
    color: null,
    position: null,
  });

  const handleHover = (color: Color | null, event?: React.MouseEvent) => {
    if (color && event) {
      setHoverState({
        color,
        position: { x: event.clientX, y: event.clientY },
      });
    } else {
      setHoverState({ color: null, position: null });
    }
  };

  return {
    hoverState,
    handleHover,
  };
};