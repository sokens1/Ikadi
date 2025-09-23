import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}

const FloatingTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ 
    label, 
    error, 
    helperText, 
    icon, 
    variant = 'outlined', 
    size = 'md',
    className,
    value,
    onChange,
    onFocus,
    onBlur,
    rows = 3,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      setHasValue(!!(value && value.toString().length > 0));
    }, [value]);

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHasValue(e.target.value.length > 0);
      onChange?.(e);
    };

    const isLabelFloating = isFocused || hasValue;

    const baseClasses = "relative w-full transition-all duration-200 ease-in-out";
    const sizeClasses = {
      sm: "min-h-[80px] text-sm",
      md: "min-h-[100px] text-base",
      lg: "min-h-[120px] text-lg"
    };
    const variantClasses = {
      default: "border border-gray-300 rounded-lg bg-white",
      filled: "border-0 rounded-lg bg-gray-100",
      outlined: "border-2 border-gray-300 rounded-xl bg-transparent"
    };

    return (
      <div className={cn(baseClasses, sizeClasses[size], className)}>
        <div className={cn(
          "relative w-full min-h-full",
          variantClasses[variant],
          error && "border-red-500",
          isFocused && !error && "border-blue-500 ring-2 ring-blue-200",
          "transition-all duration-200"
        )}>
          {icon && (
            <div className="absolute left-3 top-3 text-gray-400">
              {icon}
            </div>
          )}
          
          <textarea
            ref={ref || textareaRef}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            rows={rows}
            className={cn(
              "w-full min-h-full bg-transparent border-0 outline-none resize-none",
              "px-3 pt-4 pb-1",
              icon && "pl-10",
              "text-gray-900 placeholder-transparent",
              "transition-all duration-200"
            )}
            placeholder={label}
            {...props}
          />
          
          <label
            className={cn(
              "absolute left-3 transition-all duration-200 ease-in-out pointer-events-none",
              icon && "left-10",
              isLabelFloating 
                ? "top-1 text-xs text-blue-600 font-medium" 
                : "top-3 text-gray-500",
              error && isLabelFloating && "text-red-500"
            )}
          >
            {label}
          </label>
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

FloatingTextarea.displayName = 'FloatingTextarea';

export default FloatingTextarea;
