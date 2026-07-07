import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import Icon from '../../../components/AppIcon';


const AttendanceChart = ({ data, loading }) => {
  const [timeRange, setTimeRange] = useState('week');

  if (loading) {
    return (
      <div className="bg-card rounded-lg p-6 h-[450px] animate-pulse">
        <div className="h-6 w-48 bg-muted rounded-lg mb-2"></div>
        <div className="h-4 w-64 bg-muted/60 rounded-lg mb-8"></div>
        <div className="h-64 w-full bg-muted/50 rounded-lg"></div>
      </div>
    );
  }

  const chartData = data || [];

  return (
    <div className="bg-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-foreground tracking-tight">Attendance Dynamics</h3>
          <p className="text-xs text-muted-foreground/70 font-medium">Daily presence trends and personnel manifest</p>
        </div>
        <div className="flex items-center p-1 bg-muted/60 rounded-lg border border-border">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-1.5 text-xs font-bold transition-all duration-200 rounded-lg ${
 timeRange === 'week' 
 ? 'bg-card text-primary shadow-sm' 
 : 'text-muted-foreground/70 hover:text-muted-foreground'
 }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-1.5 text-xs font-bold transition-all duration-200 rounded-lg ${
 timeRange === 'month' 
 ? 'bg-card text-primary shadow-sm' 
 : 'text-muted-foreground/70 hover:text-muted-foreground'
 }`}
          >
            Month
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #f1f5f9',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              labelStyle={{ color: '#64748b', fontWeight: '700', fontSize: '11px', marginBottom: '4px' }}
              itemStyle={{ color: '#1e293b', fontSize: '13px', fontWeight: '600' }}
            />
            <Area 
              type="monotone" 
              dataKey="present" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPresent)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-50">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-primary shadow-sm "></div>
          <span className="text-xs font-bold text-muted-foreground">Live Personnel Stream</span>
        </div>
        <button className="text-xs font-bold text-primary hover:text-primary transition-colors flex items-center gap-1 group">
          View Detailed Logs
          <Icon name="ArrowRight" size={14} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default AttendanceChart;