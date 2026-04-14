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
import useProjectStore from "store/useProjectStore"; // Ensure path is correct

const CustomTooltip = ({ active, payload, label, growthData }) => {
    if (active && payload && payload.length && growthData) {
        const value = payload[0].value;
        const currentIndex = growthData.findIndex((d) => d.month === label);
        const previousValue = currentIndex > 0 ? growthData[currentIndex - 1].projects : 0;
        const diff = value - previousValue;

        return (
            <div className="bg-slate-900 border-none p-4 shadow-[8px_8px_0px_rgba(15,23,42,0.1)]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}_CHRONO_POINT</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white font-mono italic">{value}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Units</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800">
                    <p className={`text-[9px] font-black uppercase tracking-widest ${diff >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {diff >= 0 ? "VECTOR: POSITIVE" : "VECTOR: NEGATIVE"} [ {Math.abs(diff)} ]
                    </p>
                </div>
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
        <line x1={x} y1={0} x2={x} y2={height} stroke="#0f172a" strokeWidth={2} strokeDasharray="0 0" />
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
        return <div className="w-full h-[400px] bg-white border-2 border-slate-900 animate-pulse flex items-center justify-center font-black text-[10px] text-slate-400 uppercase tracking-widest">Initializing_Growth_Stream...</div>;
    }

    return (
        <div className="w-full bg-white border-2 border-slate-900 shadow-[12px_12px_0px_rgba(15,23,42,0.05)] overflow-hidden group">
            <div className="px-8 pt-8 pb-4 border-b border-slate-100 flex justify-between items-start">
                <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-6 bg-slate-900"></span>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Project Growth</h3>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-3.5">Feed: EXPANSION_METRICS</p>
                </div>
                <div className="flex gap-8">
                    <div className="text-right">
                        <p className="text-[9px] text-slate-400 uppercase tracking-[0.3em] font-black mb-1">Cumulative</p>
                        <p className="text-2xl font-black text-slate-900 font-mono italic">{stats.total}</p>
                    </div>
                    <div className="text-right border-l border-slate-100 pl-8">
                        <p className="text-[9px] text-slate-400 uppercase tracking-[0.3em] font-black mb-1">Variance</p>
                        <p className={`text-2xl font-black font-mono italic ${Number(stats.pct) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {Number(stats.pct) >= 0 ? '+' : ''}{stats.pct}%
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 pt-2 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="projectGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#0f172a" stopOpacity={0.05} />
                                <stop offset="100%" stopColor="#0f172a" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="0" stroke="#e2e8f0" />
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
                            allowDecimals={false} 
                        />
                        <Tooltip
                            content={<CustomTooltip growthData={growthData} />}
                            cursor={<CustomCursor />}
                            wrapperStyle={{ outline: 'none' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="projects"
                            stroke="#0f172a"
                            strokeWidth={3}
                            fill="url(#projectGradient)"
                            fillOpacity={1}
                            activeDot={{ r: 4, strokeWidth: 4, stroke: '#ffffff', fill: '#0f172a' }}
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="px-8 py-4 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-between border-t border-slate-800">
                <div className="flex items-center gap-4">
                    <span className="w-2 h-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]"></span>
                    <span>Mean_Flow_Index: {stats?.avg?.toFixed(1) || 0} unit/mo</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>Performance_Peak: {stats?.peak?.projects || 0}_ARTF @ {stats?.peak?.month?.toUpperCase() || "NULL"}</span>
                </div>
            </div>
        </div>
    );
};

export default ProjectLineGraph;