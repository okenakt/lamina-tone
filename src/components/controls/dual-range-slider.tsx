import React, { useState, useRef, useEffect, useCallback } from "react";

interface DualRangeSliderProps {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  label: string;
  onChange: (minValue: number, maxValue: number) => void;
}

const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  min,
  max,
  minValue,
  maxValue,
  label,
  onChange,
}) => {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getPercentage = (value: number) => ((value - min) / (max - min)) * 100;

  const handleMouseDown = (type: 'min' | 'max') => (event: React.MouseEvent) => {
    event.preventDefault();
    setIsDragging(type);
  };

  const updateValue = useCallback((clientX: number) => {
    if (!sliderRef.current || !isDragging) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const rawValue = (percentage / 100) * (max - min) + min;
    const newValue = Math.round(rawValue); // Force integer values

    if (isDragging === 'min') {
      const newMin = Math.min(newValue, maxValue - 1);
      onChange(Math.max(min, newMin), maxValue);
    } else if (isDragging === 'max') {
      const newMax = Math.max(newValue, minValue + 1);
      onChange(minValue, Math.min(max, newMax));
    }
  }, [isDragging, max, min, maxValue, minValue, onChange]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (isDragging) {
      updateValue(event.clientX);
    }
  }, [isDragging, updateValue]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (isDragging && event.touches[0]) {
      event.preventDefault();
      updateValue(event.touches[0].clientX);
    }
  }, [isDragging, updateValue]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleTouchMove, handleMouseUp]);

  return (
    <div className="w-full">
      <div className="flex items-center space-x-2 mb-1">
        <label className="text-sm font-medium text-gray-700 flex-shrink-0">{label}</label>
        <div className="flex-1 relative mt-6 mb-2">
          {/* Min value label */}
          <div
            className="absolute text-xs text-gray-600 transform -translate-x-1/2 -top-5"
            style={{ left: `${getPercentage(minValue)}%` }}
          >
            {Math.round(minValue)}
          </div>
          
          {/* Max value label */}
          <div
            className="absolute text-xs text-gray-600 transform -translate-x-1/2 -top-5"
            style={{ left: `${getPercentage(maxValue)}%` }}
          >
            {Math.round(maxValue)}
          </div>
          
          {/* Track */}
          <div
            ref={sliderRef}
            className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
          >
            {/* Active range */}
            <div
              className="absolute h-2 bg-blue-500 rounded-full"
              style={{
                left: `${getPercentage(minValue)}%`,
                width: `${getPercentage(maxValue) - getPercentage(minValue)}%`
              }}
            />
            
            {/* Min handle */}
            <div
              className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 top-1/2 hover:scale-110 transition-transform touch-manipulation"
              style={{ left: `${getPercentage(minValue)}%` }}
              onMouseDown={handleMouseDown('min')}
              onTouchStart={(e) => {
                e.preventDefault();
                setIsDragging('min');
              }}
            />
            
            {/* Max handle */}
            <div
              className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 top-1/2 hover:scale-110 transition-transform touch-manipulation"
              style={{ left: `${getPercentage(maxValue)}%` }}
              onMouseDown={handleMouseDown('max')}
              onTouchStart={(e) => {
                e.preventDefault();
                setIsDragging('max');
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DualRangeSlider;