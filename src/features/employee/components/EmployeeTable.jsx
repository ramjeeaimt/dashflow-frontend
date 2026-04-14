import React, { useState, useEffect } from 'react';
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
    const colors = ['#0f172a', '#1e293b', '#334155', '#475569'];
    const name = employee?.name || '';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) - hash) + name.charCodeAt(i);
        hash |= 0;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-12 h-12 text-sm'
  };

  const avatarUrl = employee?.profileImage || employee?.avatar;

  if (avatarUrl && !imageError) {
    return (
      <div className={`${sizeClasses[size]} rounded-none overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200`}>
        <img
          src={avatarUrl}
          alt={employee?.name || 'Employee'}
          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-none flex items-center justify-center font-black text-white flex-shrink-0 border border-slate-900 shadow-sm`}
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
  const [roles, setRoles] = useState([]);
  const [rolesMap, setRolesMap] = useState({});

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await apiClient.get('/access-control/roles');
        if (response.data && Array.isArray(response.data)) {
          setRoles(response.data);
          const map = {};
          response.data.forEach(role => {
            map[role.id] = role.name;
            map[role._id] = role.name;
          });
          setRolesMap(map);
        }
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      }
    };
    fetchRoles();
  }, []);

  const getRoleName = (role) => {
    if (!role) return 'PERSONNEL';
    if (typeof role === 'object' && role.name) return role.name.toUpperCase();
    if (typeof role === 'object' && role.title) return role.title.toUpperCase();
    if (typeof role === 'string') {
      const roleName = rolesMap[role];
      return (roleName || role).toUpperCase();
    }
    return 'PERSONNEL';
  };

  const handlePermissionToggle = async (employeeId) => {
    const toastId = toast.loading("RECONFIGURING ACCESS...");
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
      toast.success(updatedEmployee.isVerified ? "ACCESS GRANTED" : "ACCESS REVOKED", { id: toastId });
    } catch (error) {
      toast.error("COMMUNICATION ERROR", { id: toastId });
    }
  };

  const handleStatusUpdate = async (employeeId, newStatus) => {
    const toastId = toast.loading(`UPDATING STATE...`);
    try {
      const response = await apiClient.put(`/employees/${employeeId}`, { status: newStatus });
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          (emp.id === employeeId || emp._id === employeeId)
            ? { ...emp, status: response.data.status }
            : emp
        )
      );
      toast.success(`STATE: ${newStatus.toUpperCase()}`, { id: toastId });
    } catch (error) {
      toast.error("STATE PERSISTENCE FAILURE", { id: toastId });
    }
  };

  const renderPermissionToggle = (employee) => {
    const isEnabled = employee.isVerified;
    return (
      <button
        onClick={() => handlePermissionToggle(employee.id || employee._id)}
        className={`relative inline-flex h-4 w-10 items-center rounded-none transition-all duration-300 border ${isEnabled ? 'bg-slate-900 border-slate-900' : 'bg-slate-100 border-slate-300'}`}
      >
        <span
          className={`inline-block h-2.5 w-2.5 transform rounded-none transition-transform duration-300 ${isEnabled ? 'translate-x-6 bg-white' : 'translate-x-1 bg-slate-400'}`}
        />
      </button>
    );
  };

  const renderStatusDropdown = (employee) => {
    const statusConfig = {
      [EmployeeStatus.ACTIVE]: { bg: 'bg-emerald-600', text: 'text-white' },
      [EmployeeStatus.PENDING]: { bg: 'bg-amber-500', text: 'text-white' },
      [EmployeeStatus.INACTIVE]: { bg: 'bg-slate-200', text: 'text-slate-600' },
      [EmployeeStatus.ON_LEAVE]: { bg: 'bg-sky-600', text: 'text-white' },
      [EmployeeStatus.TERMINATED]: { bg: 'bg-rose-600', text: 'text-white' },
    };
    const config = statusConfig[employee.status] || statusConfig[EmployeeStatus.ACTIVE];
    return (
      <select
        value={employee.status}
        onChange={(e) => handleStatusUpdate(employee.id || employee._id, e.target.value)}
        className={`appearance-none px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-none border-none cursor-pointer outline-none transition-all ${config.bg} ${config.text}`}
      >
        {Object.values(EmployeeStatus).map((status) => (
          <option key={status} value={status} className="bg-white text-slate-900 font-bold">{status.toUpperCase()}</option>
        ))}
      </select>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  return (
    <div className="bg-white border-t border-slate-200 overflow-hidden">
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="w-12 px-6 py-4 border-r border-slate-200">
                <input
                  type="checkbox"
                  checked={selectedEmployees?.length === employees?.length && employees?.length > 0}
                  onChange={onSelectAll}
                  className="rounded-none border-slate-400 text-slate-900 focus:ring-0"
                />
              </th>
              {[
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'department', label: 'Department' },
                { key: 'role', label: 'Role' },
                { key: 'status', label: 'Status' },
                { key: 'isVerified', label: 'Access' },
                { key: 'hireDate', label: 'Hire Date' },
                { key: 'manager', label: 'Manager' },
              ].map((column) => (
                <th key={column.key} className="px-6 py-4 text-left border-r border-slate-200 last:border-r-0">
                  <button onClick={() => onSort(column.key)} className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
                    <span>{column.label}</span>
                    <Icon name={sortConfig?.key === column.key ? (sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronDown'} size={10} className="opacity-40" />
                  </button>
                </th>
              ))}
              <th className="w-24 px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees?.map((employee, index) => (
              <tr key={employee?.id || employee?._id || `employee-${index}`} className="hover:bg-slate-50 transition-all border-l-4 border-l-transparent hover:border-l-slate-900 group">
                <td className="px-6 py-3 border-r border-slate-100">
                  <input
                    type="checkbox"
                    checked={selectedEmployees?.includes(employee.id || employee._id)}
                    onChange={() => onSelectEmployee(employee.id || employee._id)}
                    className="rounded-none border-slate-400 text-slate-900 focus:ring-0"
                  />
                </td>
                <td className="px-6 py-3 border-r border-slate-100">
                  <div className="flex items-center space-x-4">
                    <EmployeeAvatar employee={employee} size="md" />
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-tight">{employee.name || '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3 border-r border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 font-mono italic">{employee.email || '—'}</span>
                </td>
                <td className="px-6 py-3 border-r border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">{employee.department || '—'}</span>
                </td>
                <td className="px-6 py-3 border-r border-slate-100">
                  <span className="text-[10px] font-black text-slate-800 tracking-widest">{getRoleName(employee.role)}</span>
                </td>
                <td className="px-6 py-3 border-r border-slate-100">
                  {renderStatusDropdown(employee)}
                </td>
                <td className="px-6 py-3 border-r border-slate-100 text-center">
                  {renderPermissionToggle(employee)}
                </td>
                <td className="px-6 py-3 border-r border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 font-mono tracking-tighter">{formatDate(employee.hireDate)}</span>
                </td>
                <td className="px-6 py-3 border-r border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">{employee.manager || 'N/A'}</span>
                </td>
                <td className="px-6 py-3 bg-slate-50/50">
                  <div className="flex items-center justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {[
                      { icon: 'Eye', color: 'hover:bg-slate-900', onClick: () => onViewEmployee(employee) },
                      { icon: 'Edit', color: 'hover:bg-slate-900', onClick: () => onEditEmployee(employee) },
                      { icon: 'Trash2', color: 'hover:bg-rose-600', onClick: () => onDeleteEmployee(employee.id || employee._id) },
                    ].map((btn, i) => (
                       <button key={i} onClick={btn.onClick} className={`p-2 bg-white border border-slate-200 text-slate-400 hover:text-white transition-all shadow-sm ${btn.color}`}>
                        <Icon name={btn.icon} size={12} />
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Industrial List */}
      <div className="lg:hidden divide-y divide-slate-200">
        {employees?.map((employee, index) => (
          <div key={employee?.id || employee?._id || `mobile-employee-${index}`} className="p-6 bg-white hover:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <EmployeeAvatar employee={employee} size="lg" />
                <div>
                  <p className="text-base font-black text-slate-900 uppercase tracking-tighter leading-none">{employee.name || '—'}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{employee.email || '—'}</p>
                </div>
              </div>
              <div className="flex space-x-1">
                <button onClick={() => onViewEmployee(employee)} className="p-2 border border-slate-200 bg-white text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><Icon name="Eye" size={14} /></button>
                <button onClick={() => onEditEmployee(employee)} className="p-2 border border-slate-200 bg-white text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><Icon name="Edit" size={14} /></button>
                <button onClick={() => onDeleteEmployee(employee.id || employee._id)} className="p-2 border border-slate-200 bg-white text-slate-400 hover:bg-rose-600 hover:text-white transition-all"><Icon name="Trash2" size={14} /></button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-6 pt-6 border-t border-slate-100">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Division</p>
                <p className="text-xs font-bold uppercase text-slate-700">{employee.department || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Privileges</p>
                <p className="text-xs font-bold uppercase text-slate-700">{getRoleName(employee.role)}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">State</p>
                {renderStatusDropdown(employee)}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Auth</p>
                <div className="flex items-center h-6">{renderPermissionToggle(employee)}</div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Commencement</p>
                <p className="text-[10px] font-mono text-slate-500 font-bold">{formatDate(employee.hireDate)}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Supervisor</p>
                <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest">{employee.manager || 'PENDING'}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center bg-slate-50/50 p-2 border-dashed border">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedEmployees?.includes(employee.id || employee._id)}
                  onChange={() => onSelectEmployee(employee.id || employee._id)}
                  className="rounded-none border-slate-400 text-slate-900 focus:ring-0"
                />
                <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-slate-900 transition-colors">Select Record</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {(!employees || employees.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/30">
          <div className="w-16 h-16 bg-white border border-slate-200 flex items-center justify-center text-slate-200 mb-6 font-black text-4xl">?</div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">Null Set: Database Empty</h3>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Initiate personnel addition protocol to populate manifest</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;