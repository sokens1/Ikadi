import React from 'react';
import { cn } from '@/lib/utils';

interface DataPoint {
  x: string;
  y: number;
  label?: string;
}

interface LineChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
  className?: string;
  showDots?: boolean;
  showGrid?: boolean;
  showArea?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  color = '#1e40af',
  height = 200,
  className,
  showDots = true,
  showGrid = true,
  showArea = false
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center", className)} style={{ height }}>
        <p className="text-gray-500 text-sm">Aucune donnée disponible</p>
      </div>
    );
  }

  const maxY = Math.max(...data.map(d => d.y));
  const minY = Math.min(...data.map(d => d.y));
  const range = maxY - minY || 1;

  const width = 400;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Convertir les données en coordonnées SVG
  const points = data.map((point, index) => {
    const xCoord = padding + (index / Math.max(data.length - 1, 1)) * chartWidth;
    const yCoord = padding + chartHeight - ((point.y - minY) / range) * chartHeight;
    return { 
      x: xCoord, 
      y: yCoord, 
      label: point.x, // Le label original
      value: point.y 
    };
  });

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  const areaData = `${pathData} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`;

  return (
    <div className={cn("relative", className)}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        {showGrid && (
          <g className="opacity-30">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <line
                key={index}
                x1={padding}
                y1={padding + ratio * chartHeight}
                x2={width - padding}
                y2={padding + ratio * chartHeight}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
          </g>
        )}

        {/* Area under the curve */}
        {showArea && (
          <path
            d={areaData}
            fill={color}
            fillOpacity="0.1"
            className="animate-pulse"
          />
        )}

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-sm"
        />

        {/* Data points */}
        {showDots && points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="white"
              stroke={color}
              strokeWidth="2"
              className="drop-shadow-sm hover:r-6 transition-all duration-200"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="2"
              fill={color}
              className="opacity-80"
            />
          </g>
        ))}

        {/* Labels */}
        {points.map((point, index) => (
          <text
            key={`label-${index}`}
            x={point.x}
            y={padding + chartHeight + 20}
            textAnchor="middle"
            className="text-xs fill-gray-600"
          >
            {point.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

export default LineChart;