'use client';

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

interface BarChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  bars: {
    dataKey: string;
    name: string;
    color: string;
    stackId?: string;
  }[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  layout?: 'vertical' | 'horizontal';
  className?: string;
}

export function BarChart({
  data,
  xKey,
  bars,
  height = 300,
  showGrid = true,
  showLegend = true,
  layout = 'horizontal',
  className,
}: BarChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
          {layout === 'horizontal' ? (
            <>
              <XAxis
                dataKey={xKey}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={{ stroke: '#cbd5e1' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={{ stroke: '#cbd5e1' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
            </>
          ) : (
            <>
              <XAxis
                type="number"
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={{ stroke: '#cbd5e1' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                dataKey={xKey}
                type="category"
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={{ stroke: '#cbd5e1' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
            </>
          )}
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
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-secondary-600">{value}</span>}
            />
          )}
          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color}
              stackId={bar.stackId}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Simple Comparison Bar Chart
interface ComparisonBarChartProps {
  data: { name: string; pre: number; post: number }[];
  height?: number;
  className?: string;
}

export function ComparisonBarChart({ data, height = 300, className }: ComparisonBarChartProps) {
  return (
    <BarChart
      data={data}
      xKey="name"
      bars={[
        { dataKey: 'pre', name: 'قبل', color: '#94a3b8' },
        { dataKey: 'post', name: 'بعد', color: '#0ea5e9' },
      ]}
      height={height}
      className={className}
    />
  );
}
