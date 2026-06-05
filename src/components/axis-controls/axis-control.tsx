import { Button } from "@/components/ui/button";
import { AXIS_LIMITS } from "@/constants/ui";
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
  <div className="flex-1 rounded-lg border border-gray-300 bg-white p-3 shadow-sm">
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onSizeChange(-1)}
            variant="danger"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={disabled || size <= AXIS_LIMITS.minSize}
          >
            −
          </Button>
          <span className="w-8 rounded bg-gray-50 px-2 py-1 text-center font-mono text-sm text-gray-700">
            {size}
          </span>
          <Button
            onClick={() => onSizeChange(1)}
            variant="success"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={disabled || size >= AXIS_LIMITS.maxSize}
          >
            +
          </Button>
        </div>
      </div>
      {children}
    </div>
  </div>
);
