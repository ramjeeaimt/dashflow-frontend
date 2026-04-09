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
      <div className="bg-card border border-border/50 rounded-xl p-6 h-[450px] animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-2"></div>
        <div className="h-4 w-64 bg-muted rounded mb-8"></div>
        <div className="h-64 w-full bg-muted/50 rounded-lg"></div>
      </div>
    );
  }

  const chartData = data || [];

  const avgProductivity =
    chartData.reduce((acc, cur) => acc + (cur.value || 0), 0) /
      chartData.length || 0;

  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-foreground">Productivity Trends</h3>
          <p className="text-sm text-muted-foreground/80">
            Performance metrics across the team
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setChartType(prev => prev === 'area' ? 'line' : 'area')}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors border border-transparent hover:border-primary/20"
            title="Toggle View"
          >
            <Icon name={chartType === "area" ? "TrendingUp" : "AreaChart"} size={18} />
          </button>
          <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors border border-transparent hover:border-primary/20" title="Export">
            <Icon name="Download" size={18} />
          </button>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
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
              domain={[0, 100]}
            />
            <Tooltip
              cursor={{ stroke: 'var(--color-success)', strokeWidth: 1 }}
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '8px 12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              name="Productivity"
              stroke="var(--color-success)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorProd)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/40">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Average Growth</span>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-foreground">{avgProductivity.toFixed(1)}%</span>
            <div className="flex items-center text-success text-xs font-bold bg-success/10 px-1.5 py-0.5 rounded-md">
              <Icon name="TrendingUp" size={12} className="mr-0.5" />
              +2.4%
            </div>
          </div>
        </div>
        <div className="text-xs font-bold text-primary group cursor-pointer flex items-center hover:opacity-80 transition-opacity">
          Analysis Details
          <Icon name="ChevronRight" size={14} className="ml-1" />
        </div>
      </div>
    </div>
  );
};

export default ProductivityChart;