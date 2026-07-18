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
  <div className="flex-1 space-y-2 rounded-[12px] border border-rule bg-paper-2 p-3">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-ink">{title}</h3>
      <div className="flex items-center gap-1">
        <Button
          onClick={() => onSizeChange(-1)}
          aria-label={`Decrease ${title} count`}
          className="h-7 w-7 bg-paper-3 p-0 text-base text-ink-2 hover:bg-rule hover:text-ink"
          disabled={disabled || size <= AXIS_LIMITS.minSize}
        >
          −
        </Button>
        <span className="w-8 text-center font-mono text-sm text-ink">
          {size}
        </span>
        <Button
          onClick={() => onSizeChange(1)}
          aria-label={`Increase ${title} count`}
          className="h-7 w-7 bg-paper-3 p-0 text-base text-ink-2 hover:bg-rule hover:text-ink"
          disabled={disabled || size >= AXIS_LIMITS.maxSize}
        >
          +
        </Button>
      </div>
    </div>
    {children}
  </div>
);
