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
    <div className="bg-card border-b border-border ">
      {/* <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8"> */}
      {/* Left Side - Selection Info & Bulk Actions */}
      {/* <div className="flex-1 space-y-4"> */}
      {/* Bulk Actions Grid */}
      {/* {selectedEmployees?.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {bulkActions?.map((action) => (
                <button
                  key={action?.id}
                  onClick={() => onBulkAction(action?.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center shadow-sm ${action.color === 'success' ? 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' :
 action.color === 'error' ? 'border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-100' :
 action.color === 'warning' ? 'border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100' :
 action.color === 'purple' ? 'border-border bg-primary/10 text-primary hover:bg-primary/10' :
 'border-border bg-muted/60 text-foreground hover:bg-muted'
 }`}
                  title={action?.description}
                >
                  <Icon name={action?.icon} size={14} className="mr-2" />
                  {action?.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center space-x-3 text-muted-foreground/70 group">
              <div className="w-6 h-px bg-muted"></div>
              <p className="text-xs font-semibold tracking-tight">Select records to perform bulk actions</p>
              <div className="w-6 h-px bg-muted"></div>
            </div>
          )} */}
      {/* </div> */}

      {/* Right Side - Action Buttons */}
      {/* <div className="flex flex-wrap items-center gap-3"> */}
      {/* Take Attendance */}
      {/* <button
            onClick={onTakeAttendance}
            className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-primary/90 transition-all flex items-center "
          >
            <Icon name="ClipboardCheck" size={16} className="mr-2" />
            Take Attendance
          </button> */}

      {/* Manual Entry */}
      {/* <button
            onClick={onManualEntry}
            className="px-6 py-2.5 bg-card border border-border text-foreground text-xs font-bold rounded-xl shadow-sm hover:bg-muted/60 transition-all flex items-center "
          >
            <Icon name="PlusCircle" size={16} className="mr-2" />
            Manual Entry
          </button> */}

      {/* Export Menu */}
      {/* <div className="relative"> */}
      {/* <button
               onClick={() => setShowExportMenu(!showExportMenu)}
               className="px-6 py-2.5 bg-card border border-border text-foreground text-xs font-bold rounded-xl shadow-sm hover:bg-muted/60 transition-all flex items-center "
            >
              <Icon name="Download" size={16} className="mr-2" />
              Export
              <Icon name="ChevronDown" size={14} className="ml-2 opacity-50" />
            </button> */}

      {/* {showExportMenu && (
              <div className="absolute right-0 top-full mt-3 w-72 bg-card border border-border shadow-sm rounded-lg z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-3 py-2.5 border-b border-slate-50 mb-1">
                  <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide">Available Formats</p>
                </div>
                {exportFormats?.map((format) => (
                  <button
                    key={format?.id}
                    onClick={() => {
                      onExportReport(format?.id);
                      setShowExportMenu(false);
                    }}
                    className="w-full px-3 py-3 text-left hover:bg-muted/60 transition-all rounded-xl group flex items-start space-x-4"
                  >
                    <div className="p-2 bg-muted/60 rounded-lg group-hover:bg-primary/90 group-hover:text-white transition-all">
                      <Icon name={format?.icon} size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">{format?.label}</div>
                      <div className="text-[10px] font-medium text-muted-foreground/70 mt-0.5">{format?.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )} */}
      {/* </div> */}

      {/* <button
            onClick={() => console.log('Policy settings')}
            className="p-2.5 bg-muted/60 border border-border text-muted-foreground/70 hover:text-foreground hover:bg-card rounded-xl transition-all shadow-sm"
            title="Settings"
          >
            <Icon name="Settings" size={20} />
          </button> */}
      {/* </div> */}
      {/* </div> */}
    </div>
  );
};

export default AttendanceActions;