import React from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const AttendanceFilters = ({ filters, onFilterChange, attendanceData }) => {
  const departments = [...new Set(attendanceData?.map(emp => emp?.department)?.filter(Boolean))];
  const locations = [...new Set(attendanceData?.map(emp => emp?.location)?.filter(Boolean))];

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'present', label: 'Present' },
    { value: 'absent', label: 'Absent' },
    { value: 'late', label: 'Late' },
    { value: 'early_departure', label: 'Early Departure' }
  ];

  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    ...departments?.map(dept => ({ value: dept, label: dept }))
  ];

  const locationOptions = [
    { value: 'all', label: 'All Locations' },
    ...locations?.map(loc => ({ value: loc, label: loc }))
  ];

  const handleReset = () => {
    onFilterChange({
      dateRange: 'today',
      department: 'all',
      status: 'all',
      location: 'all',
      search: ''
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
        <h3 className="text-sm font-bold text-foreground tracking-tight">Filters</h3>
        <button
          onClick={handleReset}
          className="flex items-center space-x-1.5 text-xs font-bold text-muted-foreground/70 hover:text-primary transition-all"
        >
          <Icon name="RotateCcw" size={14} />
          <span>Reset All</span>
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide ml-1">
            Search Employee
          </label>
          <div className="relative group">
            <Icon name="Search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={filters?.search || ''}
              onChange={(e) => onFilterChange({ search: e?.target?.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-muted/60 border border-border text-sm font-medium rounded-xl focus:ring-2 focus:ring-ring/20 focus:border-blue-400 outline-none transition-all"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide ml-1">
            Time Period
          </label>
          <select
            value={filters?.dateRange}
            onChange={(e) => onFilterChange({ dateRange: e.target.value })}
            className="w-full px-4 py-2.5 bg-muted/60 border border-border text-sm font-semibold rounded-xl focus:ring-2 focus:ring-ring/20 focus:border-blue-400 outline-none transition-all appearance-none cursor-pointer"
          >
            {dateRangeOptions?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Date Range */}
        {filters?.dateRange === 'custom' && (
          <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground/70 uppercase ml-1">From</label>
              <input
                type="date"
                value={filters?.fromDate || ''}
                onChange={(e) => onFilterChange({ fromDate: e?.target?.value })}
                className="w-full px-4 py-2.5 bg-muted/60 border border-border text-sm font-medium rounded-xl focus:ring-2 focus:ring-ring/20 focus:border-blue-400 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground/70 uppercase ml-1">To</label>
              <input
                type="date"
                value={filters?.toDate || ''}
                onChange={(e) => onFilterChange({ toDate: e?.target?.value })}
                className="w-full px-4 py-2.5 bg-muted/60 border border-border text-sm font-medium rounded-xl focus:ring-2 focus:ring-ring/20 focus:border-blue-400 outline-none transition-all"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {/* Department */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide ml-1">
              Department
            </label>
            <select
              value={filters?.department}
              onChange={(e) => onFilterChange({ department: e.target.value })}
              className="w-full px-4 py-2.5 bg-muted/60 border border-border text-sm font-semibold rounded-xl focus:ring-2 focus:ring-ring/20 focus:border-blue-400 outline-none transition-all cursor-pointer"
            >
              {departmentOptions?.map(option => (
                <option key={option?.value} value={option?.value}>
                  {option?.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide ml-1">
              Status
            </label>
            <select
              value={filters?.status}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              className="w-full px-4 py-2.5 bg-muted/60 border border-border text-sm font-semibold rounded-xl focus:ring-2 focus:ring-ring/20 focus:border-blue-400 outline-none transition-all cursor-pointer"
            >
              {statusOptions?.map(option => (
                <option key={option?.value} value={option?.value}>
                  {option?.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="space-y-3 pt-4 border-t border-slate-50">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide ml-1">
            Quick Actions
          </label>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onFilterChange({ status: 'late' })}
              className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 rounded-xl hover:bg-amber-100 transition-all shadow-sm"
            >
              <span>Late Arrivals</span>
              <Icon name="Clock" size={14} />
            </button>

            <button
              onClick={() => onFilterChange({ status: 'absent' })}
              className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100 rounded-xl hover:bg-rose-100 transition-all shadow-sm"
            >
              <span>Absent Today</span>
              <Icon name="UserX" size={14} />
            </button>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(filters?.department !== 'all' || filters?.status !== 'all' || filters?.location !== 'all' || (filters?.search && filters.search.length > 0)) && (
          <div className="pt-4 animate-in fade-in duration-300">
            <div className="flex flex-wrap gap-2">
              {filters?.department !== 'all' && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold border border-border">
                  <span>{filters?.department}</span>
                  <button onClick={() => onFilterChange({ department: 'all' })} className="hover:text-blue-800"><Icon name="X" size={12} /></button>
                </span>
              )}
              {filters?.status !== 'all' && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold border border-border">
                  <span>{filters?.status}</span>
                  <button onClick={() => onFilterChange({ status: 'all' })} className="hover:text-blue-800"><Icon name="X" size={12} /></button>
                </span>
              )}
              {filters?.search && filters.search.length > 0 && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold border border-border">
                  <span className="truncate max-w-[100px]">"{filters?.search}"</span>
                  <button onClick={() => onFilterChange({ search: '' })} className="hover:text-blue-800"><Icon name="X" size={12} /></button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceFilters;