import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import ProgressRing from '@/components/charts/ProgressRing';
import { LucideIcon } from 'lucide-react';

interface PerformanceMetric {
  label: string;
  value: number;
  target?: number;
  color: string;
  icon: LucideIcon;
  description: string;
}

interface PerformanceWidgetProps {
  metrics: PerformanceMetric[];
  className?: string;
  loading?: boolean;
}

const PerformanceWidget: React.FC<PerformanceWidgetProps> = ({
  metrics,
  className,
  loading = false
}) => {
  if (loading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", className)}>
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="election-card">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-24 w-24 bg-gray-200 rounded-full"></div>
                </div>
                <div className="text-center space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-24 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", className)}>
      {metrics.map((metric, index) => (
        <Card key={index} className="election-card group hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-4">
              <ProgressRing
                progress={metric.value}
                size={120}
                color={metric.color}
                showPercentage={true}
              />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-2">
                <metric.icon className="h-5 w-5" style={{ color: metric.color }} />
                {metric.label}
              </h3>
              <p className="text-sm text-gray-600">{metric.description}</p>
              {metric.target && (
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <span>Objectif: {metric.target}%</span>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    metric.value >= metric.target ? "bg-green-500" : "bg-orange-500"
                  )}></div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PerformanceWidget;
