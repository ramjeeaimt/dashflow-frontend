import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const EmployeeFilters = ({ 
  searchTerm, 
  onSearchChange, 
  filters,  
  onFilterChange, 
  onClearFilters,
  resultCount 
}) => {



  const departmentOptions = [
    { value: '', label: 'All Departments' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'finance', label: 'Finance' },
    { value: 'operations', label: 'Operations' },
    { value: 'design', label: 'Design' },
    { value: 'support', label: 'Customer Support' }
  ];

  const branchOptions = [
    { value: '', label: 'All Branches' },
    { value: 'headquarters', label: 'Headquarters' },
    { value: 'new-york', label: 'New York Office' },
    { value: 'san-francisco', label: 'San Francisco Office' },
    { value: 'london', label: 'London Office' },
    { value: 'singapore', label: 'Singapore Office' },
    { value: 'remote', label: 'Remote' }
  ];

  const employmentTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'intern', label: 'Intern' },
    { value: 'consultant', label: 'Consultant' }
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'terminated', label: 'Terminated' }
  ];

  const hasActiveFilters = filters?.department || filters?.branch || filters?.employmentType || filters?.status;

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Search Block */}
        <div className="lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/20">
          <label className="text-xs font-semibold text-slate-500 mb-2 block">Search Employees</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e?.target?.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-medium placeholder:text-slate-400"
            />
            <Icon 
              name="Search" 
              size={18} 
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" 
            />
          </div>
        </div>

        {/* Filters Block */}
        <div className="lg:col-span-8 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Department', value: filters?.department, options: departmentOptions, key: 'department' },
              { label: 'Branch', value: filters?.branch, options: branchOptions, key: 'branch' },
              { label: 'Job Type', value: filters?.employmentType, options: employmentTypeOptions, key: 'employmentType' },
              { label: 'Status', value: filters?.status, options: statusOptions, key: 'status' }
            ].map((f, i) => (
              <div key={i} className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">{f.label}</label>
                <div className="relative">
                  <select
                    value={f.value}
                    onChange={(e) => onFilterChange(f.key, e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2 border border-slate-200 bg-white text-xs font-semibold rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all cursor-pointer"
                  >
                    {f.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Icon name="ChevronDown" size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Metadata Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-200">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="text-xs font-semibold text-slate-600">
              Found <span className="text-slate-900">{resultCount} employees</span>
            </span>
          </div>
          
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
               <span className="text-xs font-medium text-slate-400">Active:</span>
               <div className="flex gap-2">
                 {Object.entries(filters).map(([key, value]) => {
                   if (!value) return null;
                   return (
                     <div key={key} className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-700 shadow-sm animate-in fade-in zoom-in duration-200">
                       <span className="capitalize">{value}</span>
                       <button onClick={() => onFilterChange(key, '')} className="text-slate-400 hover:text-rose-500 transition-colors">
                         <Icon name="X" size={12} />
                       </button>
                     </div>
                   );
                 })}
               </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button 
              onClick={onClearFilters}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors mr-2"
            >
              Reset Filters
            </button>
          )}
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-50 transition-all shadow-sm">
            <Icon name="Filter" size={14} />
            <span>Advanced</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeFilters;