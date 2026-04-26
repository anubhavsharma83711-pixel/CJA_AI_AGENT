import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { cn } from '@/lib/utils';

interface DataVisualizationProps {
  type: 'bar' | 'line' | 'pie';
  data: any[];
  keys: string[];
  title: string;
  compact?: boolean;
}

const COLORS = ['#3b82f6', '#4f46e5', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

export function DataVisualization({ type, data, keys, title, compact = false }: DataVisualizationProps) {
  return (
    <div className={cn(
      "w-full bg-white/50 backdrop-blur-sm border border-slate-100 rounded-xl shadow-sm overflow-hidden",
      compact ? "p-2 border-none bg-transparent shadow-none mt-0" : "p-4 mt-4"
    )}>
      {!compact && <h3 className="text-xs font-bold text-slate-800 mb-4 text-center uppercase tracking-wider">{title}</h3>}
      <div className={cn("w-full", compact ? "h-24" : "h-48")}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94a3b8' }} 
              />
              <YAxis 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94a3b8' }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '12px', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '10px'
                }} 
              />
              {keys.map((key, i) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={COLORS[i % COLORS.length]} 
                  radius={[4, 4, 0, 0]} 
                />
              ))}
            </BarChart>
          ) : type === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94a3b8' }} 
              />
              <YAxis 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94a3b8' }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '12px', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '10px'
                }} 
              />
              {keys.map((key, i) => (
                <Line 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={COLORS[i % COLORS.length]} 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: COLORS[i % COLORS.length] }} 
                />
              ))}
            </LineChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey={keys[0]}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '12px', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '10px'
                }} 
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
