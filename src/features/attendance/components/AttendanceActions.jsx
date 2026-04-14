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
      id: 'mark_absent',
      label: 'Mark Absent',
      icon: 'UserX',
      color: 'error',
      description: 'Mark selected employees as absent'
    },
    {
      id: 'approve_overtime',
      label: 'Approve Overtime',
      icon: 'Clock',
      color: 'warning',
      description: 'Approve overtime for selected employees'
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
    <div className="bg-white border border-slate-900 p-8 shadow-[8px_8px_0px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        {/* Left Side - Selection Info & Bulk Actions */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_rgba(15,23,42,0.2)]">
                <Icon name="Users" size={14} strokeWidth={3} />
                <span>
                    {selectedEmployees?.length > 0
                    ? `SELECTED_MANIFEST: ${selectedEmployees?.length} / ${totalRecords}`
                    : `TOTAL_SYSTEM_RECORDS: ${totalRecords}`
                    }
                </span>
            </div>
          </div>

          {/* Bulk Actions Grid */}
          {selectedEmployees?.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {bulkActions?.map((action) => (
                <button
                  key={action?.id}
                  onClick={() => onBulkAction(action?.id)}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-2 transition-all active:translate-y-0.5 flex items-center shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 ${
                    action.color === 'success' ? 'border-emerald-900 bg-emerald-50 text-emerald-900' :
                    action.color === 'error' ? 'border-rose-900 bg-rose-50 text-rose-900' :
                    action.color === 'warning' ? 'border-amber-900 bg-amber-50 text-amber-900' :
                    'border-slate-900 bg-slate-50 text-slate-900'
                  }`}
                  title={action?.description}
                >
                  <Icon name={action?.icon} size={14} className="mr-2" strokeWidth={3} />
                  {action?.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center space-x-3 text-slate-400 group">
                <div className="w-8 h-px bg-slate-200"></div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] italic">Await selection to engage bulk protocols</p>
                <div className="w-8 h-px bg-slate-200"></div>
            </div>
          )}
        </div>

        {/* Right Side - Actions Terminal */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Take Attendance */}
          <button
            onClick={onTakeAttendance}
            className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-[6px_6px_0px_rgba(15,23,42,0.15)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center"
          >
            <Icon name="ClipboardCheck" size={16} className="mr-2" strokeWidth={3} />
            Engage Attendance
          </button>

          {/* Manual Entry */}
          <button
            onClick={onManualEntry}
            className="px-6 py-2.5 bg-white border-2 border-slate-900 text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] shadow-[6px_6px_0px_rgba(15,23,42,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center"
          >
            <Icon name="Edit" size={16} className="mr-2" strokeWidth={3} />
            Manual_Overwrite
          </button>

          {/* Export Menu */}
          <div className="relative">
            <button
               onClick={() => setShowExportMenu(!showExportMenu)}
               className="px-6 py-2.5 bg-white border-2 border-slate-900 text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] shadow-[6px_6px_0px_rgba(15,23,42,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center"
            >
              <Icon name="Download" size={16} className="mr-2" strokeWidth={3} />
              Export
              <Icon name="ChevronDown" size={14} className="ml-2" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-4 w-72 bg-white border-4 border-slate-900 shadow-[12px_12px_0px_rgba(15,23,42,0.2)] z-20 divide-y-2 divide-slate-100">
                <div className="py-2">
                  <div className="px-4 py-2 border-b-2 border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select_Export_Format</p>
                  </div>
                  {exportFormats?.map((format) => (
                    <button
                      key={format?.id}
                      onClick={() => {
                        onExportReport(format?.id);
                        setShowExportMenu(false);
                      }}
                      className="w-full px-4 py-4 text-left hover:bg-slate-50 transition-colors duration-150 group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                            <Icon name={format?.icon} size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900 uppercase tracking-widest">{format?.label}</div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{format?.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Policy Settings */}
          <button
             onClick={() => console.log('Policy settings')}
             className="p-2.5 bg-slate-50 border-2 border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 hover:bg-white transition-all active:translate-y-0.5"
             title="System Policy Architecture"
          >
            <Icon name="Settings" size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceActions;