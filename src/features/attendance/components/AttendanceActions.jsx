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
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Side - Selection Info & Bulk Actions */}
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <Icon name="Users" size={20} className="text-muted-foreground" />
              <span className="text-sm text-foreground">
                {selectedEmployees?.length > 0
                  ? `${selectedEmployees?.length} of ${totalRecords} selected`
                  : `${totalRecords} total records`
                }
              </span>
            </div>

            {selectedEmployees?.length > 0 && (
              <div className="h-4 w-px bg-border"></div>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedEmployees?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {bulkActions?.map((action) => (
                <Button
                  key={action?.id}
                  size="sm"
                  onClick={() => onBulkAction(action?.id)}
                  className={`${getButtonColor(action?.color)} transition-all duration-150`}
                  title={action?.description}
                >
                  <Icon name={action?.icon} size={14} className="mr-1" />
                  {action?.label}
                </Button>
              ))}
            </div>
          )}

          {selectedEmployees?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Select employees to perform bulk actions
            </p>
          )}
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center space-x-3">
          {/* Take Attendance */}
          <Button
            variant="default"
            size="sm"
            onClick={onTakeAttendance}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Icon name="ClipboardCheck" size={14} className="mr-1" />
            Take Attendance
          </Button>

          {/* Manual Entry */}
          <Button
            variant="outline"
            size="sm"
            onClick={onManualEntry}
          >
            <Icon name="Edit" size={14} className="mr-1" />
            Manual Entry
          </Button>

          {/* Export Menu */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Icon name="Download" size={14} className="mr-1" />
              Export
              <Icon name="ChevronDown" size={12} className="ml-1" />
            </Button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-10">
                <div className="py-2">
                  {exportFormats?.map((format) => (
                    <button
                      key={format?.id}
                      onClick={() => {
                        onExportReport(format?.id);
                        setShowExportMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-accent transition-colors duration-150"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon name={format?.icon} size={16} className="text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium text-foreground">{format?.label}</div>
                          <div className="text-xs text-muted-foreground">{format?.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Policy Settings */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log('Policy settings')}
          >
            <Icon name="Settings" size={14} className="mr-1" />
            Policies
          </Button>
        </div>
      </div>

      {/* Quick Stats Row */}
      
    </div>
  );
};

export default AttendanceActions;