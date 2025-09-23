import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FloatingSelectProps {
  label: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const FloatingSelect = React.forwardRef<HTMLDivElement, FloatingSelectProps>(
  ({ 
    label, 
    options,
    value,
    onChange,
    placeholder = "Sélectionner...",
    error, 
    helperText, 
    icon, 
    variant = 'outlined', 
    size = 'md',
    disabled = false,
    required = false,
    className,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setHasValue(!!(value && value.length > 0));
    }, [value]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setIsFocused(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
        setIsFocused(!isOpen);
      }
    };

    const handleSelect = (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
      setIsFocused(false);
    };

    const selectedOption = options.find(option => option.value === value);

    const isLabelFloating = isFocused || hasValue || isOpen;

    const baseClasses = "relative w-full transition-all duration-200 ease-in-out";
    const sizeClasses = {
      sm: "h-10 text-sm",
      md: "h-12 text-base",
      lg: "h-14 text-lg"
    };
    const variantClasses = {
      default: "border border-gray-300 rounded-lg bg-white",
      filled: "border-0 rounded-lg bg-gray-100",
      outlined: "border-2 border-gray-300 rounded-xl bg-transparent"
    };

    return (
      <div className={cn(baseClasses, sizeClasses[size], className)} ref={ref}>
        <div className={cn(
          "relative w-full h-full cursor-pointer",
          variantClasses[variant],
          error && "border-red-500",
          isFocused && !error && "border-gov-blue ring-2 ring-gov-blue/20",
          disabled && "opacity-50 cursor-not-allowed bg-gray-100",
          "transition-all duration-200"
        )} onClick={handleToggle}>
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          <div className={cn(
            "w-full h-full flex items-center",
            "px-3 pt-4 pb-1",
            icon && "pl-10"
          )}>
            <span className={cn(
              "flex-1 text-gray-900",
              !selectedOption && "text-transparent"
            )}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            
            <ChevronDown className={cn(
              "w-4 h-4 text-gray-400 transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </div>
          
          <label
            className={cn(
              "absolute left-3 transition-all duration-200 ease-in-out pointer-events-none",
              icon && "left-10",
              isLabelFloating 
                ? "top-1 text-xs text-gov-blue font-medium" 
                : "top-1/2 transform -translate-y-1/2 text-gray-500",
              error && isLabelFloating && "text-red-500",
              required && "after:content-['*'] after:ml-1 after:text-red-500"
            )}
          >
            {label}
          </label>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors duration-150",
                  option.value === value && "bg-gov-blue/5 text-gov-blue",
                  option.disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !option.disabled && handleSelect(option.value)}
              >
                <span className="flex-1">{option.label}</span>
                {option.value === value && (
                  <Check className="w-4 h-4 text-gov-blue" />
                )}
              </div>
            ))}
          </div>
        )}
        
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

FloatingSelect.displayName = 'FloatingSelect';

export default FloatingSelect;
