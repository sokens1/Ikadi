import React from 'react';
import { cn } from '@/lib/utils';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: DataPoint[];
  height?: number;
  className?: string;
  showValues?: boolean;
  horizontal?: boolean;
  maxValue?: number;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  className,
  showValues = true,
  horizontal = false,
  maxValue
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center", className)} style={{ height }}>
        <p className="text-gray-500 text-sm">Aucune donnée disponible</p>
      </div>
    );
  }

  const max = maxValue || Math.max(...data.map(d => d.value));
  const colors = [
    '#1e40af', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  if (horizontal) {
    return (
      <div className={cn("space-y-2", className)}>
        {data.map((item, index) => {
          const percentage = (item.value / max) * 100;
          const color = item.color || colors[index % colors.length];
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 truncate">
                  {item.label}
                </span>
                {showValues && (
                  <span className="text-sm font-semibold text-gray-900">
                    {item.value.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const width = 400;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const barWidth = chartWidth / data.length * 0.8;
  const barSpacing = chartWidth / data.length * 0.2;

  return (
    <div className={cn("relative", className)}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <line
            key={index}
            x1={padding}
            y1={padding + ratio * chartHeight}
            x2={width - padding}
            y2={padding + ratio * chartHeight}
            stroke="#e5e7eb"
            strokeWidth="1"
            className="opacity-30"
          />
        ))}

        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.value / max) * chartHeight;
          const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
          const y = padding + chartHeight - barHeight;
          const color = item.color || colors[index % colors.length];

          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx="4"
                className="drop-shadow-sm hover:opacity-80 transition-all duration-200"
              />
              {showValues && (
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-gray-700"
                >
                  {item.value.toLocaleString()}
                </text>
              )}
              <text
                x={x + barWidth / 2}
                y={padding + chartHeight + 20}
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default BarChart;
