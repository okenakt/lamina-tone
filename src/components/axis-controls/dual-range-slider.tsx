import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const GRADIENT_SAMPLES = 10;
const TRACK_HEIGHT_PX = 12;

type DualRangeSliderProps = {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onChange: (minValue: number, maxValue: number) => void;
  // One function per strip (= per hue sheet). Each receives a display-scale value
  // and returns a hex color. Omit for a plain gray track.
  strips?: Array<(value: number) => string>;
};

export const DualRangeSlider = ({
  min,
  max,
  minValue,
  maxValue,
  onChange,
  strips,
}: DualRangeSliderProps) => {
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  const handleMouseDown = (type: "min" | "max") => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };

  const updateValue = useCallback(
    (clientX: number) => {
      if (!sliderRef.current || !isDragging) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const raw = Math.round(
        (Math.max(
          0,
          Math.min(100, ((clientX - rect.left) / rect.width) * 100),
        ) /
          100) *
          (max - min) +
          min,
      );
      if (isDragging === "min")
        onChange(Math.max(min, Math.min(raw, maxValue - 1)), maxValue);
      else onChange(minValue, Math.min(max, Math.max(raw, minValue + 1)));
    },
    [isDragging, max, min, maxValue, minValue, onChange],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) updateValue(e.clientX);
    },
    [isDragging, updateValue],
  );
  const handleMouseUp = useCallback(() => setIsDragging(null), []);
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        e.preventDefault();
        updateValue(e.touches[0].clientX);
      }
    },
    [isDragging, updateValue],
  );

  useEffect(() => {
    if (!isDragging) return;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleMouseUp]);

  // Build CSS gradient strings from strip functions (memoized — recomputes only when strips/range change)
  const gradients = useMemo(() => {
    if (!strips || strips.length === 0) return null;
    return strips.map((fn) => {
      const stops = Array.from({ length: GRADIENT_SAMPLES }, (_, i) => {
        const v = min + ((max - min) * i) / (GRADIENT_SAMPLES - 1);
        return fn(v);
      });
      return `linear-gradient(to right, ${stops.join(", ")})`;
    });
  }, [strips, min, max]);

  const trackHeight = TRACK_HEIGHT_PX;

  return (
    <div className="w-full">
      <div className="relative mt-6 mb-2">
        {/* Value labels */}
        <div
          className="absolute -top-5 -translate-x-1/2 text-xs text-gray-600"
          style={{ left: `${pct(minValue)}%` }}
        >
          {Math.round(minValue)}
        </div>
        <div
          className="absolute -top-5 -translate-x-1/2 text-xs text-gray-600"
          style={{ left: `${pct(maxValue)}%` }}
        >
          {Math.round(maxValue)}
        </div>

        {/* Track */}
        <div
          ref={sliderRef}
          className="relative cursor-pointer"
          style={{ height: `${trackHeight}px` }}
        >
          {/* Background */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            {gradients ? (
              <>
                {/* flex-1 で均等分割 → サブピクセル丸め誤差なし */}
                <div className="absolute inset-0 flex flex-col">
                  {gradients.map((grad, i) => (
                    <div
                      key={i}
                      className="flex-1"
                      style={{ background: grad }}
                    />
                  ))}
                </div>
                {/* Dim inactive ranges */}
                <div
                  className="absolute inset-y-0 left-0 bg-black/40"
                  style={{ width: `${pct(minValue)}%` }}
                />
                <div
                  className="absolute inset-y-0 right-0 bg-black/40"
                  style={{ width: `${100 - pct(maxValue)}%` }}
                />
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gray-200" />
                <div
                  className="absolute inset-y-0 bg-blue-500"
                  style={{
                    left: `${pct(minValue)}%`,
                    width: `${pct(maxValue) - pct(minValue)}%`,
                  }}
                />
              </>
            )}
          </div>

          {/* Handles */}
          {(["min", "max"] as const).map((type) => (
            <div
              key={type}
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-manipulation rounded-full border-2 border-blue-500 bg-white transition-transform hover:scale-110"
              style={{ left: `${pct(type === "min" ? minValue : maxValue)}%` }}
              onMouseDown={handleMouseDown(type)}
              onTouchStart={(e) => {
                e.preventDefault();
                setIsDragging(type);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
