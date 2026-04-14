import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const EmployeeActions = ({
  employees = [], // Add this prop
  selectedEmployees,
  onAddEmployee,
  onBulkAction,
  onImportEmployees,
  onExportEmployees
}) => {
  const [bulkAction, setBulkAction] = useState('');
  
  const bulkActionOptions = [
    { value: '', label: 'Select bulk action...' },
    { value: 'activate', label: 'Activate Selected' },
    { value: 'deactivate', label: 'Deactivate Selected' },
    { value: 'export', label: 'Export Selected' },
    { value: 'delete', label: 'Delete Selected' },
    { value: 'assign-manager', label: 'Assign Manager' },
    { value: 'change-department', label: 'Change Department' },
    { value: 'bulk-check-in', label: 'Bulk Check-in' },
    { value: 'send-notification', label: 'Send Notification' }
  ];

  const handleBulkAction = () => {
    if (bulkAction && selectedEmployees?.length > 0) {
      onBulkAction(bulkAction, selectedEmployees);
      setBulkAction('');
    }
  };

  const handleFileImport = (event) => {
    const file = event?.target?.files?.[0];
    if (file) {
      onImportEmployees(file);
      event.target.value = '';
    }
  };

  // Calculate counts dynamically
  const employeeCounts = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => e.status === 'active').length;
    const inactive = employees.filter(e => e.status === 'inactive').length;
    const pending = employees.filter(e => e.status === 'pending').length;
     const terminated = employees.filter(e => e.status === 'terminated').length;

    return { total, active, inactive, pending ,terminated};
  }, [employees]);

  return (
    <div className="bg-white border-b border-slate-200 p-0 mb-0">
      <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between border-b border-slate-200">
        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row p-6 items-center gap-4 lg:border-r border-slate-200">
          <button
            onClick={onAddEmployee}
            className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-slate-900 text-white font-bold uppercase tracking-wider text-xs hover:bg-slate-800 transition-all shadow-sm active:translate-y-0.5"
          >
            <Icon name="Plus" size={14} />
            <span>Add Employee</span>
          </button>

          <div className="flex space-x-2">
            <div className="relative group">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex items-center space-x-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 font-bold uppercase tracking-wider text-[10px] hover:bg-slate-50 transition-colors">
                <Icon name="Upload" size={12} />
                <span>Import CSV</span>
              </div>
            </div>

            <button
              onClick={onExportEmployees}
              className="flex items-center space-x-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 font-bold uppercase tracking-wider text-[10px] hover:bg-slate-50 transition-colors"
            >
              <Icon name="Download" size={12} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex-1 flex items-center justify-between p-6 bg-slate-50/50">
          <div className="flex items-center gap-6">
            {selectedEmployees?.length > 0 && (
              <div className="flex items-center space-x-2 text-[10px] font-bold uppercase text-slate-600 bg-slate-200/50 px-3 py-1.5 border border-slate-300">
                <Icon name="CheckSquare" size={12} className="text-slate-900" />
                <span>{selectedEmployees?.length} RECORDS SELECTED</span>
              </div>
            )}

            {selectedEmployees?.length > 0 && (
              <div className="flex items-center space-x-2">
                <div className="relative">
                   <select 
                    value={bulkAction} 
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="appearance-none pl-3 pr-10 py-2 border border-slate-200 bg-white text-slate-700 font-bold uppercase tracking-wider text-[10px] focus:outline-none focus:ring-1 focus:ring-slate-900"
                   >
                     {bulkActionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                   </select>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                     <Icon name="ChevronDown" size={12} />
                   </div>
                </div>
                <button 
                  variant="outline" 
                  onClick={handleBulkAction} 
                  disabled={!bulkAction}
                  className="px-4 py-2 bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px] hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
          
          {!selectedEmployees?.length && (
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest italic">Bulk actions disabled until selection</span>
          )}
        </div>
      </div>

      {/* Industrial Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-slate-200 bg-slate-50/30">
        {[
          { label: 'Total Employees', count: employeeCounts.total, color: 'text-slate-900' },
          { label: 'Active', count: employeeCounts.active, color: 'text-emerald-600' },
          { label: 'Pending', count: employeeCounts.pending, color: 'text-amber-600' },
          { label: 'Inactive', count: employeeCounts.inactive, color: 'text-slate-500' },
          { label: 'Terminated', count: employeeCounts.terminated, color: 'text-rose-600' },
        ].map((stat, i) => (
          <div key={i} className="p-4 hover:bg-white transition-colors group">
            <p className={`text-2xl font-black font-mono tracking-tighter ${stat.color}`}>{stat.count.toString().padStart(2, '0')}</p>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1 group-hover:text-slate-600 transition-colors">{stat.label}</p>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default EmployeeActions;