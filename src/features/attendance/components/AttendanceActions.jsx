import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AttendanceActions = ({
  selectedEmployees,
  onBulkAction,
  onExportReport,
  onManualEntry,
  onTakeAttendance,
  totalRecords
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const bulkActions = [
    {
      id: 'mark_present',
      label: 'Mark Present',
      icon: 'UserCheck',
      color: 'success',
      description: 'Mark selected employees as present'
    },
    {
      id: 'mark_half_day',
      label: 'Mark Half Day',
      icon: 'Clock4',
      color: 'purple',
      description: 'Mark selected employees as half-day (affects payroll)'
    },
    {
      id: 'mark_absent',
      label: 'Mark Absent',
      icon: 'UserX',
      color: 'error',
      description: 'Mark selected employees as absent'
    },
    {
      id: 'send_notification',
      label: 'Send Notification',
      icon: 'Bell',
      color: 'primary',
      description: 'Send attendance notification to selected employees'
    }
  ];

  const exportFormats = [
    {
      id: 'excel',
      label: 'Excel (.xlsx)',
      icon: 'FileSpreadsheet',
      description: 'Download as Excel spreadsheet'
    },
    {
      id: 'pdf',
      label: 'PDF Report',
      icon: 'FileText',
      description: 'Generate PDF attendance report'
    },
    {
      id: 'csv',
      label: 'CSV Data',
      icon: 'Database',
      description: 'Export as CSV file'
    }
  ];

  const getButtonColor = (color) => {
    const colors = {
      success: 'bg-success hover:bg-success/90 text-success-foreground',
      error: 'bg-error hover:bg-error/90 text-error-foreground',
      warning: 'bg-warning hover:bg-warning/90 text-warning-foreground',
      primary: 'bg-primary hover:bg-primary/90 text-primary-foreground'
    };
    return colors?.[color] || colors?.primary;
  };

  return (
    <div className="bg-white border-b border-slate-100 p-6 md:p-10">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        {/* Left Side - Selection Info & Bulk Actions */}
        <div className="flex-1 space-y-4">
          {/* Bulk Actions Grid */}
          {selectedEmployees?.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {bulkActions?.map((action) => (
                <button
                  key={action?.id}
                  onClick={() => onBulkAction(action?.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all active:scale-95 flex items-center shadow-sm ${
                    action.color === 'success' ? 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' :
                    action.color === 'error' ? 'border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-100' :
                    action.color === 'warning' ? 'border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100' :
                    action.color === 'purple' ? 'border-purple-100 bg-purple-50 text-purple-700 hover:bg-purple-100' :
                    'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                  title={action?.description}
                >
                   <Icon name={action?.icon} size={14} className="mr-2" />
                  {action?.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center space-x-3 text-slate-400 group">
                <div className="w-6 h-px bg-slate-100"></div>
                <p className="text-xs font-semibold tracking-tight">Select records to perform bulk actions</p>
                <div className="w-6 h-px bg-slate-100"></div>
            </div>
          )}
        </div>

        {/* Right Side - Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Take Attendance */}
          <button
            onClick={onTakeAttendance}
            className="px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center active:scale-95"
          >
            <Icon name="ClipboardCheck" size={16} className="mr-2" />
            Take Attendance
          </button>

          {/* Manual Entry */}
          <button
            onClick={onManualEntry}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center active:scale-95"
          >
            <Icon name="PlusCircle" size={16} className="mr-2" />
            Manual Entry
          </button>

          {/* Export Menu */}
          <div className="relative">
            <button
               onClick={() => setShowExportMenu(!showExportMenu)}
               className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center active:scale-95"
            >
              <Icon name="Download" size={16} className="mr-2" />
              Export
              <Icon name="ChevronDown" size={14} className="ml-2 opacity-50" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-3 w-72 bg-white border border-slate-100 shadow-2xl rounded-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-3 py-2.5 border-b border-slate-50 mb-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Formats</p>
                </div>
                {exportFormats?.map((format) => (
                  <button
                    key={format?.id}
                    onClick={() => {
                      onExportReport(format?.id);
                      setShowExportMenu(false);
                    }}
                    className="w-full px-3 py-3 text-left hover:bg-slate-50 transition-all rounded-xl group flex items-start space-x-4"
                  >
                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Icon name={format?.icon} size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{format?.label}</div>
                      <div className="text-[10px] font-medium text-slate-400 mt-0.5">{format?.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
             onClick={() => console.log('Policy settings')}
             className="p-2.5 bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all shadow-sm"
             title="Settings"
          >
            <Icon name="Settings" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceActions;