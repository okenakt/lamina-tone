import { Button } from "@/components/ui/button";
import { AXIS_LIMITS } from "@/constants/tone-sheet";
import { ReactNode } from "react";

type AxisControlProps = {
  title: string;
  size: number;
  onSizeChange: (change: number) => void;
  disabled?: boolean;
  children: ReactNode;
};

export const AxisControl = ({
  title,
  size,
  onSizeChange,
  disabled = false,
  children,
}: AxisControlProps) => (
  <div className="flex-1 space-y-2 rounded-lg border border-gray-300 bg-white p-3 shadow-sm">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      <div className="flex items-center">
        <Button
          onClick={() => onSizeChange(-1)}
          className="h-7 w-7 bg-red-400 p-0 text-xs text-white hover:bg-red-500 focus:ring-red-400"
          disabled={disabled || size <= AXIS_LIMITS.minSize}
        >
          −
        </Button>
        <span className="w-8 rounded bg-gray-50 px-2 py-1 text-center font-mono text-sm text-gray-700">
          {size}
        </span>
        <Button
          onClick={() => onSizeChange(1)}
          className="h-7 w-7 bg-green-400 p-0 text-xs text-white hover:bg-green-500 focus:ring-green-400"
          disabled={disabled || size >= AXIS_LIMITS.maxSize}
        >
          +
        </Button>
      </div>
    </div>
    {children}
  </div>
);
