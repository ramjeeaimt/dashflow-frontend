import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Plus, Edit2, Trash2, Info, Calendar as CalendarIcon } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HolidayMonthCalendar = ({
  holidays = [],
  selectedYear = new Date().getFullYear(),
  isAdmin = false,
  onAddHoliday,
  onEditHoliday,
  onDeleteHoliday,
}) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [currentMonth, setCurrentMonth] = useState(() => {
    // Default to today's month if within selectedYear, else January
    return today.getFullYear() === selectedYear ? today.getMonth() : 0;
  });

  const [selectedDayInfo, setSelectedDayInfo] = useState(null);

  // Generate calendar grid dates for currentMonth in selectedYear
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(selectedYear, currentMonth, 1);
    const lastDayOfMonth = new Date(selectedYear, currentMonth + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    const days = [];

    // Days from previous month
    const prevMonthLastDay = new Date(selectedYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? selectedYear - 1 : selectedYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum,
        isCurrentMonth: false,
        isWeekend: (days.length % 7 === 0 || days.length % 7 === 6),
      });
    }

    // Days in current month
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${selectedYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = (startingDayOfWeek + d - 1) % 7;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }

    // Fill remaining cells for 6-row or 5-row grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? selectedYear + 1 : selectedYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: false,
        isWeekend: (days.length % 7 === 0 || days.length % 7 === 6),
      });
    }

    return days;
  }, [selectedYear, currentMonth]);

  // Index holidays by date
  const holidayMap = useMemo(() => {
    const map = new Map();
    holidays.forEach((h) => {
      if (h.date) map.set(h.date, h);
    });
    return map;
  }, [holidays]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentMonth(today.getMonth());
  };

  // Get color styles for holiday tags
  const getHolidayStyle = (holiday) => {
    if (holiday.type === 'half') {
      return {
        bg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300/60 dark:border-amber-700/50',
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
        dot: 'bg-amber-500',
      };
    }
    const cat = (holiday.category || '').toLowerCase();
    if (cat.includes('national')) {
      return {
        bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-700/50',
        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
        dot: 'bg-emerald-500',
      };
    }
    if (cat.includes('religious') || cat.includes('festival')) {
      return {
        bg: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-300/60 dark:border-purple-700/50',
        badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
        dot: 'bg-purple-500',
      };
    }
    return {
      bg: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-300/60 dark:border-indigo-700/50',
      badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
      dot: 'bg-indigo-500',
    };
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
      {/* Calendar Header Navigation */}
      <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {MONTH_NAMES[currentMonth]} {selectedYear}
            </h2>
            <p className="text-xs text-muted-foreground">
              {holidays.filter((h) => h.date && h.date.startsWith(`${selectedYear}-${String(currentMonth + 1).padStart(2, '0')}`)).length} holidays this month
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
          >
            Today
          </button>

          <div className="flex items-center rounded-lg border border-border overflow-hidden bg-background">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-muted text-foreground transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-border" />
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-muted text-foreground transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
            className="text-xs font-medium bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center">
        {DAYS_OF_WEEK.map((day, idx) => (
          <div
            key={day}
            className={`py-2 text-[11px] font-bold uppercase tracking-wider ${
              idx === 0 || idx === 6 ? 'text-muted-foreground/70' : 'text-foreground'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-border/60">
        {calendarDays.map((cell, index) => {
          const holiday = holidayMap.get(cell.dateStr);
          const isToday = cell.dateStr === todayStr;
          const styles = holiday ? getHolidayStyle(holiday) : null;

          return (
            <div
              key={cell.dateStr + index}
              onClick={() => {
                if (holiday) {
                  setSelectedDayInfo({ ...holiday, fullDateStr: cell.dateStr });
                } else if (isAdmin && cell.isCurrentMonth) {
                  onAddHoliday && onAddHoliday(cell.dateStr);
                }
              }}
              className={`min-h-[96px] sm:min-h-[115px] p-2 flex flex-col justify-between transition-colors relative group ${
                !cell.isCurrentMonth
                  ? 'bg-muted/20 opacity-40'
                  : cell.isWeekend
                  ? 'bg-muted/10'
                  : 'bg-card'
              } ${holiday ? 'cursor-pointer hover:bg-primary/5' : isAdmin && cell.isCurrentMonth ? 'cursor-pointer hover:bg-muted/30' : ''}`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : holiday
                      ? 'text-foreground font-extrabold'
                      : cell.isCurrentMonth
                      ? 'text-foreground/80'
                      : 'text-muted-foreground'
                  }`}
                >
                  {cell.dayNum}
                </span>

                {/* Admin Quick Add Hover Button */}
                {isAdmin && cell.isCurrentMonth && !holiday && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddHoliday && onAddHoliday(cell.dateStr);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-primary/10 text-primary text-xs"
                    title={`Add holiday on ${cell.dateStr}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Holiday Entry */}
              {holiday ? (
                <div
                  className={`mt-1 p-1.5 rounded-lg border text-xs font-semibold flex flex-col gap-0.5 shadow-2xs relative group/item ${styles.bg}`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-[11px] font-bold" title={holiday.name}>
                      {holiday.name}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded font-medium uppercase tracking-tight ${styles.badge}`}
                      >
                        {holiday.type === 'half' ? 'Half' : 'Full'}
                      </span>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteHoliday && onDeleteHoliday(holiday);
                          }}
                          className="opacity-0 group-hover:opacity-100 group-hover/item:opacity-100 hover:bg-destructive/15 text-muted-foreground hover:text-destructive p-0.5 rounded transition-all"
                          title={`Remove ${holiday.name}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  {holiday.category && (
                    <span className="text-[10px] opacity-80 truncate">{holiday.category}</span>
                  )}
                </div>
              ) : (
                <div />
              )}

              {/* Weekend marker */}
              {cell.isWeekend && !holiday && cell.isCurrentMonth && (
                <span className="text-[10px] text-muted-foreground/50 self-end font-medium">
                  {cell.dayNum % 7 === 0 ? 'Weekend' : ''}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Day Details Card / Popover Modal */}
      {selectedDayInfo && (
        <div className="p-4 bg-muted/30 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-foreground">{selectedDayInfo.name}</h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                  {selectedDayInfo.type === 'half' ? 'Half-Day Festival' : 'Full Day Paid Holiday'}
                </span>
                {selectedDayInfo.category && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {selectedDayInfo.category}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(selectedDayInfo.date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                {selectedDayInfo.description ? ` • ${selectedDayInfo.description}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const info = selectedDayInfo;
                    setSelectedDayInfo(null);
                    onEditHoliday && onEditHoliday(info);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-card text-foreground transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const info = selectedDayInfo;
                    setSelectedDayInfo(null);
                    onDeleteHoliday && onDeleteHoliday(info);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-destructive/30 hover:bg-destructive/10 text-destructive transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setSelectedDayInfo(null)}
              className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidayMonthCalendar;

