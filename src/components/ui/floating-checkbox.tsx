import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const FloatingCheckbox = React.forwardRef<HTMLDivElement, FloatingCheckboxProps>(
  ({ 
    label, 
    checked,
    onChange,
    error, 
    helperText, 
    disabled = false,
    required = false,
    size = 'md',
    className,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.checked);
    };

    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6"
    };

    const iconSizes = {
      sm: "w-3 h-3",
      md: "w-4 h-4",
      lg: "w-5 h-5"
    };

    return (
      <div className={cn("relative w-full", className)} ref={ref}>
        <div className="flex items-start space-x-3">
          <div className="relative">
            <input
              type="checkbox"
              checked={checked}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={disabled}
              className="sr-only"
              {...props}
            />
            
            <div
              className={cn(
                "relative flex items-center justify-center rounded border-2 transition-all duration-200 cursor-pointer",
                sizeClasses[size],
                checked 
                  ? "bg-gov-blue border-gov-blue" 
                  : "bg-white border-gray-300",
                isFocused && !disabled && "ring-2 ring-gov-blue/20",
                error && "border-red-500",
                disabled && "opacity-50 cursor-not-allowed bg-gray-100",
                "hover:border-gov-blue"
              )}
              onClick={() => !disabled && onChange(!checked)}
            >
              {checked && (
                <Check 
                  className={cn(
                    "text-white transition-all duration-200",
                    iconSizes[size]
                  )} 
                />
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <label className={cn(
              "text-sm font-medium text-gray-700 cursor-pointer select-none",
              disabled && "opacity-50 cursor-not-allowed",
              error && "text-red-600",
              required && "after:content-['*'] after:ml-1 after:text-red-500"
            )}>
              {label}
            </label>
          </div>
        </div>
        
        {error && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

FloatingCheckbox.displayName = 'FloatingCheckbox';

export default FloatingCheckbox;
