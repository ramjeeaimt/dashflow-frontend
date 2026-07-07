import React, { useMemo } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import useProjectStore from "store/useProjectStore";

const CustomTooltip = ({ active, payload, label, growthData }) => {
    if (active && payload && payload.length && growthData) {
        const value = payload[0].value;
        const currentIndex = growthData.findIndex((d) => d.month === label);
        const previousValue = currentIndex > 0 ? growthData[currentIndex - 1].projects : 0;
        const diff = value - previousValue;

        return (
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
                <p className="text-xs font-bold text-muted-foreground/70 mb-2">{label}</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">{value}</span>
                    <span className="text-xs text-muted-foreground font-medium">Projects</span>
                </div>
                {diff !== 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-50">
                        <p className={`text-[11px] font-bold ${diff > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                            {diff > 0 ? "+" : ""}{diff} from last month
                        </p>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const CustomCursor = (props) => {
    const { points, height } = props;
    if (!points || !points[0]) return null;
    const { x } = points[0];
    return (
        <line x1={x} y1={0} x2={x} y2={height} stroke="#e2e8f0" strokeWidth={1} />
    );
};

const ProjectLineGraph = () => {
    const growthData = useProjectStore((state) => state.growthData) || [];
    const loading = useProjectStore((state) => state.loading);

    const stats = useMemo(() => {
        if (!growthData.length) return { total: 0, pct: "0.0", avg: 0, peak: null };

        const total = growthData.reduce((sum, d) => sum + d.projects, 0);
        const firstVal = growthData[0]?.projects || 0;
        const lastVal = growthData[growthData.length - 1]?.projects || 0;

        const pct = firstVal === 0
            ? (lastVal * 100).toFixed(1)
            : (((lastVal - firstVal) / firstVal) * 100).toFixed(1);

        const avg = growthData.length > 1
            ? (lastVal - firstVal) / (growthData.length - 1)
            : 0;

        const peak = [...growthData].sort((a, b) => b.projects - a.projects)[0];

        return { total, pct, avg, peak };
    }, [growthData]);

    if (loading && growthData.length === 0) {
        return <div className="w-full h-[400px] bg-card animate-pulse flex items-center justify-center font-bold text-sm text-muted-foreground/70">Loading growth data...</div>;
    }

    return (
        <div className="w-full bg-card transition-all group">
            <div className="px-4 pt-4 pb-6 flex justify-between items-end">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground">Project Growth</h3>
                    <p className="text-xs text-muted-foreground font-medium italic">Monthly project initialization trends</p>
                </div>
                <div className="flex gap-10">
                    <div className="text-right">
                        <p className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider mb-0.5">Total</p>
                        <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider mb-0.5">Growth</p>
                        <p className={`text-2xl font-bold ${Number(stats.pct) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {Number(stats.pct) >= 0 ? '↑' : '↓'}{Math.abs(stats.pct)}%
                        </p>
                    </div>
                </div>
            </div>

            <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="projectGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
                            allowDecimals={false} 
                            dx={-5}
                        />
                        <Tooltip
                            content={<CustomTooltip growthData={growthData} />}
                            cursor={<CustomCursor />}
                            wrapperStyle={{ outline: 'none' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="projects"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fill="url(#projectGradient)"
                            fillOpacity={1}
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                            animationDuration={2000}
                            animationEasing="ease-in-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            
            <div className="mt-8 flex items-center justify-between px-4 border-t border-slate-50 pt-6">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-sm"></div>
                    <span className="text-xs font-bold text-foreground">Project Distribution Overview</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <span className="text-[10px] font-bold text-muted-foreground/70 block uppercase">Peak Performance</span>
                        <span className="text-xs font-semibold text-foreground">{stats?.peak?.projects || 0} Projects ({stats?.peak?.month})</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectLineGraph;
