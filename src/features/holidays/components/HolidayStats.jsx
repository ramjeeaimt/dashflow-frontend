import React from 'react';
import { Calendar, Sparkles, Clock, PartyPopper, CheckCircle2 } from 'lucide-react';

const HolidayStats = ({ holidays = [], selectedYear }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const yearHolidays = holidays.filter((h) => h.date && h.date.startsWith(`${selectedYear}-`));
  const totalCount = yearHolidays.length;

  const fullDayCount = yearHolidays.filter((h) => h.type !== 'half').length;
  const halfDayCount = yearHolidays.filter((h) => h.type === 'half').length;

  const upcomingHolidays = yearHolidays
    .filter((h) => h.date >= todayStr)
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  const nextHoliday = upcomingHolidays[0] || null;

  const getDaysUntil = (targetDate) => {
    const today = new Date(todayStr + 'T00:00:00');
    const target = new Date(targetDate + 'T00:00:00');
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today! 🎉';
    if (diffDays === 1) return 'Tomorrow! ✨';
    return `In ${diffDays} days`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Next Upcoming Holiday Highlight Card */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-200/60 dark:border-indigo-800/40 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <PartyPopper className="w-4 h-4" />
            Next Holiday
          </span>
          {nextHoliday && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500 text-white shadow-xs">
              {getDaysUntil(nextHoliday.date)}
            </span>
          )}
        </div>
        {nextHoliday ? (
          <div>
            <h3 className="text-lg font-bold text-foreground truncate" title={nextHoliday.name}>
              {nextHoliday.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(nextHoliday.date + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
              {' • '}
              <span className="font-medium text-foreground">
                {nextHoliday.type === 'half' ? 'Half-Day' : 'Full-Day Paid'}
              </span>
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-muted-foreground">No upcoming holidays this year</p>
            <p className="text-xs text-muted-foreground/80 mt-0.5">All declared holidays have passed</p>
          </div>
        )}
      </div>

      {/* Total Holidays */}
      <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between shadow-xs">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Total Holidays ({selectedYear})</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-data text-foreground">{totalCount}</span>
            <span className="text-xs text-muted-foreground">declared days</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {upcomingHolidays.length} upcoming • {totalCount - upcomingHolidays.length} passed
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Calendar className="w-6 h-6" />
        </div>
      </div>

      {/* Full-Day Paid Holidays */}
      <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between shadow-xs">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Full Day Off</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-data text-emerald-600 dark:text-emerald-400">
              {fullDayCount}
            </span>
            <span className="text-xs text-muted-foreground">paid days</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">100% full company holiday credit</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      {/* Half-Day Festival Holidays */}
      <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between shadow-xs">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Half-Day Celebrations</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-data text-amber-600 dark:text-amber-400">
              {halfDayCount}
            </span>
            <span className="text-xs text-muted-foreground">festival days</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Special celebration / optional half days</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <Sparkles className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default HolidayStats;

