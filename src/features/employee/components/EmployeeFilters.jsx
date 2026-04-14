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

   React.useEffect(() => {
    if (!filters.status) {
      onFilterChange('status', 'active');
    }
  }, []); 

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
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Search Employees</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, or employee ID..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e?.target?.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all font-medium"
            />
            <Icon 
              name="Search" 
              size={16} 
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
              <div key={i} className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{f.label}</label>
                <div className="relative">
                  <select
                    value={f.value}
                    onChange={(e) => onFilterChange(f.key, e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2 border border-slate-200 bg-white text-xs font-bold uppercase tracking-wider text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    {f.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Icon name="ChevronDown" size={12} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Metadata Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-slate-900"></span>
            <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">
              RESULTS FOUND: <span className="text-slate-900">{resultCount} EMPLOYEES</span>
            </span>
          </div>
          
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Filters:</span>
               <div className="flex gap-1.5">
                 {Object.entries(filters).map(([key, value]) => {
                   if (!value) return null;
                   return (
                     <div key={key} className="flex items-center gap-1.5 px-2 py-0.5 bg-white border border-slate-300 text-[10px] font-black uppercase text-slate-700">
                       <span>{value}</span>
                       <button onClick={() => onFilterChange(key, '')} className="text-slate-400 hover:text-slate-900 transition-colors">
                         <Icon name="X" size={10} />
                       </button>
                     </div>
                   );
                 })}
               </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button 
              onClick={onClearFilters}
              className="text-[10px] font-black uppercase text-rose-600 hover:text-rose-700 transition-colors tracking-widest mr-4"
            >
              Clear All Filters
            </button>
          )}
          <button className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all">
            <Icon name="Filter" size={12} />
            <span>Advanced Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeFilters;