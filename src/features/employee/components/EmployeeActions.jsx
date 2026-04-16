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

    return { total, active, inactive, pending, terminated };
  }, [employees]);

  return (
    <div className="bg-white border-b border-slate-200 p-0 mb-0">
      <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between border-b border-slate-200">
        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row p-6 items-center gap-4 lg:border-r border-slate-200">
          <button
            onClick={onAddEmployee}
            className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-all shadow-sm active:translate-y-0.5"
          >
            <Icon name="Plus" size={16} />
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
              <div className="flex items-center space-x-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-50 transition-colors shadow-sm">
                <Icon name="Upload" size={14} />
                <span>Import CSV</span>
              </div>
            </div>

            <button
              onClick={onExportEmployees}
              className="flex items-center space-x-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Icon name="Download" size={14} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex-1 flex items-center justify-between p-6 bg-slate-50/30">
          <div className="flex items-center gap-6">
            {selectedEmployees?.length > 0 && (
              <div className="flex items-center space-x-2 text-xs font-semibold text-blue-700 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                <Icon name="CheckSquare" size={14} />
                <span>{selectedEmployees?.length} selected</span>
              </div>
            )}

            {selectedEmployees?.length > 0 && (
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2 border border-slate-200 bg-white text-slate-700 font-medium rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  >
                    {bulkActionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Icon name="ChevronDown" size={14} />
                  </div>
                </div>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="px-5 py-2 bg-slate-900 text-white font-semibold rounded-xl text-xs hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {!selectedEmployees?.length && (
            <span className="text-xs font-medium text-slate-400 italic">Select employees for bulk actions</span>
          )}
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-slate-100 bg-white">
        {[
          { label: 'Total Employees', count: employeeCounts.total, color: 'text-slate-900', bg: 'bg-slate-50' },
          { label: 'Active', count: employeeCounts.active, color: 'text-emerald-600', bg: 'bg-emerald-50/30' },
          { label: 'Pending', count: employeeCounts.pending, color: 'text-amber-600', bg: 'bg-amber-50/30' },
          { label: 'Inactive', count: employeeCounts.inactive, color: 'text-slate-500', bg: 'bg-slate-50' },
          { label: 'Terminated', count: employeeCounts.terminated, color: 'text-rose-600', bg: 'bg-rose-50/30' },
        ].map((stat, i) => (
          <div key={i} className="p-5 hover:bg-slate-50/50 transition-colors group">
            <div className="flex items-center justify-between mb-1">
              <p className={`text-2xl font-bold tracking-tight ${stat.color}`}>{stat.count}</p>
              <div className={`w-2 h-2 rounded-full ${stat.color.replace('text-', 'bg-')}`}></div>
            </div>
            <p className="text-xs font-semibold text-slate-500 tracking-tight">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeActions;