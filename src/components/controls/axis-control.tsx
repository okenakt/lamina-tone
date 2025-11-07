import React from "react";
import DualRangeSlider from "./dual-range-slider";
import { Button } from "@/components/ui/button";
import { AXIS_LIMITS } from "@/constants/ui";

interface AxisControlProps {
  title: string;
  currentSize: number;
  currentRange: { min: number; max: number };
  maxRange: { min: number; max: number };
  onSizeChange: (change: number) => void;
  onRangeChange: (min: number, max: number) => void;
  disabled?: boolean;
}

export const AxisControl: React.FC<AxisControlProps> = ({
  title,
  currentSize,
  currentRange,
  maxRange,
  onSizeChange,
  onRangeChange,
  disabled = false,
}) => {
  return (
    <div className="flex-1 bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => onSizeChange(-1)}
              variant="danger"
              size="sm"
              className="w-7 h-7 p-0"
              title={`Remove ${title.toLowerCase()}`}
              disabled={disabled || currentSize <= AXIS_LIMITS.minSize}
            >
              −
            </Button>
            <span className="text-sm text-gray-700 w-8 text-center font-mono bg-gray-50 px-2 py-1 rounded">
              {currentSize}
            </span>
            <Button
              onClick={() => onSizeChange(1)}
              variant="success"
              size="sm"
              className="w-7 h-7 p-0"
              title={`Add ${title.toLowerCase()}`}
              disabled={disabled || currentSize >= AXIS_LIMITS.maxSize}
            >
              +
            </Button>
          </div>
        </div>
        <DualRangeSlider
          min={maxRange.min}
          max={maxRange.max}
          minValue={currentRange.min}
          maxValue={currentRange.max}
          label=""
          onChange={onRangeChange}
        />
      </div>
    </div>
  );
};