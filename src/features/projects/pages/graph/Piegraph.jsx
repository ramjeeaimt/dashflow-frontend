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
            <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#1f2937" className="text-lg font-bold">
                {payload.name}
            </text>
            <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#6b7280" className="text-sm">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
            <Sector
                cx={cx} cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 6}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                opacity={0.9}
            />
            <Sector
                cx={cx} cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 8}
                outerRadius={outerRadius + 12}
                fill={fill}
            />
        </g>
    );
};

// Custom tooltip with modern styling
const CustomTooltip = ({ active, payload, total }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl p-3 animate-in fade-in zoom-in-95 duration-200">
                <p className="text-xs font-medium text-gray-500 mb-1">{data.name}</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold" style={{ color: data.color }}>
                        {data.value}
                    </span>
                    <span className="text-xs text-gray-500">projects</span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                        {total > 0 ? ((data.value / total) * 100).toFixed(1) : 0}% of total
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

const Piegraph = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [hidden, setHidden] = useState([]);

    // 1. Grab pre-calculated data from Store
    const statusData = useProjectStore((state) => state.statusData) || [];
    const loading = useProjectStore((state) => state.loading);

    // 2. Memoize derived values to prevent infinite loops
    const total = useMemo(() => 
        statusData.reduce((sum, item) => sum + item.value, 0), 
    [statusData]);

    const visibleData = useMemo(() => 
        statusData.filter((item) => !hidden.includes(item.name)), 
    [statusData, hidden]);

    const visibleTotal = useMemo(() => 
        visibleData.reduce((sum, item) => sum + item.value, 0), 
    [visibleData]);

    const toggleLegend = (name) => {
        setHidden(prev => 
            prev.includes(name) ? prev.filter(h => h !== name) : [...prev, name]
        );
    };

    if (loading && statusData.length === 0) {
        return <div className="w-full h-[450px] bg-white animate-pulse rounded-2xl border border-gray-100" />;
    }

    return (
        <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-xl">
            {/* Header */}
            <div className="px-6 pt-6 pb-2 border-b border-gray-100">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Project Status</h3>
                        <p className="text-sm text-gray-500 mt-0.5">Overall distribution</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Total</p>
                        <p className="text-2xl font-bold text-gray-800">{total}</p>
                    </div>
                </div>
            </div>

            {/* Chart + Legend */}
            <div className="flex flex-col md:flex-row items-center p-4 gap-6">
                <div className="w-full md:w-2/3 h-[238px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                data={visibleData}
                                cx="50%" cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                dataKey="value"
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                                isAnimationActive={true}
                            >
                                {visibleData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip total={total} />} />
                            
                            {/* Center labels */}
                            {/* <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-gray-800">
                                {visibleTotal}
                            </text> */}
                            <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="text-[10px] uppercase  tracking-widest fill-gray-400 font-bold">
                                projects
                            </text>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend Items */}
                <div className="w-full md:w-1/3 space-y-2">
                    {statusData.map((item) => {
                        const isHidden = hidden.includes(item.name);
                        return (
                            <button
                                key={item.name}
                                onClick={() => toggleLegend(item.name)}
                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                                    isHidden ? "bg-gray-50 opacity-50" : "bg-gray-50 hover:bg-gray-100"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: isHidden ? "#d1d5db" : item.color }} />
                                    <span className={`text-sm font-medium ${isHidden ? "text-gray-400 line-through" : "text-gray-700"}`}>
                                        {item.name}
                                    </span>
                                </div>
                                <span className={`text-sm font-semibold ${isHidden ? "text-gray-400" : "text-gray-800"}`}>
                                    {item.value}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer Summary */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between font-bold uppercase tracking-tight">
                <div className="flex items-center gap-2">
                    <TbAlarmAverage size={16} className="text-green-500" />
                    <span>Done: {statusData.find(d => d.name === "Completed")?.value || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-blue-500">⚙️</span>
                    <span>Active: {statusData.find(d => d.name === "In Progress")?.value || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MdOutlinePending size={16} className="text-yellow-500" />
                    <span>Pending: {statusData.find(d => d.name === "Pending")?.value || 0}</span>
                </div>
            </div>
        </div>
    );
};

export default Piegraph;