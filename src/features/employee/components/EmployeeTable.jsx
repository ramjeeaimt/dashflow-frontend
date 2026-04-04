import React, { useState } from 'react';
import axios from 'axios';
import apiClient from '../../../api/client';
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

// Avatar Component with fallback logic
const EmployeeAvatar = ({ employee, size = 'md' }) => {
  const [imageError, setImageError] = useState(false);
  
  const getInitials = () => {
    const name = employee?.name || '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getColorFromName = () => {
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', 
      '#ef4444', '#f97316', '#f59e0b', '#eab308',
      '#84cc16', '#10b981', '#14b8a6', '#06b6d4',
      '#0ea5e9', '#3b82f6', '#6366f1'
    ];
    
    const name = employee?.name || '';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash |= 0;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const avatarUrl = employee?.profileImage || employee?.avatar;
  
  if (avatarUrl && !imageError) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 flex-shrink-0`}>
        <img
          src={avatarUrl}
          alt={employee?.name || 'Employee'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-medium text-white flex-shrink-0`}
      style={{ backgroundColor: getColorFromName() }}
    >
      {getInitials() || '?'}
    </div>
  );
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

  const handlePermissionToggle = async (employeeId) => {
    const toastId = toast.loading("Updating verification...");

    try {
      const response = await apiClient.patch(`/employees/verify/${employeeId}`, {});

      const updatedEmployee = response.data;

      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          (emp.id === employeeId || emp._id === employeeId)
            ? { ...emp, isVerified: updatedEmployee.isVerified }
            : emp
        )
      );

      toast.success(updatedEmployee.isVerified ? "Access granted!" : "Access revoked!", { id: toastId });
    } catch (error) {
      console.error("Patch Error:", error);
      toast.error("Failed to update permission", { id: toastId });
    }
  };

  const handleStatusUpdate = async (employeeId, newStatus) => {
    const toastId = toast.loading(`Updating status...`);
    try {
      const response = await apiClient.put(`/employees/${employeeId}`, { status: newStatus });

      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          (emp.id === employeeId || emp._id === employeeId)
            ? { ...emp, status: response.data.status }
            : emp
        )
      );
      toast.success(`Status updated to ${newStatus}`, { id: toastId });
    } catch (error) {
      toast.error("Failed to update status", { id: toastId });
    }
  };

  /**
   * 3. UI RENDERING HELPERS
   */

  const renderPermissionToggle = (employee) => {
    const isEnabled = employee.isVerified;

    return (
      <button
        onClick={() => handlePermissionToggle(employee.id || employee._id)}
        className="relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        style={{ backgroundColor: isEnabled ? '#10b981' : '#cbd5e1' }}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${isEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
            }`}
          style={{ transform: isEnabled ? 'translateX(18px)' : 'translateX(2px)' }}
        />
      </button>
    );
  };

  const renderStatusDropdown = (employee) => {
    const statusConfig = {
      [EmployeeStatus.ACTIVE]: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
      [EmployeeStatus.PENDING]: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
      [EmployeeStatus.INACTIVE]: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' },
      [EmployeeStatus.ON_LEAVE]: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
      [EmployeeStatus.TERMINATED]: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
    };
    
    const config = statusConfig[employee.status] || statusConfig[EmployeeStatus.ACTIVE];

    return (
      <select
        value={employee.status}
        onChange={(e) => handleStatusUpdate(employee.id || employee._id, e.target.value)}
        className={`px-2.5 py-1 text-xs font-medium rounded-lg border cursor-pointer outline-none transition-all ${config.bg} ${config.text} ${config.border}`}
      >
        {Object.values(EmployeeStatus).map((status) => (
          <option key={status} value={status} className="bg-white text-gray-900">{status}</option>
        ))}
      </select>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedEmployees?.length === employees?.length && employees?.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              {[
                { key: 'name', label: 'Employee' },
                { key: 'department', label: 'Department' },
                { key: 'role', label: 'Role' },
                { key: 'status', label: 'Status' },
                { key: 'isVerified', label: 'Access' },
                { key: 'hireDate', label: 'Hire Date' },
                { key: 'manager', label: 'Manager' },
              ].map((column) => (
                <th key={column.key} className="px-4 py-3 text-left">
                  <button
                    onClick={() => onSort(column.key)}
                    className="flex items-center space-x-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900 transition-colors"
                  >
                    <span>{column.label}</span>
                    <Icon
                      name={sortConfig?.key === column.key ? (sortConfig.direction === 'asc' ? 'ArrowUp' : 'ArrowDown') : 'ArrowUpDown'}
                      size={12}
                    />
                  </button>
                </th>
              ))}
              <th className="w-20 px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees?.map((employee, index) => (
              <tr key={employee?.id || employee?._id || `employee-${index}`} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedEmployees?.includes(employee.id || employee._id)}
                    onChange={() => onSelectEmployee(employee.id || employee._id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <EmployeeAvatar employee={employee} size="md" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{employee.name || '—'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{employee.email || '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700">{employee.department || '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700">{employee.role || '—'}</span>
                </td>
                <td className="px-4 py-3">
                  {renderStatusDropdown(employee)}
                </td>
                <td className="px-4 py-3">
                  {renderPermissionToggle(employee)}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-500">{formatDate(employee.hireDate)}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-1">
                    {employee.manager ? (
                      <div className="flex items-center space-x-1.5">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                          <Icon name="User" size={10} className="text-gray-500" />
                        </div>
                        <span className="text-sm text-gray-600">{employee.manager}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center space-x-1">
                    <button
                      onClick={() => onViewEmployee(employee)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                      title="View"
                    >
                      <Icon name="Eye" size={14} />
                    </button>
                    <button
                      onClick={() => onEditEmployee(employee)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                      title="Edit"
                    >
                      <Icon name="Edit" size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteEmployee(employee.id || employee._id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Delete"
                    >
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3 p-4">
        {employees?.map((employee, index) => (
          <div key={employee?.id || employee?._id || `mobile-employee-${index}`} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <EmployeeAvatar employee={employee} size="lg" />
                <div>
                  <p className="text-base font-semibold text-gray-900">{employee.name || '—'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{employee.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onViewEmployee(employee)}
                  className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  <Icon name="Eye" size={16} />
                </button>
                <button
                  onClick={() => onEditEmployee(employee)}
                  className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                >
                  <Icon name="Edit" size={16} />
                </button>
                <button
                  onClick={() => onDeleteEmployee(employee.id || employee._id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                >
                  <Icon name="Trash2" size={16} />
                </button>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500 mb-1">Department</p>
                <p className="text-sm text-gray-900 font-medium">{employee.department || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Role</p>
                <p className="text-sm text-gray-900 font-medium">{employee.role || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                {renderStatusDropdown(employee)}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Access</p>
                {renderPermissionToggle(employee)}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Hire Date</p>
                <p className="text-sm text-gray-700">{formatDate(employee.hireDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Manager</p>
                <p className="text-sm text-gray-700">{employee.manager || '—'}</p>
              </div>
            </div>

            {/* Selection Checkbox */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedEmployees?.includes(employee.id || employee._id)}
                  onChange={() => onSelectEmployee(employee.id || employee._id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Select</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {(!employees || employees.length === 0) && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Icon name="Users" size={32} className="text-gray-400" />
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">No employees found</h3>
          <p className="text-sm text-gray-500">Get started by adding your first employee</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;