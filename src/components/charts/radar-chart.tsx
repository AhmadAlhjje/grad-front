'use client';

import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils';

interface RadarChartProps {
  data: Record<string, unknown>[];
  dataKey: string;
  radars: {
    dataKey: string;
    name: string;
    color: string;
    fillOpacity?: number;
  }[];
  height?: number;
  showLegend?: boolean;
  className?: string;
}

export function RadarChart({
  data,
  dataKey,
  radars,
  height = 350,
  showLegend = true,
  className,
}: RadarChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey={dataKey}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 'auto']}
            tick={{ fill: '#64748b', fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          {radars.map((radar) => (
            <Radar
              key={radar.dataKey}
              name={radar.name}
              dataKey={radar.dataKey}
              stroke={radar.color}
              fill={radar.color}
              fillOpacity={radar.fillOpacity ?? 0.3}
            />
          ))}
          {showLegend && (
            <Legend
              formatter={(value) => <span className="text-secondary-600">{value}</span>}
            />
          )}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
