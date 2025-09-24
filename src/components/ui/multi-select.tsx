/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Plus, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  value: string;
  label: string;
  subtitle?: string;
  metadata?: any;
}

interface MultiSelectProps {
  options?: MultiSelectOption[];
  selected?: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  maxSelections?: number;
  renderOption?: (option: MultiSelectOption) => React.ReactNode;
  renderSelected?: (option: MultiSelectOption) => React.ReactNode;
  icon?: React.ReactNode;
  title?: string;
  emptyMessage?: string;
  className?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options = [],
  selected = [],
  onSelectionChange,
  placeholder = "Sélectionner des éléments...",
  searchable = true,
  maxSelections,
  renderOption,
  renderSelected,
  icon,
  title,
  emptyMessage = "Aucun élément sélectionné",
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredOptions = useMemo(() => {
    if (!options || !Array.isArray(options)) return [];
    if (!searchable || !searchQuery) return options;
    return options.filter(option => 
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery, searchable]);

  const selectedOptions = useMemo(() => {
    if (!selected || !Array.isArray(selected) || !options || !Array.isArray(options)) return [];
    return selected.map(value => options.find(opt => opt.value === value)).filter(Boolean) as MultiSelectOption[];
  }, [selected, options]);

  const handleToggleOption = (optionValue: string) => {
    if (selected.includes(optionValue)) {
      onSelectionChange(selected.filter(value => value !== optionValue));
    } else {
      if (maxSelections && selected.length >= maxSelections) {
        return;
      }
      onSelectionChange([...selected, optionValue]);
    }
  };

  const handleRemoveSelected = (optionValue: string) => {
    onSelectionChange(selected.filter(value => value !== optionValue));
  };

  const defaultRenderOption = (option: MultiSelectOption) => (
    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="w-10 h-10 bg-[#1e40af]/10 rounded-full flex items-center justify-center">
        {icon || <div className="w-5 h-5 bg-[#1e40af] rounded-full" />}
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{option.label}</p>
        {option.subtitle && (
          <p className="text-sm text-gray-600">{option.subtitle}</p>
        )}
      </div>
      <Checkbox
        checked={selected.includes(option.value)}
        onCheckedChange={() => handleToggleOption(option.value)}
        disabled={maxSelections && selected.length >= maxSelections && !selected.includes(option.value)}
      />
    </div>
  );

  const defaultRenderSelected = (option: MultiSelectOption) => (
    <div className="flex items-center justify-between bg-[#1e40af]/5 rounded-lg p-3">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-[#1e40af] rounded-full flex items-center justify-center">
          {icon || <div className="w-4 h-4 bg-white rounded-full" />}
        </div>
        <div>
          <p className="font-medium text-gray-900">{option.label}</p>
          {option.subtitle && (
            <p className="text-sm text-gray-600">{option.subtitle}</p>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleRemoveSelected(option.value)}
        className="text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {icon}
            {title}
          </h4>
          <span className="text-sm text-gray-500">
            {selected.length} sélectionné{selected.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Zone de sélection */}
      <div className="min-h-[120px] border-2 border-dashed border-gray-300 rounded-xl p-4">
        {selectedOptions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {icon || <div className="w-6 h-6 bg-gray-400 rounded-full" />}
            </div>
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedOptions.map(option => (
              <div key={option.value}>
                {renderSelected ? renderSelected(option) : defaultRenderSelected(option)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bouton d'ouverture */}
      <Button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="w-full bg-white border-2 border-[#1e40af] text-[#1e40af] hover:bg-[#1e40af] hover:text-white transition-all duration-300"
        disabled={maxSelections && selected.length >= maxSelections}
      >
        <Plus className="w-4 h-4 mr-2" />
        {maxSelections && selected.length >= maxSelections 
          ? `Limite atteinte (${maxSelections})` 
          : 'Ajouter des éléments'
        }
      </Button>

      {/* Modal de sélection */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {icon}
              {title || 'Sélectionner des éléments'}
            </DialogTitle>
            <DialogDescription>
              Recherchez et sélectionnez les éléments souhaités dans la liste ci-dessous.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Barre de recherche */}
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {/* Liste des options */}
            <div className="max-h-96 overflow-y-auto space-y-1">
              {filteredOptions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>Aucun résultat trouvé</p>
                </div>
              ) : (
                filteredOptions.map(option => (
                  <div key={option.value}>
                    {renderOption ? renderOption(option) : defaultRenderOption(option)}
                  </div>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-sm text-gray-600">
                {selected.length} élément{selected.length > 1 ? 's' : ''} sélectionné{selected.length > 1 ? 's' : ''}
                {maxSelections && ` / ${maxSelections} maximum`}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  className="bg-[#1e40af] hover:bg-[#1e3a8a]"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Valider
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MultiSelect;
