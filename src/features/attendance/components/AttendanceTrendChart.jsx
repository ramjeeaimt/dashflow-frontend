import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

const AttendanceTrendChart = ({ data, period }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (period === 'weekly') {
      return `Week ${Math.ceil(date?.getDate() / 7)}`;
    } else if (period === 'monthly' || period === 'yearly') {
      return date?.toLocaleDateString('en-US', { month: 'short' });
    } else {
      return date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl p-4 shadow-xl shadow-slate-200/50">
          <p className="text-slate-900 font-black text-xs uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">
            {formatDate(label)}
          </p>
          <div className="space-y-2">
            {payload?.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry?.color }}></div>
                  <span className="text-[11px] font-bold text-slate-500">{entry?.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900">{entry?.value}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Workforce Performance Trends</h3>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Visualizing {period === 'weekly' ? 'weekly' : period === 'monthly' ? 'monthly' : 'daily'} patterns in attendance and productivity
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <LegendItem color="bg-indigo-500" label="Attendance" />
          <LegendItem color="bg-emerald-500" label="Punctuality" />
          <LegendItem color="bg-amber-500" label="Productivity" />
        </div>
      </div>
      
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPunctuality" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProductivity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
              dy={15}
            />
            <YAxis 
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="attendance" 
              stroke="#6366f1" 
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAttendance)"
              name="Attendance Rate"
              animationDuration={1500}
            />
            <Area 
              type="monotone" 
              dataKey="punctuality" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorPunctuality)"
              name="Punctuality Score"
              animationDuration={1800}
            />
            <Area 
              type="monotone" 
              dataKey="productivity" 
              stroke="#f59e0b" 
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorProductivity)"
              name="Productivity Index"
              animationDuration={2100}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-sm shadow-black/10`}></div>
    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{label}</span>
  </div>
);

export default AttendanceTrendChart;