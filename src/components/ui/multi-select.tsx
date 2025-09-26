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
    console.log('🔍 MultiSelect - Filtrage des options:', { 
      optionsCount: options?.length || 0, 
      searchQuery, 
      searchable,
      options: options?.slice(0, 3) // Afficher les 3 premiers pour debug
    });
    
    if (!options || !Array.isArray(options)) {
      console.log('❌ MultiSelect - Options invalides:', options);
      return [];
    }
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

  const handleSelectAll = () => {
    const allValues = filteredOptions.map(option => option.value);
    const newSelection = [...new Set([...selected, ...allValues])];
    onSelectionChange(newSelection);
  };

  const handleDeselectAll = () => {
    const filteredValues = filteredOptions.map(option => option.value);
    const newSelection = selected.filter(value => !filteredValues.includes(value));
    onSelectionChange(newSelection);
  };

  const isAllSelected = filteredOptions.length > 0 && filteredOptions.every(option => selected.includes(option.value));
  const isSomeSelected = filteredOptions.some(option => selected.includes(option.value));

  const defaultRenderOption = (option: MultiSelectOption) => (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors min-h-[60px] sm:min-h-[56px]">
      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-[#1e40af]/10 rounded-lg flex items-center justify-center">
        {icon || <div className="w-4 h-4 sm:w-5 sm:h-5 bg-[#1e40af] rounded-full" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{option.label}</p>
        {option.subtitle && (
          <p className="text-xs sm:text-sm text-gray-600 truncate mt-1">{option.subtitle}</p>
        )}
      </div>
      <div className="flex-shrink-0">
        <Checkbox
          checked={selected.includes(option.value)}
          onCheckedChange={() => handleToggleOption(option.value)}
          disabled={maxSelections && selected.length >= maxSelections && !selected.includes(option.value)}
          className="w-4 h-4 sm:w-5 sm:h-5"
        />
      </div>
    </div>
  );

  const defaultRenderSelected = (option: MultiSelectOption) => (
    <div className="flex items-center justify-between bg-[#1e40af]/5 rounded-lg p-3 min-h-[60px] sm:min-h-[56px]">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#1e40af] rounded-full flex items-center justify-center flex-shrink-0">
          {icon || <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{option.label}</p>
          {option.subtitle && (
            <p className="text-xs sm:text-sm text-gray-600 truncate mt-1">{option.subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRemoveSelected(option.value)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 w-8 h-8 sm:w-9 sm:h-9 p-0"
        >
          <X className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>
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
      <div className="multi-select-container border-2 border-dashed border-gray-300 rounded-xl p-4 overflow-hidden min-h-[240px]">
        {selectedOptions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {icon || <div className="w-6 h-6 bg-gray-400 rounded-full" />}
            </div>
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[240px] overflow-y-auto">
            {selectedOptions.map(option => (
              <div key={option.value} className="w-full">
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
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col mx-2 sm:mx-0">
          <DialogHeader className="pb-3 sm:pb-4">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              {icon}
              {title || 'Sélectionner des éléments'}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Recherchez et sélectionnez les éléments souhaités dans la liste ci-dessous.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 sm:space-y-4 flex-1 overflow-hidden flex flex-col">
            {/* Barre de recherche et actions de sélection */}
            <div className="space-y-2 sm:space-y-3 flex-shrink-0">
              {searchable && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 sm:h-11 text-sm"
                  />
                </div>
              )}
              
              {/* Actions de sélection en masse */}
              {filteredOptions.length > 0 && (
                <div className="selection-actions">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={isAllSelected ? handleDeselectAll : handleSelectAll}
                      className="text-xs"
                    >
                      {isAllSelected ? 'Désélectionner tout' : 'Sélectionner tout'}
                    </Button>
                    {isSomeSelected && !isAllSelected && (
                      <span className="text-xs text-gray-500">
                        {filteredOptions.filter(option => selected.includes(option.value)).length} sur {filteredOptions.length} sélectionnés
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {filteredOptions.length} élément{filteredOptions.length > 1 ? 's' : ''} disponible{filteredOptions.length > 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </div>

            {/* Liste des options - 3 éléments avant scroll */}
            <div className="flex-1 overflow-hidden">
              <div className="max-h-[200px] sm:max-h-[240px] overflow-y-auto space-y-1 border border-gray-200 rounded-lg">
                {filteredOptions.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <Search className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Aucun résultat trouvé</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredOptions.map(option => (
                      <div key={option.value} className="w-full">
                        {renderOption ? renderOption(option) : defaultRenderOption(option)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 sm:pt-4 border-t gap-3">
              <div className="text-xs sm:text-sm text-gray-600">
                {selected.length} élément{selected.length > 1 ? 's' : ''} sélectionné{selected.length > 1 ? 's' : ''}
                {maxSelections && ` / ${maxSelections} maximum`}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 sm:flex-none text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 min-h-[44px] sm:min-h-[40px]"
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  className="bg-[#1e40af] hover:bg-[#1e3a8a] flex-1 sm:flex-none text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 min-h-[44px] sm:min-h-[40px]"
                >
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
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
