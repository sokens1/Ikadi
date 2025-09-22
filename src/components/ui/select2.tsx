import React from 'react';
import Select, { SingleValue, MultiValue, ActionMeta, StylesConfig } from 'react-select';
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
  onChange: (selectedOption: SingleValue<Select2Option>) => void;
  isSearchable?: boolean;
  isClearable?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  className?: string;
  error?: string;
  helpText?: string;
}

const customStyles: StylesConfig<Select2Option, false> = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '44px',
    border: state.isFocused ? '2px solid #3b82f6' : '1px solid #d1d5db',
    borderRadius: '12px',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#3b82f6' : '#9ca3af',
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '8px 12px',
  }),
  input: (provided) => ({
    ...provided,
    margin: '0',
    padding: '0',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#9ca3af',
    fontSize: '14px',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#374151',
    fontSize: '14px',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb',
    marginTop: '4px',
  }),
  menuList: (provided) => ({
    ...provided,
    padding: '8px',
    borderRadius: '12px',
  }),
  option: (provided, state) => ({
    ...provided,
    borderRadius: '8px',
    margin: '2px 0',
    padding: '12px 16px',
    fontSize: '14px',
    backgroundColor: state.isSelected
      ? '#3b82f6'
      : state.isFocused
      ? '#f3f4f6'
      : 'transparent',
    color: state.isSelected ? 'white' : '#374151',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: state.isSelected ? '#3b82f6' : '#f3f4f6',
    },
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: '#6b7280',
    padding: '8px',
    '&:hover': {
      color: '#374151',
    },
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: '#6b7280',
    padding: '8px',
    '&:hover': {
      color: '#374151',
    },
  }),
  loadingIndicator: (provided) => ({
    ...provided,
    color: '#6b7280',
  }),
};

const Select2: React.FC<Select2Props> = ({
  label,
  placeholder = "Sélectionner...",
  options,
  value,
  onChange,
  isSearchable = true,
  isClearable = true,
  isLoading = false,
  isDisabled = false,
  className = "",
  error,
  helpText,
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="text-sm font-medium text-gray-700">
          {label}
        </Label>
      )}
      
      <Select
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isSearchable={isSearchable}
        isClearable={isClearable}
        isLoading={isLoading}
        isDisabled={isDisabled}
        styles={customStyles}
        className="react-select-container"
        classNamePrefix="react-select"
        noOptionsMessage={() => "Aucune option trouvée"}
        loadingMessage={() => "Chargement..."}
      />
      
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
