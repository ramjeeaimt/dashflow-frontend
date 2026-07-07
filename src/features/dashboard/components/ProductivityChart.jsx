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
      <div className="bg-card rounded-lg p-6 h-[450px] animate-pulse">
        <div className="h-6 w-48 bg-muted rounded-lg mb-2"></div>
        <div className="h-4 w-64 bg-muted/60 rounded-lg mb-8"></div>
        <div className="h-64 w-full bg-muted/50 rounded-lg"></div>
      </div>
    );
  }

  const chartData = data || [];

  const avgProductivity =
    chartData.reduce((acc, cur) => acc + (cur.value || 0), 0) /
      chartData.length || 0;

  return (
    <div className="bg-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-foreground tracking-tight">Productivity Index</h3>
          <p className="text-xs text-muted-foreground/70 font-medium">Performance vector analysis</p>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setChartType(prev => prev === 'area' ? 'line' : 'area')}
            className="p-2 bg-muted/60 border border-border text-muted-foreground/70 hover:text-primary hover:bg-card rounded-lg transition-all shadow-sm"
            title="Toggle Protocol"
          >
            <Icon name={chartType === "area" ? "TrendingUp" : "AreaChart"} size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
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
              domain={[0, 100]}
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
              dataKey="value" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorProd)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-50">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70 font-bold mb-1">AGGREGATE_EFFICIENCY</span>
          <div className="flex items-center space-x-3">
            <span className="text-3xl font-bold text-foreground tracking-tight">{avgProductivity.toFixed(1)}%</span>
            <div className="flex items-center bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-lg">
              <Icon name="TrendingUp" size={10} className="mr-1" strokeWidth={3} />
              +2.4%
            </div>
          </div>
        </div>
        <button className="text-xs font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1 group">
          Detailed Analysis
          <Icon name="ArrowRight" size={14} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default ProductivityChart;