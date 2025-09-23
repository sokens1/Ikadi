import React from 'react';
import { cn } from '@/lib/utils';

interface ModernFormProps {
  children: React.ReactNode;
  className?: string;
  onSubmit?: (e: React.FormEvent) => void;
}

const ModernForm = React.forwardRef<HTMLFormElement, ModernFormProps>(
  ({ children, className, onSubmit, ...props }, ref) => {
    return (
      <form
        ref={ref}
        onSubmit={onSubmit}
        className={cn(
          "space-y-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-100",
          "animate-in fade-in-0 slide-in-from-bottom-4 duration-500",
          className
        )}
        {...props}
      >
        {children}
      </form>
    );
  }
);

ModernForm.displayName = 'ModernForm';

interface ModernFormSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const ModernFormSection = React.forwardRef<HTMLDivElement, ModernFormSectionProps>(
  ({ title, description, icon, children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "space-y-4 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200",
          "hover:shadow-md transition-all duration-300",
          className
        )}
      >
        <div className="flex items-center gap-3 mb-4">
          {icon && (
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        <div className="space-y-4">
          {children}
        </div>
      </div>
    );
  }
);

ModernFormSection.displayName = 'ModernFormSection';

interface ModernFormGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ModernFormGrid = React.forwardRef<HTMLDivElement, ModernFormGridProps>(
  ({ children, cols = 2, gap = 'md', className }, ref) => {
    const gridCols = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    };

    const gapSizes = {
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          gridCols[cols],
          gapSizes[gap],
          className
        )}
      >
        {children}
      </div>
    );
  }
);

ModernFormGrid.displayName = 'ModernFormGrid';

interface ModernFormActionsProps {
  children: React.ReactNode;
  className?: string;
}

const ModernFormActions = React.forwardRef<HTMLDivElement, ModernFormActionsProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-end gap-3 pt-6 border-t border-gray-200",
          "bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl",
          className
        )}
      >
        {children}
      </div>
    );
  }
);

ModernFormActions.displayName = 'ModernFormActions';

export { ModernForm, ModernFormSection, ModernFormGrid, ModernFormActions };
