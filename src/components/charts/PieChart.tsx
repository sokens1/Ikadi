import React from 'react';
import { cn } from '@/lib/utils';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: DataPoint[];
  size?: number;
  className?: string;
  showLabels?: boolean;
  showValues?: boolean;
  innerRadius?: number;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 200,
  className,
  showLabels = true,
  showValues = true,
  innerRadius = 0
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center", className)} style={{ width: size, height: size }}>
        <p className="text-gray-500 text-sm">Aucune donnée disponible</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - 40) / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  const colors = [
    '#1e40af', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  let currentAngle = 0;

  const createArcPath = (startAngle: number, endAngle: number, innerR: number, outerR: number) => {
    const start = polarToCartesian(centerX, centerY, outerR, endAngle);
    const end = polarToCartesian(centerX, centerY, outerR, startAngle);
    const innerStart = polarToCartesian(centerX, centerY, innerR, endAngle);
    const innerEnd = polarToCartesian(centerX, centerY, innerR, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", start.x, start.y,
      "A", outerR, outerR, 0, largeArcFlag, 0, end.x, end.y,
      "L", innerEnd.x, innerEnd.y,
      "A", innerR, innerR, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const getLabelPosition = (angle: number, distance: number) => {
    const labelAngle = (angle * Math.PI) / 180;
    return {
      x: centerX + Math.cos(labelAngle) * distance,
      y: centerY + Math.sin(labelAngle) * distance
    };
  };

  return (
    <div className={cn("relative", className)}>
      <svg width={size} height={size} className="overflow-visible">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const angle = (item.value / total) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          const color = item.color || colors[index % colors.length];

          const path = createArcPath(startAngle, endAngle, innerRadius, radius);
          const labelPos = getLabelPosition(startAngle + angle / 2, radius + 20);

          currentAngle += angle;

          return (
            <g key={index}>
              <path
                d={path}
                fill={color}
                className="drop-shadow-sm hover:opacity-80 transition-all duration-200"
                stroke="white"
                strokeWidth="2"
              />
              {showLabels && (
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  className="text-xs font-medium fill-gray-700"
                >
                  {item.label}
                </text>
              )}
              {showValues && (
                <text
                  x={labelPos.x}
                  y={labelPos.y + 12}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-gray-900"
                >
                  {percentage.toFixed(1)}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default PieChart;
