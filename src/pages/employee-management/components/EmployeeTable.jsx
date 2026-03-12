import React, { useState } from 'react';
import axios from 'axios';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { toast } from 'react-hot-toast'; // Recommended for feedback

/** * 1. ENUMS (Must match your Backend DTO exactly)
 */
const EmployeeStatus = {
  ACTIVE: 'Active',
  PENDING: 'Pending',
  INACTIVE: 'In-Active',
  ON_LEAVE: 'On-Leave',
  TERMINATED: 'Terminated',
};

const EmployeeTable = ({
  employees,
  setEmployees, // Added to update local state after API call
  selectedEmployees,
  onSelectEmployee,
  onSelectAll,
  onEditEmployee,
  onViewEmployee,
  onDeleteEmployee,
  sortConfig,
  onSort
}) => {

  /**
   * 2. API HANDLER
   * This updates the status in the DB via your UpdateEmployeeDto logic
   */
  const handleStatusUpdate = async (employeeId, newStatus) => {
  const toastId = toast.loading(`Updating...`);
  
  try {
    const token = localStorage.getItem('token'); 
    const response = await axios.put(
      `http://localhost:5001/employees/${employeeId}`, 
      { status: newStatus }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // We get the new status from the backend
    const updatedStatusFromServer = response.data.status;

    // UPDATE THE MAIN STATE
    setEmployees((prevEmployees) => {
      return prevEmployees.map((emp) => {
        if (emp.id === employeeId || emp._id === employeeId) {
          // IMPORTANT: Spread 'emp' FIRST to keep UI fields (name, department string)
          // THEN overwrite only the status.
          return { 
            ...emp, 
            status: updatedStatusFromServer 
          };
        }
        return emp;
      });
    });

    toast.success("Status Updated!", { id: toastId });
  } catch (error) {
    console.error("Update Error:", error);
    toast.error("Failed to update status", { id: toastId });
  }
};
  /**
   * 3. DYNAMIC STATUS UI
   * Converts the badge into an interactive dropdown
   */
  const renderStatusDropdown = (employee) => {
    const statusStyles = {
      [EmployeeStatus.ACTIVE]: 'bg-success/10 text-success border-success/20',
      [EmployeeStatus.PENDING]: 'bg-warning/10 text-warning border-warning/20',
      [EmployeeStatus.INACTIVE]: 'bg-error/10 text-error border-error/20',
      [EmployeeStatus.ON_LEAVE]: 'bg-blue-100 text-blue-700 border-blue-200',
      [EmployeeStatus.TERMINATED]: 'bg-muted text-muted-foreground border-border',
    };

    const currentStyle = statusStyles[employee.status] || statusStyles[EmployeeStatus.ACTIVE];

    return (
      <select
        value={employee.status}
        onChange={(e) => handleStatusUpdate(employee.id, e.target.value)}
        className={`px-2 py-1 text-xs font-medium rounded-full border cursor-pointer outline-none focus:ring-2 focus:ring-primary transition-all ${currentStyle}`}
      >
        {Object.values(EmployeeStatus).map((status) => (
          <option key={status} value={status} className="bg-white text-black">
            {status}
          </option>
        ))}
      </select>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedEmployees?.length === employees?.length && employees?.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-border text-primary focus:ring-primary"
                />
              </th>
              {[
                { key: 'name', label: 'Employee' },
                { key: 'department', label: 'Department' },
                { key: 'role', label: 'Role' },
                { key: 'status', label: 'Status' },
                { key: 'hireDate', label: 'Hire Date' },
                { key: 'manager', label: 'Manager' }
              ].map((column) => (
                <th key={column.key} className="px-4 py-3 text-left">
                  <button
                    onClick={() => onSort(column.key)}
                    className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>{column.label}</span>
                    <Icon
                      name={sortConfig?.key === column.key ? (sortConfig.direction === 'asc' ? 'ArrowUp' : 'ArrowDown') : 'ArrowUpDown'}
                      size={14}
                    />
                  </button>
                </th>
              ))}
              <th className="w-24 px-4 py-3 text-center text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {employees?.map((employee) => (
              <tr key={employee.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedEmployees?.includes(employee.id)}
                    onChange={() => onSelectEmployee(employee.id)}
                    className="rounded border-border"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      <Image src={employee.avatar} alt={employee.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">{employee.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm">{employee.department}</td>
                <td className="px-4 py-4 text-sm">{employee.role}</td>
                <td className="px-4 py-4">
                  {/* Interactive Dropdown instead of static badge */}
                  {renderStatusDropdown(employee)}
                </td>
                <td className="px-4 py-4 text-sm text-muted-foreground">{formatDate(employee.hireDate)}</td>
                <td className="px-4 py-4 text-sm">{employee.manager}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => onViewEmployee(employee)}><Icon name="Eye" size={14} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => onEditEmployee(employee)}><Icon name="Edit" size={14} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => onDeleteEmployee(employee.id)} className="text-error"><Icon name="Trash2" size={14} /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view updated similarly */}
      <div className="lg:hidden space-y-4 p-4">
        {employees?.map((employee) => (
          <div key={employee.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                  <Image src={employee.avatar} alt={employee.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{employee.name}</p>
                  <p className="text-xs text-muted-foreground">{employee.email}</p>
                </div>
              </div>
              {renderStatusDropdown(employee)}
            </div>
            {/* ... other mobile card details ... */}

          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeTable;