import React, { useState, useMemo } from 'react';
import { Search, Filter, Sparkles, Edit2, Trash2, Calendar, Clock, PartyPopper } from 'lucide-react';

const HolidayListView = ({
  holidays = [],
  selectedYear = new Date().getFullYear(),
  isAdmin = false,
  onEditHoliday,
  onDeleteHoliday,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState('ALL'); // 'ALL' | 'UPCOMING' | 'PAST'
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Available categories
  const categories = useMemo(() => {
    const set = new Set();
    holidays.forEach((h) => {
      if (h.category) set.add(h.category);
    });
    return Array.from(set);
  }, [holidays]);

  // Filtered holidays for selected year
  const filteredHolidays = useMemo(() => {
    return holidays
      .filter((h) => {
        if (!h.date) return false;

        // Custom Date Range filter
        if (rangeFrom && h.date < rangeFrom) return false;
        if (rangeTo && h.date > rangeTo) return false;

        // If no custom range is picked, check year match
        if (!rangeFrom && !rangeTo) {
          const isYear = h.date.startsWith(`${selectedYear}-`);
          if (!isYear) return false;
        }

        // Search match
        if (searchTerm) {
          const query = searchTerm.toLowerCase();
          const matchName = h.name?.toLowerCase().includes(query);
          const matchDesc = h.description?.toLowerCase().includes(query);
          const matchCat = h.category?.toLowerCase().includes(query);
          if (!matchName && !matchDesc && !matchCat) return false;
        }

        // Category match
        if (selectedCategory !== 'ALL' && h.category !== selectedCategory) {
          return false;
        }

        // Type match
        if (selectedType === 'FULL' && h.type === 'half') return false;
        if (selectedType === 'HALF' && h.type !== 'half') return false;

        // Timeframe match
        if (timeFilter === 'UPCOMING' && h.date < todayStr) return false;
        if (timeFilter === 'PAST' && h.date >= todayStr) return false;

        return true;
      })
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [holidays, selectedYear, searchTerm, selectedCategory, selectedType, timeFilter, rangeFrom, rangeTo, todayStr]);

  // Group by Month
  const groupedByMonth = useMemo(() => {
    const groups = {};
    filteredHolidays.forEach((h) => {
      const date = new Date(h.date + 'T00:00:00');
      const monthKey = isNaN(date.getTime())
        ? 'Other'
        : date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(h);
    });
    return groups;
  }, [filteredHolidays]);

  const getRelativeBadge = (dateStr) => {
    const today = new Date(todayStr + 'T00:00:00');
    const target = new Date(dateStr + 'T00:00:00');
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));

    if (diff < 0) {
      return (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          Passed
        </span>
      );
    }
    if (diff === 0) {
      return (
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
          Today! 🎉
        </span>
      );
    }
    if (diff === 1) {
      return (
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500 text-white shadow-xs">
          Tomorrow
        </span>
      );
    }
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
        In {diff} days
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search holidays, festivals, or keywords..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe pill selector */}
          <div className="flex items-center rounded-xl border border-border bg-background p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setTimeFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                timeFilter === 'ALL' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('UPCOMING')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                timeFilter === 'UPCOMING' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('PAST')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                timeFilter === 'PAST' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Past
            </button>
          </div>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs bg-background border border-border rounded-xl px-2.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Types</option>
            <option value="FULL">Full Day Paid</option>
            <option value="HALF">Half Day</option>
          </select>

          {/* Category filter */}
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-background border border-border rounded-xl px-2.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          {/* Custom Date Range Filter */}
          <div className="flex items-center gap-1.5 text-xs bg-background border border-border rounded-xl px-2.5 py-1">
            <span className="text-[11px] text-muted-foreground font-medium">Range:</span>
            <input
              type="date"
              value={rangeFrom}
              onChange={(e) => setRangeFrom(e.target.value)}
              className="text-xs bg-transparent text-foreground focus:outline-none cursor-pointer"
              title="From Date"
            />
            <span className="text-muted-foreground">–</span>
            <input
              type="date"
              value={rangeTo}
              onChange={(e) => setRangeTo(e.target.value)}
              className="text-xs bg-transparent text-foreground focus:outline-none cursor-pointer"
              title="To Date"
            />
            {(rangeFrom || rangeTo) && (
              <button
                type="button"
                onClick={() => { setRangeFrom(''); setRangeTo(''); }}
                className="text-[11px] text-muted-foreground hover:text-foreground font-bold px-1"
                title="Clear custom range"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Holiday List Grouped by Month */}
      {Object.keys(groupedByMonth).length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground mx-auto flex items-center justify-center mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No holidays found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {searchTerm || selectedCategory !== 'ALL' || selectedType !== 'ALL' || timeFilter !== 'ALL'
              ? 'Try adjusting your search or filters to see more results.'
              : `No holidays have been declared for ${selectedYear} yet.`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByMonth).map(([monthTitle, items]) => (
            <div key={monthTitle} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {monthTitle}
                </span>
                <div className="h-px flex-1 bg-border/60" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  {items.length} {items.length === 1 ? 'holiday' : 'holidays'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((holiday) => {
                  const dateObj = new Date(holiday.date + 'T00:00:00');
                  const dayNum = dateObj.getDate();
                  const monthShort = dateObj.toLocaleDateString('en-US', { month: 'short' });
                  const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

                  return (
                    <div
                      key={holiday.id || holiday.date}
                      className="bg-card border border-border hover:border-primary/40 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all flex items-start gap-3.5 group relative"
                    >
                      {/* Date Badge */}
                      <div className="shrink-0 w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-bold uppercase text-primary tracking-wider">
                          {monthShort}
                        </span>
                        <span className="text-lg font-black font-data text-foreground leading-none">
                          {dayNum}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-foreground truncate" title={holiday.name}>
                            {holiday.name}
                          </h4>
                          {getRelativeBadge(holiday.date)}
                        </div>

                        <p className="text-xs text-muted-foreground mt-0.5">{weekday}</p>

                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              holiday.type === 'half'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            }`}
                          >
                            {holiday.type === 'half' ? 'Half-Day Festival' : 'Full Day Paid'}
                          </span>

                          {holiday.category && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {holiday.category}
                            </span>
                          )}
                        </div>

                        {holiday.description && (
                          <p className="text-xs text-muted-foreground/90 mt-2 line-clamp-2">
                            {holiday.description}
                          </p>
                        )}
                      </div>

                      {/* Admin Edit/Delete Actions */}
                      {isAdmin && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-start">
                          <button
                            type="button"
                            onClick={() => onEditHoliday && onEditHoliday(holiday)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit holiday"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteHoliday && onDeleteHoliday(holiday)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="Delete holiday"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HolidayListView;

