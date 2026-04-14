import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { getISTDateString } from '../../../utils/dateUtils';
import AppImage from '../../../components/AppImage';
import AttendanceModal from './AttendanceModal';

// Avatar Component with fallback logic
const EmployeeAvatar = ({ employee, size = 'md' }) => {
  const [imageError, setImageError] = useState(false);
  
  const getInitials = () => {
    const name = employee?.employeeName || '';
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
    
    const name = employee?.employeeName || '';
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
      <div className={`${sizeClasses[size]} rounded-none overflow-hidden bg-gray-100 flex-shrink-0`}>
        <img
          src={avatarUrl}
          alt={employee?.employeeName || 'Employee'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div 
      className={`${sizeClasses[size]} rounded-none flex items-center justify-center font-medium text-white flex-shrink-0 shadow-sm`}
      style={{ backgroundColor: getColorFromName() }}
    >
      {getInitials() || '?'}
    </div>
  );
};

const AttendanceTable = ({
  attendanceData,
  loading,
  selectedEmployees,
  onSelectionChange,
  onCheckIn,
  onCheckOut,
  onViewHistory
}) => {
  const [sortField, setSortField] = useState('employeeName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedEmployees?.length === attendanceData?.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(attendanceData?.map(emp => emp?.id || emp?.employeeId));
    }
  };

  const handleSelectEmployee = (id) => {
    if (selectedEmployees?.includes(id)) {
      onSelectionChange(selectedEmployees?.filter(empId => empId !== id));
    } else {
      onSelectionChange([...selectedEmployees, id]);
    }
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const getRelativeTime = (timeStr, dateStr) => {
    if (!timeStr || timeStr === '--') return '';
    try {
      const recordDate = new Date(dateStr);
      const [hours, minutes] = timeStr.split(':');
      recordDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const now = new Date();
      const diffMs = now - recordDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24 && recordDate.getDate() === now.getDate()) return `${diffHours}h ago`;
      if (diffDays === 1 || (diffHours < 48 && recordDate.getDate() === now.getDate() - 1)) return '1 day ago';
      return `${diffDays} days ago`;
    } catch (e) {
      return '';
    }
  };

  const getStatusBadge = (status, reason, dateStr) => {
    const today = getISTDateString();
    const isToday = dateStr === today;
    
    // Finalized status logic: after 24h, late/early_checkin/early_departure show as 'Present'
    let effectiveStatus = status;
    if (!isToday && ['late', 'early_checkin', 'early_departure'].includes(status)) {
      effectiveStatus = 'present';
    }

    const statusConfig = {
      present: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Present', icon: 'CheckCircle', iconColor: 'text-emerald-500' },
      absent: { color: 'bg-red-50 text-red-700 border-red-200', label: 'Absent', icon: 'XCircle', iconColor: 'text-red-500' },
      late: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Late', icon: 'Clock', iconColor: 'text-amber-500' },
      early_checkin: { color: 'bg-sky-50 text-sky-700 border-sky-200', label: 'Early In', icon: 'Clock', iconColor: 'text-sky-500' },
      early_departure: { color: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Early Out', icon: 'LogOut', iconColor: 'text-orange-500' },
      not_checked_in: { color: 'bg-gray-50 text-gray-600 border-gray-200', label: 'Not Checked In', icon: 'MinusCircle', iconColor: 'text-gray-400' }
    };

    const config = statusConfig?.[effectiveStatus] || statusConfig?.absent;

    return (
      <div className="flex flex-col items-start gap-1">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-medium border ${config?.color}`}>
          <Icon name={config?.icon} size={12} className={config?.iconColor} />
          <span>{config?.label} {effectiveStatus !== status && `(${status.replace('_', ' ')})`}</span>
        </span>
        {reason && (
          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-none">{reason}</span>
        )}
      </div>
    );
  };

  const getProductivityBadge = (productivity) => {
    if (productivity >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (productivity >= 75) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (productivity >= 60) return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  const sortedData = [...(attendanceData || [])]?.sort((a, b) => {
    let aValue = a?.[sortField];
    let bValue = b?.[sortField];

    if (typeof aValue === 'string') {
      aValue = aValue?.toLowerCase();
      bValue = bValue?.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const SortableHeader = ({ field, children }) => (
    <th
      className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:bg-slate-900 hover:text-white transition-colors duration-150 group border-r border-slate-900 last:border-r-0"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        <span>{children}</span>
        <Icon
          name={sortField === field && sortDirection === 'desc' ? 'ChevronDown' : 'ChevronUp'}
          size={12}
          strokeWidth={3}
          className={`transition-opacity duration-150 ${
            sortField === field ? 'text-white opacity-100' : 'text-slate-600 opacity-0 group-hover:opacity-100'
          }`}
        />
      </div>
    </th>
  );

  const formatTime = (timeString) => {
    if (!timeString || timeString === '--') return '--';
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
      return timeString;
    }
  };

  if (loading) {
    return (
      <div className="bg-white border-2 border-slate-900 rounded-none shadow-[8px_8px_0px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 border-4 border-slate-900 border-t-transparent animate-spin"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing_Records...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-slate-900 rounded-none overflow-hidden shadow-[12px_12px_0px_rgba(15,23,42,0.05)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y-2 divide-slate-900">
          <thead className="bg-slate-50">
            <tr className="divide-x border-b-2 border-slate-900">
              <th className="px-6 py-4 text-left w-12 bg-slate-100 border-r border-slate-900 text-slate-400 hover:bg-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedEmployees?.length === attendanceData?.length && attendanceData?.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded-none border-2 border-slate-900 text-slate-900 focus:ring-0 cursor-pointer"
                />
              </th>
              <SortableHeader field="employeeName">Unit_Identity</SortableHeader>
              <SortableHeader field="department">Division</SortableHeader>
              <SortableHeader field="checkInTime">Check_In</SortableHeader>
              <SortableHeader field="checkOutTime">Check_Out</SortableHeader>
              <SortableHeader field="workDuration">Duration</SortableHeader>
              <SortableHeader field="status">Status_Code</SortableHeader>
              <SortableHeader field="location">Sector</SortableHeader>
              <SortableHeader field="productivity">Efficiency</SortableHeader>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Protocols
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y-2 divide-slate-100">
            {sortedData?.map((employee, index) => (
              <tr
                key={employee?.id || employee?.employeeId || `attendance-row-${index}`}
                className="hover:bg-slate-50 transition-colors duration-150 cursor-pointer group divide-x divide-slate-100"
                onClick={() => handleEmployeeClick(employee)}
              >
                <td className="px-6 py-4 whitespace-nowrap bg-slate-50/30 border-r border-slate-100" onClick={(e) => e?.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedEmployees?.includes(employee?.id || employee?.employeeId)}
                    onChange={() => handleSelectEmployee(employee?.id || employee?.employeeId)}
                    className="w-4 h-4 rounded-none border-2 border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                        <EmployeeAvatar employee={employee} size="md" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white"></div>
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900 uppercase tracking-tighter">{employee?.employeeName || '—'}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 font-mono">{employee?.employeeCode || employee?.employeeId || '—'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-100 px-2 py-1">{employee?.department || 'EMPTY_SECTOR'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm text-slate-900 font-black font-mono">
                      {formatTime(employee?.checkInTime)}
                    </div>
                    {employee?.checkInTime && employee?.checkInTime !== '--' && (
                      <div className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
                        T-{getRelativeTime(employee.checkInTime, employee.date)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-l border-slate-100">
                  <div className="text-sm text-slate-900 font-black font-mono">
                    {formatTime(employee?.checkOutTime)}
                  </div>
                 </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-black text-slate-900 font-mono">
                    {employee?.workDuration || '—'}
                  </div>
                  {employee?.overtime && employee?.overtime !== '0m' && employee?.overtime !== '--' && (
                    <div className="text-[9px] font-black text-orange-600 flex items-center gap-1 mt-1 uppercase tracking-widest">
                      <Icon name="Clock" size={10} strokeWidth={3} />
                      {employee?.overtime} OT_MODE
                    </div>
                  )}
                 </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col items-start gap-1">
                        <span className={`inline-flex items-center gap-2 px-2.5 py-1.5 border-2 text-[9px] font-black uppercase tracking-widest ${
                            employee?.status === 'present' ? 'border-emerald-900 bg-emerald-50 text-emerald-900' :
                            employee?.status === 'late' ? 'border-amber-900 bg-amber-50 text-amber-900' :
                            employee?.status === 'absent' ? 'border-rose-900 bg-rose-50 text-rose-900' :
                            'border-slate-900 bg-slate-50 text-slate-900'
                        }`}>
                            <div className={`w-2 h-2 ${
                                employee?.status === 'present' ? 'bg-emerald-600' :
                                employee?.status === 'late' ? 'bg-amber-600' :
                                employee?.status === 'absent' ? 'bg-rose-600' : 'bg-slate-400'
                            }`}></div>
                            {employee?.status?.replace('_', ' ')}
                        </span>
                        {employee?.reason && (
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">{employee?.reason}</span>
                        )}
                    </div>
                 </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 border border-slate-200 w-fit">
                    <Icon
                      name={employee?.location === 'Office' ? 'Building' : employee?.location === 'WFH' ? 'Home' : 'MapPin'}
                      size={12}
                      className="text-slate-400"
                      strokeWidth={3}
                    />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{employee?.location || '—'}</span>
                  </div>
                 </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {employee?.productivity > 0 && (
                    <div className="flex items-center space-x-2">
                         <div className="w-16 h-2 bg-slate-100 border border-slate-200">
                            <div className="h-full bg-slate-900" style={{ width: `${employee?.productivity}%` }}></div>
                         </div>
                         <span className="text-[10px] font-black font-mono text-slate-900">{employee?.productivity}%</span>
                    </div>
                  )}
                 </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e?.stopPropagation()}>
                  <div className="flex items-center gap-3">
                    {!employee.hasRecord ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCheckIn(employee.employeeId || employee.id);
                        }}
                        className="px-4 py-2 text-[9px] font-black bg-slate-900 text-white uppercase tracking-[0.2em] shadow-[4px_4px_0px_rgba(15,23,42,0.15)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                      >
                        Check_In
                      </button>
                    ) : !employee.checkOutTime || employee.checkOutTime === '--' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCheckOut(employee.id || employee.employeeId);
                        }}
                        className="px-4 py-2 text-[9px] font-black bg-white border-2 border-slate-900 text-slate-900 uppercase tracking-[0.2em] shadow-[4px_4px_0px_rgba(15,23,42,0.1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                      >
                        Check_Out
                      </button>
                    ) : (
                      <span className="text-[9px] font-black text-slate-400 bg-slate-50 border-2 border-slate-100 px-3 py-1.5 uppercase tracking-widest italic">Completed</span>
                    )}

                    <button
                      onClick={() => onViewHistory(employee)}
                      className="p-2 bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-white hover:border-slate-900 transition-all active:translate-y-0.5"
                      title="Inspect Logs"
                    >
                      <Icon name="Eye" size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                 </td>
               </tr>
            ))}
          </tbody>
        </table>

        {attendanceData?.length === 0 && (
          <div className="text-center py-24 bg-slate-50/50">
            <div className="w-24 h-24 mx-auto mb-6 bg-white border-4 border-slate-900 flex items-center justify-center shadow-[8px_8px_0px_rgba(0,0,0,0.05)]">
              <Icon name="Users" size={32} className="text-slate-900" strokeWidth={3} />
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Null_Record_Set_Detected</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Adjust search parameters or check connection</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTable;