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
      <div className="bg-card border border-border/50 rounded-none p-6 h-[450px] animate-pulse">
        <div className="h-6 w-48 bg-muted rounded-none mb-2"></div>
        <div className="h-4 w-64 bg-muted rounded-none mb-8"></div>
        <div className="h-64 w-full bg-muted/50 rounded-none"></div>
      </div>
    );
  }

  const chartData = data || [];

  return (
    <div className="bg-white border border-slate-200 p-8 transition-all duration-300 hover:shadow-[12px_12px_0px_rgba(15,23,42,0.03)] group h-full flex flex-col">
      <div className="flex items-center justify-between mb-10">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-6 bg-slate-900"></span>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Attendance Dynamics</h3>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-3.5">System_Tracking: DAILY_PRESENCE_METRICS</p>
        </div>
        <div className="flex items-center p-1 bg-slate-50 border border-slate-200">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
              timeRange === 'week' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Terminal_Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
              timeRange === 'month' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Operational_Month
          </button>
        </div>
      </div>

      <div className="h-72 relative">
        {/* Decorative corner markers */}
        <div className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 border-slate-200"></div>
        <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 border-slate-200"></div>
        
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              axisLine={{ stroke: '#0f172a', strokeWidth: 1 }}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
              className="uppercase tracking-tighter"
              dy={10}
            />
            <YAxis 
              axisLine={{ stroke: '#0f172a', strokeWidth: 1 }}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
            />
            <Tooltip
              cursor={{ stroke: '#0f172a', strokeWidth: 1 }}
              contentStyle={{
                backgroundColor: '#0f172a',
                border: 'none',
                borderRadius: '0px',
                padding: '12px',
                boxShadow: '8px 8px 0px rgba(15,23,42,0.1)'
              }}
              labelStyle={{ color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px', marginBottom: '8px' }}
              itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}
            />
            <Area 
              type="stepAfter" 
              dataKey="present" 
              name="Present_Count"
              stroke="#0f172a" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPresent)" 
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-slate-900"></div>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Live_Personnel_Manifest</span>
          </div>
        </div>
        <button className="text-[10px] font-black text-slate-900 group flex items-center hover:opacity-70 transition-opacity uppercase tracking-[0.2em] border-b-2 border-slate-900 pb-0.5">
          Access Detailed Logs
          <Icon name="ChevronRight" size={12} className="ml-1 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default AttendanceChart;