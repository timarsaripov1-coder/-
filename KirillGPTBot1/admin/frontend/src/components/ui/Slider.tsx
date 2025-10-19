import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  showValue?: boolean;
  suffix?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, showValue = true, suffix, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            {showValue && (
              <span className="text-sm text-gray-500">
                {props.value}{suffix}
              </span>
            )}
          </div>
        )}
        <input
          type="range"
          className={cn(
            'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50',
            className
          )}
          ref={ref}
          {...props}
        />
        <style>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 18px;
            width: 18px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
          }
          
          .slider::-moz-range-thumb {
            height: 18px;
            width: 18px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: none;
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
          }
        `}</style>
      </div>
    );
  }
);

Slider.displayName = 'Slider';