import React from 'react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';

const AttendanceAnalytics = ({ analyticsData }) => {
  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64 bg-white border-2 border-slate-900 shadow-[8px_8px_0px_rgba(15,23,42,0.05)] pt-8">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Initializing_Analytics_Stream...</span>
      </div>
    );
  }

  const { weeklyTrend, distribution, punctualityTrend } = analyticsData;

  // Transform distribution data for PieChart
  const attendanceDistribution = distribution?.map(item => ({
    name: item.name.toUpperCase(),
    value: item.value,
    color: item.name === 'present' ? '#064e3b' : // emerald-900
      item.name === 'absent' ? '#881337' : // rose-900
        item.name === 'late' ? '#78350f' : '#0f172a' // amber-900 : slate-900
  })) || [];

  // Mock department stats for now as backend doesn't provide it yet
  const departmentStats = [
    { name: 'ENGINEERING', present: 85, total: 92, rate: 92.4 },
    { name: 'MARKETING', present: 28, total: 32, rate: 87.5 },
    { name: 'SALES_FORCE', present: 45, total: 48, rate: 93.8 },
    { name: 'OPERATIONS', present: 12, total: 15, rate: 80.0 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
      {/* Weekly Attendance Trend */}
      <div className="bg-white border-2 border-slate-900 p-8 shadow-[12px_12px_0px_rgba(15,23,42,0.05)] group">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
           <div className="space-y-1">
                <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-6 bg-slate-900"></span>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Weekly Trend</h3>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-3.5">Feed: ATTENDANCE_CHRONO_MAP</p>
           </div>
          <Icon name="TrendingUp" size={20} className="text-slate-900 group-hover:scale-125 transition-transform" strokeWidth={3} />
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="day"
                axisLine={{ stroke: '#0f172a', strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                dy={10}
              />
              <YAxis
                axisLine={{ stroke: '#0f172a', strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(15,23,42,0.02)' }}
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
              <Bar dataKey="present" fill="#0f172a" name="Active" radius={[0, 0, 0, 0]} />
              <Bar dataKey="late" fill="#94a3b8" name="Delayed" radius={[0, 0, 0, 0]} />
              <Bar dataKey="absent" fill="#e2e8f0" name="Void" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attendance Distribution */}
      <div className="bg-white border-2 border-slate-900 p-8 shadow-[12px_12px_0px_rgba(15,23,42,0.05)] group">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
           <div className="space-y-1">
                <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-6 bg-slate-900"></span>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Metric Allocation</h3>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-3.5">Analysis: VOLUME_DISTRIBUTION</p>
           </div>
          <Icon name="PieChart" size={20} className="text-slate-900 group-hover:rotate-12 transition-transform" strokeWidth={3} />
        </div>
        <div className="h-72 flex items-center">
          <ResponsiveContainer width="55%" height="100%">
            <PieChart>
              <Pie
                data={attendanceDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                paddingAngle={4}
                stroke="none"
              >
                {attendanceDistribution?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '0px',
                    padding: '8px',
                    boxShadow: '4px 4px 0px rgba(0,0,0,0.1)'
                }}
                itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-4 pl-4 border-l border-slate-100">
            {attendanceDistribution?.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                    style={{ backgroundColor: item?.color }}
                  ></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{item?.name}</span>
                </div>
                <span className="text-[10px] font-black text-slate-900 font-mono italic">{item?.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Performance */}
      <div className="bg-white border-2 border-slate-900 p-8 shadow-[12px_12px_0px_rgba(15,23,42,0.05)] group">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
           <div className="space-y-1">
                <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-6 bg-slate-900"></span>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Sector Performance</h3>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-3.5">Metrics: EFFICIENCY_VECTORS</p>
           </div>
          <Icon name="Building" size={20} className="text-slate-900 group-hover:translate-z-10 transition-transform" strokeWidth={3} />
        </div>
        <div className="space-y-6">
          {departmentStats?.map((dept, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{dept?.name}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-tighter">{dept?.present} OF {dept?.total} UNIT_ACTIVE</span>
              </div>
              <div className="w-full bg-slate-100 border border-slate-200 h-4 shadow-inner relative">
                <div
                  className="bg-slate-900 h-full transition-all duration-700 ease-out"
                  style={{ width: `${dept?.rate}%` }}
                ></div>
                <span className="absolute right-2 top-0.5 text-[8px] font-black text-slate-400 italic">{dept?.rate}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Punctuality Area Chart */}
      <div className="bg-white border-2 border-slate-900 p-8 shadow-[12px_12px_0px_rgba(15,23,42,0.05)] group">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
           <div className="space-y-1">
                <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-6 bg-slate-900"></span>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Punctuality Vector</h3>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-3.5">History: 6MO_ACCURACY_INDEX</p>
           </div>
          <Icon name="Clock" size={20} className="text-slate-900" strokeWidth={3} />
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={punctualityTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOnTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="month"
                axisLine={{ stroke: '#0f172a', strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                dy={10}
              />
              <YAxis
                axisLine={{ stroke: '#0f172a', strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
              />
              <Tooltip
                 contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '0px',
                    padding: '12px',
                    boxShadow: '8px 8px 0px rgba(15,23,42,0.1)'
                  }}
                  itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
              />
              <Area
                type="monotone"
                dataKey="onTime"
                stroke="#0f172a"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorOnTime)"
                name="PRECISION"
              />
               <Area
                type="monotone"
                dataKey="late"
                stroke="#94a3b8"
                strokeWidth={2}
                fillOpacity={0}
                strokeDasharray="5 5"
                name="DELAY_MARKER"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AttendanceAnalytics;