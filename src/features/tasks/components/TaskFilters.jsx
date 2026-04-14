import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const TaskFilters = ({ onFiltersChange, totalTasks, filteredTasks }) => {
  const [filters, setFilters] = useState({
    search: '',
    priority: '',
    status: '',
    assignee: '',
    department: '',
    dateRange: ''
  });

  const priorityOptions = [
    { value: '', label: 'ALL_PRIORITIES' },
    { value: 'high', label: 'HIGH_PRIORITY' },
    { value: 'medium', label: 'MEDIUM_PRIORITY' },
    { value: 'low', label: 'LOW_PRIORITY' }
  ];

  const statusOptions = [
    { value: '', label: 'ALL_STATUS' },
    { value: 'pending', label: 'PENDING' },
    { value: 'in-progress', label: 'IN_PROGRESS' },
    { value: 'completed', label: 'COMPLETED' },
    { value: 'overdue', label: 'OVERDUE' }
  ];

  const departmentOptions = [
    { value: '', label: 'ALL_DEPARTMENTS' },
    { value: 'engineering', label: 'ENGINEERING' },
    { value: 'marketing', label: 'MARKETING' },
    { value: 'sales', label: 'SALES' },
    { value: 'hr', label: 'HUMAN_RESOURCES' },
    { value: 'finance', label: 'FINANCE' }
  ];

  const dateRangeOptions = [
    { value: '', label: 'ALL_TIME' },
    { value: 'today', label: 'TODAY' },
    { value: 'week', label: 'THIS_WEEK' },
    { value: 'month', label: 'THIS_MONTH' },
    { value: 'overdue', label: 'OVERDUE_ONLY' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      search: '',
      priority: '',
      status: '',
      assignee: '',
      department: '',
      dateRange: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters)?.some(value => value !== '');

  return (
    <div className="bg-white border-2 border-slate-900 rounded-none mb-12 shadow-[8px_8px_0px_rgba(15,23,42,0.1)]">
      <div className="flex items-center justify-between p-4 border-b-2 border-slate-900 bg-slate-50">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-slate-900 text-white">
            <Icon name="Filter" size={16} />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 leading-none">
              Diagnostic_Control
            </h3>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Telemetry: {filteredTasks} / {totalTasks} Records Manifested
            </div>
          </div>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-3 py-1.5 border-2 border-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2"
          >
            <Icon name="X" size={12} strokeWidth={3} />
            Purge Filters
          </button>
        )}
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Vector_Search</label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
              <Icon name="Search" size={14} />
            </div>
            <input
              type="text"
              placeholder="IDENTIFY_TASKS..."
              value={filters?.search}
              onChange={(e) => handleFilterChange('search', e?.target?.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-slate-900 focus:bg-white outline-none text-xs font-bold transition-all rounded-none placeholder:text-slate-300"
            />
          </div>
        </div>

        <FilterDropdown 
          label="Priority_Level"
          value={filters?.priority}
          options={priorityOptions}
          onChange={(v) => handleFilterChange('priority', v)}
        />

        <FilterDropdown 
          label="Operational_Status"
          value={filters?.status}
          options={statusOptions}
          onChange={(v) => handleFilterChange('status', v)}
        />

        <FilterDropdown 
          label="Department_Module"
          value={filters?.department}
          options={departmentOptions}
          onChange={(v) => handleFilterChange('department', v)}
        />

        <FilterDropdown 
          label="Temporal_Window"
          value={filters?.dateRange}
          options={dateRangeOptions}
          onChange={(v) => handleFilterChange('dateRange', v)}
        />
      </div>

      {hasActiveFilters && (
        <div className="px-6 py-4 border-t border-slate-100 flex flex-wrap gap-2 items-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2">Active_Sequences:</span>
            {Object.entries(filters)?.map(([key, value]) => {
              if (!value) return null;
              return (
                <div
                  key={key}
                  className="flex items-center gap-2 px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest"
                >
                  <span>{key}::{value}</span>
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    className="hover:text-red-400 transition-colors"
                  >
                    <Icon name="X" size={12} strokeWidth={3} />
                  </button>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

const FilterDropdown = ({ label, value, options, onChange }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-slate-900 focus:bg-white outline-none text-xs font-bold transition-all rounded-none appearance-none cursor-pointer"
      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value} className="font-bold py-2">{opt.label}</option>
      ))}
    </select>
  </div>
);

export default TaskFilters;