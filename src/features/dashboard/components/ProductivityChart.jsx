import React, { useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import Icon from "../../../components/AppIcon";

const ProductivityChart = ({ data, loading }) => {
  const [chartType, setChartType] = useState("area");

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

  const avgProductivity =
    chartData.reduce((acc, cur) => acc + (cur.value || 0), 0) /
      chartData.length || 0;

  return (
    <div className="bg-white border border-slate-200 p-8 transition-all duration-300 hover:shadow-[12px_12px_0px_rgba(15,23,42,0.03)] group h-full flex flex-col">
      <div className="flex items-center justify-between mb-10">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-6 bg-slate-900"></span>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Productivity Index</h3>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-3.5">Analysis_Feed: PERFORMANCE_VECTORS</p>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setChartType(prev => prev === 'area' ? 'line' : 'area')}
            className="p-2 border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all active:translate-y-0.5"
            title="Toggle Protocol"
          >
            <Icon name={chartType === "area" ? "TrendingUp" : "AreaChart"} size={16} strokeWidth={3} />
          </button>
          <button className="p-2 border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all active:translate-y-0.5" title="Archival Export">
            <Icon name="Download" size={16} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="h-72 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
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
              dy={10}
            />
            <YAxis 
              axisLine={{ stroke: '#0f172a', strokeWidth: 1 }}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
              domain={[0, 100]}
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
              type="monotone" 
              dataKey="value" 
              name="Productivity_Units"
              stroke="#0f172a" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorProd)" 
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">AGGREGATE_EFFICIENCY</span>
          <div className="flex items-center space-x-3">
            <span className="text-3xl font-black text-slate-900 tracking-tighter font-mono">{avgProductivity.toFixed(1)}%</span>
            <div className="flex items-center bg-emerald-900 text-white text-[9px] font-black px-2 py-0.5 shadow-[4px_4px_0px_rgba(5,150,105,0.1)]">
              <Icon name="TrendingUp" size={10} className="mr-1" strokeWidth={4} />
              +2.4%
            </div>
          </div>
        </div>
        <button className="text-[10px] font-black text-slate-900 group flex items-center hover:opacity-70 transition-opacity uppercase tracking-[0.2em] border-b-2 border-slate-900 pb-0.5">
          Decrypt Analysis
          <Icon name="ChevronRight" size={12} className="ml-1 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default ProductivityChart;