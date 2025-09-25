import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  icon: LucideIcon;
  color?: string;
  className?: string;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  color = '#1e40af',
  className,
  loading = false
}) => {
  if (loading) {
    return (
      <Card className={cn("election-card", className)}>
        <CardContent className="p-4 sm:p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("election-card group hover:shadow-lg transition-all duration-300", className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold" style={{ color }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1">
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}>
                  <span>{trend.isPositive ? '↗' : '↘'}</span>
                  <span>{trend.value}%</span>
                </div>
                {trend.label && (
                  <span className="text-xs text-gray-500">{trend.label}</span>
                )}
              </div>
            )}
          </div>
          <div 
            className="p-3 rounded-full group-hover:scale-110 transition-transform duration-300"
            style={{ backgroundColor: `${color}10` }}
          >
            <Icon 
              className="h-6 w-6" 
              style={{ color }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
