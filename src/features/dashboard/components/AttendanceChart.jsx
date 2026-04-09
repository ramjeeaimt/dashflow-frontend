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
      <div className="bg-card border border-border/50 rounded-xl p-6 h-[450px] animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-2"></div>
        <div className="h-4 w-64 bg-muted rounded mb-8"></div>
        <div className="h-64 w-full bg-muted/50 rounded-lg"></div>
      </div>
    );
  }

  const chartData = data || [];

  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-foreground">Attendance Overview</h3>
          <p className="text-sm text-muted-foreground/80">Daily presence trends for the current week</p>
        </div>
        <div className="flex items-center p-1 bg-muted/50 rounded-lg border border-border/20">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
              timeRange === 'week' 
                ? 'bg-card text-primary shadow-sm border border-border/50' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
              timeRange === 'month' 
                ? 'bg-card text-primary shadow-sm border border-border/50' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11, fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11, fontWeight: 500 }}
            />
            <Tooltip
              cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '8px 12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}
              itemStyle={{ fontSize: '12px', padding: '2px 0' }}
            />
            <Area 
              type="monotone" 
              dataKey="present" 
              name="Present"
              stroke="var(--color-primary)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPresent)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/40">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]"></div>
            <span className="text-xs font-medium text-muted-foreground">Present Employees</span>
          </div>
        </div>
        <div className="text-xs font-bold text-primary group cursor-pointer flex items-center hover:opacity-80 transition-opacity">
          View Detailed Logs
          <Icon name="ChevronRight" size={14} className="ml-1" />
        </div>
      </div>
    </div>
  );
};

export default AttendanceChart;