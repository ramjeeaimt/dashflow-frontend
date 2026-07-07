import React, { useState, useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Sector,
} from "recharts";
import useProjectStore from "store/useProjectStore";

const renderActiveShape = (props) => {
    const {
        cx, cy, innerRadius, outerRadius, startAngle, endAngle,
        fill, payload, percent
    } = props;

    return (
        <g>
            <text x={cx} y={cy} dy={-15} textAnchor="middle" fill="#64748b" className="text-[11px] font-bold">
                {payload.name}
            </text>
            <text x={cx} y={cy} dy={15} textAnchor="middle" fill="#1e293b" className="text-2xl font-semibold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
            <Sector
                cx={cx} cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 6}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                stroke="#fff"
                strokeWidth={2}
            />
        </g>
    );
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-card border border-border p-3 rounded-xl shadow-sm">
                <p className="text-xs font-bold text-muted-foreground/70 mb-1">{data.name}</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-foreground">{data.value}</span>
                    <span className="text-xs text-muted-foreground font-medium">Projects</span>
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
        return <div className="w-full h-[450px] bg-card animate-pulse flex items-center justify-center font-bold text-sm text-muted-foreground/70">Loading distribution...</div>;
    }

    return (
        <div className="w-full bg-card transition-all group">
            {/* Header */}
            <div className="px-4 pt-4 pb-6 flex justify-between items-end">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground">Status Distribution</h3>
                    <p className="text-xs text-muted-foreground font-medium italic">Project layout by phase and activity</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider mb-0.5">Total Records</p>
                    <p className="text-2xl font-bold text-foreground">{total}</p>
                </div>
            </div>

            {/* Chart + Legend */}
            <div className="flex flex-col xl:flex-row items-center p-4 gap-8">
                <div className="w-full xl:w-1/2 h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                data={visibleData}
                                cx="50%" cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                dataKey="value"
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                                isAnimationActive={true}
                                animationDuration={1000}
                                stroke="none"
                            >
                                {visibleData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend Items */}
                <div className="w-full xl:w-1/2 grid grid-cols-1 gap-3">
                    {statusData.map((item) => {
                        const isHidden = hidden.includes(item.name);
                        return (
                            <button
                                key={item.name}
                                onClick={() => toggleLegend(item.name)}
                                className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
 isHidden ? "bg-muted/60 opacity-40" : "bg-muted/60 hover:bg-muted"
 }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: isHidden ? "#cbd5e1" : item.color }} />
                                    <span className={`text-xs font-bold ${isHidden ? "text-muted-foreground/70" : "text-foreground"}`}>
                                        {item.name}
                                    </span>
                                </div>
                                <span className={`text-xs font-semibold ${isHidden ? "text-muted-foreground/70" : "text-foreground"}`}>
                                    {item.value} 
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer Summary */}
            <div className="mt-4 flex items-center gap-6 px-4 py-6 border-t border-slate-50">
                {statusData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-[11px] font-bold text-muted-foreground">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Piegraph;
