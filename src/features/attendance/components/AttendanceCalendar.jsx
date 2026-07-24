import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import { attendanceService } from '../../../services/attendance.service';

/**
 * Month-grid attendance view for one employee — an alternative to the day-by-day
 * timeline. Each calendar cell is colour-coded by its status so a whole month
 * reads at a glance. Data comes from the same timeline endpoint the list uses.
 */

const DAY_STYLE = {
    present: 'bg-success/15 text-success border-success/30',
    late: 'bg-warning/15 text-warning border-warning/30',
    early_checkin: 'bg-primary/10 text-primary border-primary/25',
    early_departure: 'bg-warning/15 text-warning border-warning/30',
    'half-day': 'bg-warning/15 text-warning border-warning/30',
    wfh: 'bg-primary/10 text-primary border-primary/25',
    leave: 'bg-error/10 text-error border-error/25',
    absent: 'bg-error/10 text-error border-error/25',
    weekend: 'bg-muted text-muted-foreground border-border',
    upcoming: 'bg-card text-muted-foreground/40 border-border/60',
};

const LEGEND = [
    { type: 'present', label: 'Present' },
    { type: 'late', label: 'Late' },
    { type: 'wfh', label: 'WFH' },
    { type: 'leave', label: 'Leave' },
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

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <button onClick={() => goto(-1)} className="p-2 border border-border rounded-lg hover:bg-muted/60 text-muted-foreground"><Icon name="ChevronLeft" size={16} /></button>
                    <span className="text-sm font-bold text-foreground min-w-[140px] text-center">{monthLabel}</span>
                    <button onClick={() => goto(1)} disabled={isCurrentMonth} className="p-2 border border-border rounded-lg hover:bg-muted/60 text-muted-foreground disabled:opacity-40"><Icon name="ChevronRight" size={16} /></button>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                    {LEGEND.map((l) => (
                        <span key={l.type} className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground/70">
                            <span className={`w-2.5 h-2.5 rounded-sm border ${DAY_STYLE[l.type]}`} /> {l.label}
                        </span>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16"><Icon name="Loader" size={28} className="animate-spin text-primary" /></div>
            ) : (
                <>
                    <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                        {WEEKDAYS.map((w) => (
                            <div key={w} className="text-center text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide py-1">{w}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                        {cells.map((day, idx) => {
                            if (day === null) return <div key={`b${idx}`} />;
                            const iso = toISO(year, month, day);
                            const info = byDate.get(iso);
                            const type = info?.type || 'upcoming';
                            const style = DAY_STYLE[type] || DAY_STYLE.upcoming;
                            const label = info?.leave?.type ? `${info.leave.type} leave`
                                : type === 'wfh' ? 'Work from home'
                                : type.replace('_', ' ');
                            return (
                                <div
                                    key={iso}
                                    title={`${iso} · ${label}`}
                                    className={`aspect-square rounded-lg border flex flex-col items-center justify-center relative ${style} ${info?.isToday ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                                >
                                    <span className="text-sm font-bold leading-none">{day}</span>
                                    {info?.checkInTime && (
                                        <span className="text-[8px] font-medium mt-1 opacity-80">{String(info.checkInTime).slice(0, 5)}</span>
                                    )}
                                    {info?.isWfh && <span className="absolute top-1 right-1"><Icon name="Home" size={9} /></span>}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default AttendanceCalendar;
