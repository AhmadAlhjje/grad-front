'use client';

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

interface PieChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  height?: number;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  className?: string;
}

export function PieChart({
  data,
  height = 300,
  showLegend = true,
  innerRadius = 0,
  outerRadius = 80,
  className,
}: PieChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={{ stroke: '#64748b' }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              formatter={(value) => <span className="text-secondary-600">{value}</span>}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Donut Chart variant
interface DonutChartProps extends Omit<PieChartProps, 'innerRadius'> {
  centerLabel?: string;
  centerValue?: string | number;
}

export function DonutChart({
  data,
  height = 300,
  showLegend = true,
  outerRadius = 80,
  centerLabel,
  centerValue,
  className,
}: DonutChartProps) {
  return (
    <div className={cn('w-full relative', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={outerRadius * 0.6}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              formatter={(value) => <span className="text-secondary-600">{value}</span>}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>

      {/* Center Label */}
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && (
            <span className="text-2xl font-bold text-secondary-900">{centerValue}</span>
          )}
          {centerLabel && <span className="text-sm text-secondary-500">{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}
