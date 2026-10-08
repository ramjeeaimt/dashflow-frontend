import React, { useEffect, useMemo, useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import { attendanceService } from '../../../services/attendance.service';

/**
 * Month-grid attendance view with rich hover inspection, check-in/out times,
 * leave reasons, holiday detection, and Saturday policy badges.
 */

const DAY_STYLE = {
    present: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/80 hover:border-emerald-400',
    late: 'bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100/80 hover:border-amber-400',
    early_checkin: 'bg-blue-50 text-blue-700 border-blue-200/80 hover:bg-blue-100/80 hover:border-blue-400',
    early_departure: 'bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100/80 hover:border-amber-400',
    'half-day': 'bg-orange-50 text-orange-700 border-orange-200/80 hover:bg-orange-100/80 hover:border-orange-400',
    wfh: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 hover:bg-indigo-100/80 hover:border-indigo-400',
    leave: 'bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100/80 hover:border-rose-400',
    absent: 'bg-rose-50/60 text-rose-600 border-rose-200/60 hover:bg-rose-100/80 hover:border-rose-400',
    holiday: 'bg-purple-50 text-purple-700 border-purple-200/80 hover:bg-purple-100/80 hover:border-purple-400',
    holiday_half: 'bg-purple-50/80 text-purple-700 border-purple-200/80 hover:bg-purple-100/80 hover:border-purple-400',
    weekend: 'bg-slate-100/80 text-slate-500 border-slate-200/80 hover:bg-slate-200/70 hover:border-slate-300',
    upcoming: 'bg-card text-muted-foreground/40 border-border/60 hover:bg-muted/40 hover:border-border',
};

const LEGEND = [
    { type: 'present', label: 'Present' },
    { type: 'late', label: 'Late' },
    { type: 'half-day', label: 'Half Day' },
    { type: 'wfh', label: 'WFH' },
    { type: 'leave', label: 'Leave' },
    { type: 'holiday', label: 'Holiday' },
    { type: 'absent', label: 'Absent' },
    { type: 'weekend', label: 'Weekend' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const pad = (n) => String(n).padStart(2, '0');
const toISO = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

const AttendanceCalendar = ({ employeeId }) => {
    const now = new Date();
    const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
    const [days, setDays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoveredCell, setHoveredCell] = useState(null);
    const containerRef = useRef(null);

    const { year, month } = cursor;
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingBlanks = firstDay.getDay();

    useEffect(() => {
        if (!employeeId) return;
        let cancelled = false;
        setLoading(true);
        attendanceService
            .getTimeline(employeeId, {
                startDate: toISO(year, month, 1),
                endDate: toISO(year, month, daysInMonth),
            })
            .then((data) => {
                if (!cancelled) setDays(Array.isArray(data?.days) ? data.days : []);
            })
            .catch(() => { if (!cancelled) setDays([]); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [employeeId, year, month, daysInMonth]);

    const byDate = useMemo(() => {
        const map = new Map();
        days.forEach((d) => map.set(d.date, d));
        return map;
    }, [days]);

    const goto = (delta) => {
        setCursor((c) => {
            const d = new Date(c.year, c.month + delta, 1);
            return { year: d.getFullYear(), month: d.getMonth() };
        });
    };

    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
    const monthLabel = firstDay.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    const cells = [
        ...Array.from({ length: leadingBlanks }, () => null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    const formatReadableDate = (isoStr) => {
        if (!isoStr) return '';
        const d = new Date(`${isoStr}T00:00:00`);
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div ref={containerRef} className="relative select-none">
            {/* Header / Month Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => goto(-1)}
                        className="p-2 border border-border rounded-xl hover:bg-muted/80 text-muted-foreground transition-all shadow-sm"
                        title="Previous Month"
                    >
                        <Icon name="ChevronLeft" size={16} />
                    </button>
                    <span className="text-sm font-bold text-foreground min-w-[140px] text-center">{monthLabel}</span>
                    <button
                        onClick={() => goto(1)}
                        disabled={isCurrentMonth}
                        className="p-2 border border-border rounded-xl hover:bg-muted/80 text-muted-foreground disabled:opacity-40 transition-all shadow-sm"
                        title="Next Month"
                    >
                        <Icon name="ChevronRight" size={16} />
                    </button>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                    {LEGEND.map((l) => (
                        <span key={l.type} className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/80">
                            <span className={`w-2.5 h-2.5 rounded-sm border ${DAY_STYLE[l.type]}`} /> {l.label}
                        </span>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                    <Icon name="Loader" size={28} className="animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground font-medium">Loading calendar timeline...</span>
                </div>
            ) : (
                <>
                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                        {WEEKDAYS.map((w) => (
                            <div key={w} className="text-center text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide py-1">
                                {w}
                            </div>
                        ))}
                    </div>

                    {/* Month grid */}
                    <div className="grid grid-cols-7 gap-1.5 relative">
                        {cells.map((day, idx) => {
                            if (day === null) return <div key={`b${idx}`} className="aspect-square" />;
                            const iso = toISO(year, month, day);
                            const info = byDate.get(iso);
                            const type = info?.type || 'upcoming';
                            const style = DAY_STYLE[type] || DAY_STYLE.upcoming;

                            const isHoliday = !!info?.holiday;
                            const isHalfDayPolicy = info?.saturdayInfo?.policy === 'half_day';

                            return (
                                <div
                                    key={iso}
                                    onMouseEnter={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const containerRect = containerRef.current?.getBoundingClientRect() || { top: 0, left: 0 };
                                        setHoveredCell({
                                            day,
                                            iso,
                                            info,
                                            type,
                                            x: rect.left - containerRect.left + rect.width / 2,
                                            y: rect.top - containerRect.top,
                                        });
                                    }}
                                    onMouseLeave={() => setHoveredCell(null)}
                                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative cursor-pointer transition-all duration-200 transform hover:scale-[1.07] hover:shadow-md hover:z-20 ${style} ${
                                        info?.isToday ? 'ring-2 ring-primary ring-offset-2 font-black' : ''
                                    }`}
                                >
                                    <span className="text-sm font-bold leading-none">{day}</span>

                                    {/* Sub-label: Check-in time or Holiday / Half-day indicator */}
                                    {info?.checkInTime ? (
                                        <span className="text-[8px] font-semibold mt-1 opacity-90 tracking-tight">
                                            {String(info.checkInTime).slice(0, 5)}
                                        </span>
                                    ) : isHoliday ? (
                                        <span className="text-[7.5px] font-bold mt-1 text-purple-700 tracking-tighter truncate max-w-[90%] text-center">
                                            {info.holiday.name}
                                        </span>
                                    ) : isHalfDayPolicy ? (
                                        <span className="text-[7.5px] font-bold mt-1 text-orange-700 tracking-tighter">
                                            Half Day
                                        </span>
                                    ) : null}

                                    {/* Icons badges */}
                                    {info?.isWfh && (
                                        <span className="absolute top-1 right-1 text-indigo-600" title="Work From Home">
                                            <Icon name="Home" size={9} />
                                        </span>
                                    )}
                                    {isHoliday && (
                                        <span className="absolute top-1 left-1 text-purple-600" title={`Holiday: ${info.holiday.name}`}>
                                            <Icon name="Sparkles" size={9} />
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Rich Floating Popover Card on Hover */}
                    {hoveredCell && (
                        <div
                            className="absolute z-50 pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full mb-2 w-72"
                            style={{
                                left: `${hoveredCell.x}px`,
                                top: `${hoveredCell.y - 8}px`,
                            }}
                        >
                            <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl backdrop-blur-md border border-slate-700/80 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-150">
                                {/* Top Header: Date & Status Badge */}
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                    <span className="font-bold text-slate-100 text-[11px]">
                                        {formatReadableDate(hoveredCell.iso)}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                        hoveredCell.type === 'present' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                        hoveredCell.type === 'late' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                        hoveredCell.type === 'half-day' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                                        hoveredCell.type === 'wfh' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                                        hoveredCell.type === 'holiday' || hoveredCell.type === 'holiday_half' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                                        hoveredCell.type === 'leave' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                        hoveredCell.type === 'weekend' ? 'bg-slate-700/40 text-slate-400 border border-slate-600' :
                                        hoveredCell.type === 'upcoming' ? 'bg-slate-800 text-slate-400' :
                                        'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    }`}>
                                        {hoveredCell.info?.policyLabel || hoveredCell.type.replace('_', ' ')}
                                    </span>
                                </div>

                                {/* Punch Information */}
                                {(hoveredCell.info?.checkInTime || hoveredCell.info?.checkOutTime) ? (
                                    <div className="space-y-1.5 pt-0.5">
                                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                                            <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/50">
                                                <span className="text-slate-400 block text-[9px]">Check In</span>
                                                <span className="text-emerald-400 font-bold">
                                                    {hoveredCell.info.checkInTime || '---'}
                                                </span>
                                            </div>
                                            <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/50">
                                                <span className="text-slate-400 block text-[9px]">Check Out</span>
                                                <span className="text-blue-400 font-bold">
                                                    {hoveredCell.info.checkOutTime || 'Not Out Yet'}
                                                </span>
                                            </div>
                                        </div>
                                        {hoveredCell.info?.workHours != null && (
                                            <div className="flex justify-between text-[10px] text-slate-300 pt-1 border-t border-slate-800/60">
                                                <span>Work Duration:</span>
                                                <span className="font-semibold text-slate-100">{hoveredCell.info.workHours} hrs</span>
                                            </div>
                                        )}
                                        {hoveredCell.info?.overtime > 0 && (
                                            <div className="flex justify-between text-[10px] text-emerald-400 font-semibold">
                                                <span>Overtime:</span>
                                                <span>+{hoveredCell.info.overtime} hrs</span>
                                            </div>
                                        )}
                                    </div>
                                ) : null}

                                {/* Leave details if on leave */}
                                {hoveredCell.info?.leave && (
                                    <div className="bg-rose-950/40 border border-rose-800/40 rounded-xl p-2 text-[10px] space-y-1">
                                        <div className="flex justify-between items-center text-rose-300 font-bold capitalize">
                                            <span>{hoveredCell.info.leave.type} Leave</span>
                                            <span className="text-[9px] px-1.5 py-0.2 bg-rose-500/20 rounded">Approved</span>
                                        </div>
                                        <p className="text-slate-300 italic line-clamp-2">
                                            "{hoveredCell.info.leave.reason || 'No reason provided'}"
                                        </p>
                                        {hoveredCell.info.leave.adminComment && (
                                            <p className="text-[9px] text-slate-400 border-t border-rose-900/40 pt-1">
                                                Note: {hoveredCell.info.leave.adminComment}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Holiday / Festival info if holiday */}
                                {hoveredCell.info?.holiday && (
                                    <div className="bg-purple-950/40 border border-purple-800/40 rounded-xl p-2 text-[10px] space-y-1">
                                        <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                                            <Icon name="Sparkles" size={12} className="text-purple-400" />
                                            <span>{hoveredCell.info.holiday.name}</span>
                                        </div>
                                        <p className="text-slate-300 text-[9px]">
                                            {hoveredCell.info.holiday.type === 'half' ? 'Half Day Festival / Celebration' : 'Official Paid Company Holiday'}
                                        </p>
                                        {hoveredCell.info.holiday.description && (
                                            <p className="text-[9px] text-slate-400 italic">
                                                {hoveredCell.info.holiday.description}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Saturday Office Policy note */}
                                {hoveredCell.info?.saturdayInfo && (
                                    <div className="text-[9px] text-amber-300/90 flex items-center gap-1">
                                        <Icon name="Info" size={10} />
                                        <span>
                                            {hoveredCell.info.saturdayInfo.isSecondSaturday ? 'Office Rule: 2nd Saturday is Half Day' :
                                             hoveredCell.info.saturdayInfo.policy === 'half_day' ? 'Office Rule: Saturday Half Day' :
                                             'Saturday Office Schedule'}
                                        </span>
                                    </div>
                                )}

                                {/* WFH request details if any */}
                                {hoveredCell.info?.wfh?.reason && (
                                    <div className="text-[9px] text-indigo-300/90 pt-1 border-t border-slate-800 flex items-start gap-1">
                                        <Icon name="Home" size={10} className="mt-0.5 flex-shrink-0" />
                                        <span>WFH: "{hoveredCell.info.wfh.reason}"</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AttendanceCalendar;
