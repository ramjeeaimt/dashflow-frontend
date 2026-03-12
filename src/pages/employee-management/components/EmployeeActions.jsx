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
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="default"
            onClick={onAddEmployee}
            iconName="Plus"
            iconPosition="left"
            className="w-full sm:w-auto"
          >
            Add Employee
          </Button>

          <div className="flex gap-2">
            <div className="relative">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" iconName="Upload" iconPosition="left" className="w-full sm:w-auto">
                Import CSV
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={onExportEmployees}
              iconName="Download"
              iconPosition="left"
              className="w-full sm:w-auto"
            >
              Export
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {selectedEmployees?.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Icon name="CheckSquare" size={16} />
              <span>{selectedEmployees?.length} selected</span>
            </div>
          )}

          {selectedEmployees?.length > 0 && (
            <div className="flex items-center space-x-2">
              <Select
                options={bulkActionOptions}
                value={bulkAction}
                onChange={setBulkAction}
                className="w-48"
              />
              <Button variant="outline" onClick={handleBulkAction} disabled={!bulkAction} iconName="Play" iconPosition="left" size="sm">
                Apply
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats - dynamic */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-semibold text-foreground">{employeeCounts.total}</p>
          <p className="text-sm text-muted-foreground">Total Employees</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-success">{employeeCounts.active}</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-warning">{employeeCounts.pending}</p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-error">{employeeCounts.inactive}</p>
          <p className="text-sm text-muted-foreground">Inactive</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-error">{employeeCounts.terminated}</p>
          <p className="text-sm text-muted-foreground">terminated</p>
        </div>
      </div>
      
    </div>
  );
};

export default EmployeeActions;