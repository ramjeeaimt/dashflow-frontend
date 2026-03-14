import React from 'react';
import axios from 'axios';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { toast } from 'react-hot-toast';

/** * 1. ENUMS 
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
  setEmployees, 
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
   * 2. API HANDLERS
   */

  // NEW: Handler for your @Patch('verify/:id') controller
  const handlePermissionToggle = async (employeeId) => {
    const toastId = toast.loading("Updating verification...");
    
    try {
      const token = localStorage.getItem('token'); 
      const response = await axios.patch(
        `http://localhost:5001/employees/verify/${employeeId}`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // We assume the backend returns the updated employee object with a 'isVerified' field
      const updatedEmployee = response.data;

      setEmployees((prevEmployees) => 
        prevEmployees.map((emp) => 
          (emp.id === employeeId || emp._id === employeeId) 
            ? { ...emp, isVerified: updatedEmployee.isVerified } 
            : emp
        )
      );

      toast.success("Permission Toggled!", { id: toastId });
    } catch (error) {
      console.error("Patch Error:", error);
      toast.error("Failed to update permission", { id: toastId });
    }
  };

  const handleStatusUpdate = async (employeeId, newStatus) => {
    const toastId = toast.loading(`Updating...`);
    try {
      const token = localStorage.getItem('token'); 
      const response = await axios.put(
        `http://localhost:5001/employees/${employeeId}`, 
        { status: newStatus }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEmployees((prevEmployees) => 
        prevEmployees.map((emp) => 
          (emp.id === employeeId || emp._id === employeeId) 
            ? { ...emp, status: response.data.status } 
            : emp
        )
      );
      toast.success("Status Updated!", { id: toastId });
    } catch (error) {
      toast.error("Failed to update status", { id: toastId });
    }
  };

  /**
   * 3. UI RENDERING HELPERS
   */

  // NEW: Toggle Switch (Left to Right animation)
  const renderPermissionToggle = (employee) => {
    const isEnabled = employee.isVerified; // Adjust field name based on your DB

    return (
      <button
        onClick={() => handlePermissionToggle(employee.id || employee._id)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
          isEnabled ? 'bg-success' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
            isEnabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    );
  };

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
        onChange={(e) => handleStatusUpdate(employee.id || employee._id, e.target.value)}
        className={`px-2 py-1 text-xs font-medium rounded-full border cursor-pointer outline-none transition-all ${currentStyle}`}
      >
        {Object.values(EmployeeStatus).map((status) => (
          <option key={status} value={status} className="bg-white text-black">{status}</option>
        ))}
      </select>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
                { key: 'isVerified', label: 'Permission' }, // New Column Added
                { key: 'hireDate', label: 'Hire Date' },
                { key: 'manager', label: 'Manager' },
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
              <tr key={employee.id || employee._id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedEmployees?.includes(employee.id || employee._id)}
                    onChange={() => onSelectEmployee(employee.id || employee._id)}
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
                <td className="px-4 py-4">{renderStatusDropdown(employee)}</td>
                
                {/* PERMISSION TOGGLE CELL */}
                <td className="px-4 py-4">
                  {renderPermissionToggle(employee)}
                </td>

                <td className="px-4 py-4 text-sm text-muted-foreground">{formatDate(employee.hireDate)}</td>
                <td className="px-4 py-4 text-sm">{employee.manager}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => onViewEmployee(employee)}><Icon name="Eye" size={14} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => onEditEmployee(employee)}><Icon name="Edit" size={14} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => onDeleteEmployee(employee.id || employee._id)} className="text-error"><Icon name="Trash2" size={14} /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-4 p-4">
        {employees?.map((employee) => (
          <div key={employee.id || employee._id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                  <Image src={employee.avatar} alt={employee.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{employee.name}</p>
                  <div className="flex flex-col gap-1 mt-1">
                    {renderStatusDropdown(employee)}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">Verified:</span>
                      {renderPermissionToggle(employee)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                 <Button variant="ghost" size="icon" onClick={() => onEditEmployee(employee)}><Icon name="Edit" size={14} /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeTable;