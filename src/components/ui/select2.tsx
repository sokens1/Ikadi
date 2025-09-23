import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from './label';

export interface Select2Option {
  value: string;
  label: string;
}

interface Select2Props {
  label?: string;
  placeholder?: string;
  options: Select2Option[];
  value?: Select2Option | null;
  onChange: (selectedOption: Select2Option | null) => void;
  isSearchable?: boolean; // non supporté dans cette version simplifiée
  isClearable?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  className?: string;
  error?: string;
  helpText?: string;
}

const CLEAR_VALUE = '__none__';

const Select2: React.FC<Select2Props> = ({
  label,
  placeholder = "Sélectionner...",
  options,
  value,
  onChange,
  isClearable = true,
  isLoading = false,
  isDisabled = false,
  className = "",
  error,
  helpText,
}) => {
  const currentValue = value?.value; // ne jamais forcer ""

  const handleChange = (val: string) => {
    if (isClearable && val === CLEAR_VALUE) {
      onChange(null);
      return;
    }
    const opt = options.find(o => o.value === val) || null;
    onChange(opt);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="text-sm font-medium text-gray-700">
          {label}
        </Label>
      )}

      <Select value={currentValue} onValueChange={handleChange} disabled={isDisabled || isLoading}>
        <SelectTrigger className="h-11 rounded-xl">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isClearable && (
            <SelectItem value={CLEAR_VALUE}>—</SelectItem>
          )}
          {options.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}

      {helpText && !error && (
        <p className="text-sm text-gray-500 mt-1">{helpText}</p>
      )}
    </div>
  );
};

export default Select2;
