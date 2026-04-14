import React, { useState, useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Sector,
} from "recharts";
import { TbAlarmAverage } from "react-icons/tb";
import { MdOutlinePending } from "react-icons/md";
import useProjectStore from "store/useProjectStore";

// Custom active shape for hover effect (Stable outside component)
const renderActiveShape = (props) => {
    const {
        cx, cy, innerRadius, outerRadius, startAngle, endAngle,
        fill, payload, percent
    } = props;

    return (
        <g>
            <text x={cx} y={cy} dy={-25} textAnchor="middle" fill="#0f172a" className="text-[10px] font-black uppercase tracking-widest">
                {payload.name}
            </text>
            <text x={cx} y={cy} dy={5} textAnchor="middle" fill="#0f172a" className="text-2xl font-black font-mono italic">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
            <Sector
                cx={cx} cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 4}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
        </g>
    );
};

// Custom tooltip with industrial styling
const CustomTooltip = ({ active, payload, total }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-900 p-3 shadow-[8px_8px_0px_rgba(15,23,42,0.1)]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{data.name}_ALLOCATION</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-white font-mono italic">
                        {data.value}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Units</span>
                </div>
            </div>
        );
    }
    return null;
};

const Piegraph = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [hidden, setHidden] = useState([]);

    const statusData = useProjectStore((state) => state.statusData) || [];
    const loading = useProjectStore((state) => state.loading);

    const total = useMemo(() => 
        statusData.reduce((sum, item) => sum + item.value, 0), 
    [statusData]);

    const visibleData = useMemo(() => 
        statusData.filter((item) => !hidden.includes(item.name)), 
    [statusData, hidden]);

    const toggleLegend = (name) => {
        setHidden(prev => 
            prev.includes(name) ? prev.filter(h => h !== name) : [...prev, name]
        );
    };

    if (loading && statusData.length === 0) {
        return <div className="w-full h-[450px] bg-white border-2 border-slate-900 animate-pulse flex items-center justify-center font-black text-[10px] text-slate-400 uppercase tracking-widest">Analyzing_Distribution...</div>;
    }

    return (
        <div className="w-full bg-white border-2 border-slate-900 shadow-[12px_12px_0px_rgba(15,23,42,0.05)] overflow-hidden group">
            {/* Header */}
            <div className="px-8 pt-8 pb-4 border-b border-slate-100 flex justify-between items-start">
                <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-6 bg-slate-900"></span>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Status Distribution</h3>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-3.5">Analysis: VOLUME_SPLIT</p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] text-slate-400 uppercase tracking-[0.3em] font-black mb-1">TOTAL_RECORDS</p>
                    <p className="text-2xl font-black text-slate-900 font-mono italic">{total}</p>
                </div>
            </div>

            {/* Chart + Legend */}
            <div className="flex flex-col xl:flex-row items-center p-8 gap-8">
                <div className="w-full xl:w-1/2 h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                data={visibleData}
                                cx="50%" cy="50%"
                                innerRadius={75}
                                outerRadius={95}
                                dataKey="value"
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                                isAnimationActive={true}
                                stroke="none"
                            >
                                {visibleData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip total={total} />} />
                            <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-[8px] uppercase tracking-[0.4em] fill-slate-300 font-black">
                                PROTOCOL_MAP
                            </text>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend Items */}
                <div className="w-full xl:w-1/2 space-y-3">
                    {statusData.map((item) => {
                        const isHidden = hidden.includes(item.name);
                        return (
                            <button
                                key={item.name}
                                onClick={() => toggleLegend(item.name)}
                                className={`w-full flex items-center justify-between p-4 border-l-4 transition-all duration-200 shadow-sm ${
                                    isHidden ? "bg-slate-50 border-slate-200 opacity-40" : "bg-slate-50 border-slate-900 hover:bg-white"
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2" style={{ backgroundColor: isHidden ? "#d1d5db" : item.color }} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isHidden ? "text-slate-400" : "text-slate-900"}`}>
                                        {item.name}
                                    </span>
                                </div>
                                <span className={`text-[10px] font-black font-mono italic ${isHidden ? "text-slate-400" : "text-slate-900"}`}>
                                    {item.value} Units
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer Summary Bar */}
            <div className="px-8 py-4 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-between border-t border-slate-800">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-400"></div>
                        <span>Done: {statusData.find(d => d.name === "Completed")?.value || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400"></div>
                        <span>Active: {statusData.find(d => d.name === "In Progress")?.value || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-amber-400"></div>
                        <span>Pending: {statusData.find(d => d.name === "Pending")?.value || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Piegraph;