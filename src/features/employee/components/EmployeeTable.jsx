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
    const colors = ['#4f46e5', '#3b82f6', '#0ea5e9', '#6366f1'];
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
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-muted flex-shrink-0 border border-border shadow-sm`}>
        <img
          src={avatarUrl}
          alt={employee?.name || 'Employee'}
          className="w-full h-full object-cover transition-all duration-300"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 border-2 border-white shadow-sm ring-1 ring-slate-200`}
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
  onSort,
  loading
}) => {
  const [roles, setRoles] = useState([]);
  const [rolesMap, setRolesMap] = useState({});
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    email: true,
    department: true,
    status: true,
    hireDate: true,
    manager: true
  });
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);

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
    if (!role) return 'Personnel';
    if (typeof role === 'object' && role.name) return role.name;
    if (typeof role === 'object' && role.title) return role.title;
    if (typeof role === 'string') {
      const roleName = rolesMap[role];
      return roleName || role;
    }
    return 'Personnel';
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
      toast.success(`Status updated: ${newStatus}`, { id: toastId });
    } catch (error) {
      toast.error("Failed to update status", { id: toastId });
    }
  };



  const renderStatusDropdown = (employee) => {
    const statusConfig = {
      [EmployeeStatus.ACTIVE]: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      [EmployeeStatus.PENDING]: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      [EmployeeStatus.INACTIVE]: { bg: 'bg-muted/60', text: 'text-muted-foreground', border: 'border-border' },
      [EmployeeStatus.ON_LEAVE]: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-border' },
      [EmployeeStatus.TERMINATED]: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    };
    const config = statusConfig[employee.status] || statusConfig[EmployeeStatus.ACTIVE];
    return (
      <div className="relative group/status">
        <select
          value={employee.status}
          onChange={(e) => handleStatusUpdate(employee.id || employee._id, e.target.value)}
          className={`appearance-none px-3 py-1 text-[11px] font-bold rounded-full border ${config.border} cursor-pointer outline-none transition-all ${config.bg} ${config.text} pr-6 hover:shadow-sm`}
        >
          {Object.values(EmployeeStatus).map((status) => (
            <option key={status} value={status} className="bg-card text-foreground font-medium">{status}</option>
          ))}
        </select>
        <div className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${config.text} opacity-60`}>
          <Icon name="ChevronDown" size={10} />
        </div>
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-card overflow-hidden">
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="w-12 px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedEmployees?.length === employees?.length && employees?.length > 0}
                  onChange={onSelectAll}
                  className="rounded-md border-border text-primary focus:ring-ring/20 h-4 w-4 transition-all"
                />
              </th>
              {[
                { key: 'name', label: 'Employee' },
                { key: 'email', label: 'Email' },
                { key: 'department', label: 'Department' },
                { key: 'role', label: 'Role' },
                { key: 'status', label: 'Status' },
                { key: 'hireDate', label: 'Hire Date' },
                { key: 'manager', label: 'Manager' },
              ].filter(col => visibleColumns[col.key]).map((column) => (
                <th key={column.key} className="px-6 py-4 text-left">
                  <button onClick={() => onSort(column.key)} className="flex items-center space-x-2 text-[11px] font-bold text-muted-foreground/70 group hover:text-muted-foreground transition-colors">
                    <span className="tracking-tight uppercase">{column.label}</span>
                    <Icon name={sortConfig?.key === column.key ? (sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronDown'} size={12} className={`transition-opacity ${sortConfig?.key === column.key ? 'opacity-100 text-primary' : 'opacity-30'}`} />
                  </button>
                </th>
              ))}
              <th className="w-24 px-6 py-4 text-center bg-muted/80 relative">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-[11px] font-bold text-muted-foreground/70 tracking-tight uppercase">Actions</span>
                  <button
                    onClick={() => setIsColumnSettingsOpen(!isColumnSettingsOpen)}
                    className="p-1 hover:bg-border rounded-md transition-colors text-muted-foreground/70 hover:text-muted-foreground"
                    title="Column Visibility"
                  >
                    <Icon name="MoreVertical" size={14} />
                  </button>
                </div>

                {/* Column Toggle Dropdown */}
                {isColumnSettingsOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border shadow-sm rounded-xl p-4 w-48 text-left">
                    <h4 className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide mb-3 px-1">Display Columns</h4>
                    <div className="space-y-2">
                      {[
                        { key: 'email', label: 'Email' },
                        { key: 'department', label: 'Department' },
                        { key: 'role', label: 'Role' },
                        { key: 'status', label: 'Status' },
                        { key: 'hireDate', label: 'Hire Date' },
                        { key: 'manager', label: 'Manager' },
                      ].map(col => (
                        <label key={col.key} className="flex items-center space-x-3 cursor-pointer hover:bg-muted/60 p-1.5 rounded-lg transition-colors group">
                          <input
                            type="checkbox"
                            checked={visibleColumns[col.key]}
                            onChange={() => setVisibleColumns(prev => ({ ...prev, [col.key]: !prev[col.key] }))}
                            className="rounded border-border text-primary focus:ring-ring/20 h-3.5 w-3.5"
                          />
                          <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground">{col.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {employees?.map((employee, index) => (
              <tr key={employee?.id || employee?._id || `employee-${index}`} className="hover:bg-primary/30 transition-all group">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedEmployees?.includes(employee.id || employee._id)}
                    onChange={() => onSelectEmployee(employee.id || employee._id)}
                    className="rounded-md border-border text-primary focus:ring-ring/20 h-4 w-4 transition-all"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4 cursor-pointer" onClick={() => onViewEmployee(employee)}>
                    <EmployeeAvatar employee={employee} size="md" />
                    <div>
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight">{employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || '—'}</p>
                      {employee.employeeCode ? (
                        <p className="text-[10px] text-muted-foreground/70 font-bold uppercase mt-1">{employee.employeeCode}</p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground/70 font-bold uppercase mt-1 opacity-60 flex items-center gap-1">
                          <Icon name="AlertCircle" size={10} /> ID Not Set
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                {visibleColumns.email && (
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-muted-foreground">{employee.email || '—'}</span>
                  </td>
                )}
                {visibleColumns.department && (
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-400 transition-colors"></div>
                      <span className="text-xs font-semibold text-foreground capitalize">{employee.department?.name || (typeof employee.department === 'string' ? employee.department : '—')}</span>
                    </div>
                  </td>
                )}
                {visibleColumns.role && (
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-muted-foreground">{getRoleName(employee.role)}</span>
                  </td>
                )}
                {visibleColumns.status && (
                  <td className="px-6 py-4">
                    {renderStatusDropdown(employee)}
                  </td>
                )}

                {visibleColumns.hireDate && (
                  <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                    {formatDate(employee.hireDate)}
                  </td>
                )}
                {visibleColumns.manager && (
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-muted-foreground">{employee.manager || 'N/A'}</span>
                  </td>
                )}
                <td className="px-6 py-4 bg-muted/30">
                  <div className="flex items-center justify-center gap-1.5">
                    {[
                      { icon: 'Eye', label: 'View', color: 'hover:bg-primary hover:border-primary', onClick: () => onViewEmployee(employee) },
                      { icon: 'Pencil', label: 'Edit', color: 'hover:bg-sidebar hover:border-sidebar', onClick: () => onEditEmployee(employee) },
                      { icon: 'Trash2', label: 'Delete', color: 'hover:bg-error hover:border-error', onClick: () => onDeleteEmployee(employee.id || employee._id) },
                    ].map((btn, i) => (
                      <button
                        key={i}
                        onClick={btn.onClick}
                        title={btn.label}
                        aria-label={btn.label}
                        className={`p-2 bg-card border border-border rounded-md text-muted-foreground hover:text-white transition-colors ${btn.color}`}
                      >
                        <Icon name={btn.icon} size={15} />
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Feed Style */}
      <div className="lg:hidden divide-y divide-border">
        {employees?.map((employee, index) => (
          <div key={employee?.id || employee?._id || `mobile-employee-${index}`} className="p-5 bg-card hover:bg-muted/60 transition-colors">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center space-x-4">
                <EmployeeAvatar employee={employee} size="lg" />
                <div>
                  <p className="text-base font-bold text-foreground">{employee.name || '—'}</p>
                  {employee.employeeCode ? (
                    <p className="text-[10px] text-primary font-bold uppercase mt-0.5">{employee.employeeCode}</p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground/70 font-bold uppercase mt-0.5 opacity-60 flex items-center gap-1">
                      <Icon name="AlertCircle" size={10} /> ID Not Set
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground/70 font-medium mt-0.5">{employee.email || '—'}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => onViewEmployee(employee)} aria-label="View" className="p-2 border border-border bg-card rounded-md text-muted-foreground hover:bg-primary hover:border-primary hover:text-white transition-colors"><Icon name="Eye" size={16} /></button>
                <button onClick={() => onEditEmployee(employee)} aria-label="Edit" className="p-2 border border-border bg-card rounded-md text-muted-foreground hover:bg-sidebar hover:border-sidebar hover:text-white transition-colors"><Icon name="Pencil" size={16} /></button>
                <button onClick={() => onDeleteEmployee(employee.id || employee._id)} aria-label="Delete" className="p-2 border border-border bg-card rounded-md text-muted-foreground hover:bg-error hover:border-error hover:text-white transition-colors"><Icon name="Trash2" size={16} /></button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-50">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-tight mb-1">Department</p>
                <p className="text-sm font-semibold capitalize text-foreground">{employee.department?.name || (typeof employee.department === 'string' ? employee.department : '—')}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-tight mb-1">Role</p>
                <p className="text-sm font-semibold text-foreground">{getRoleName(employee.role)}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-tight mb-1">Status</p>
                {renderStatusDropdown(employee)}
              </div>


              <div>
                <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-tight mb-1">Hired On</p>
                <p className="text-[11px] text-muted-foreground font-semibold">{formatDate(employee.hireDate)}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-tight mb-1">Manager</p>
                <p className="text-xs font-bold text-muted-foreground">{employee.manager || 'Unassigned'}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center">
              <label className="flex items-center space-x-3 cursor-pointer group w-full">
                <input
                  type="checkbox"
                  checked={selectedEmployees?.includes(employee.id || employee._id)}
                  onChange={() => onSelectEmployee(employee.id || employee._id)}
                  className="rounded-md border-border text-primary focus:ring-ring/20 h-4 w-4 transition-all"
                />
                <span className="text-xs font-bold text-muted-foreground/70 group-hover:text-foreground transition-colors uppercase tracking-tight">Select Record</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {(!employees || employees.length === 0) && !loading && (
        <div className="flex flex-col items-center justify-center py-24 bg-muted/30">
          <div className="w-16 h-16 bg-card rounded-lg border border-border flex items-center justify-center text-slate-200 mb-6 shadow-sm">
            <Icon name="Users" size={32} />
          </div>
          <h3 className="text-base font-bold text-foreground mb-2">No employees found</h3>
          <p className="text-sm text-muted-foreground/70 font-medium">Add some team members to see them here.</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;