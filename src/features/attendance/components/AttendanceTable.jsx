import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
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
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 flex-shrink-0`}>
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
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-medium text-white flex-shrink-0 shadow-sm`}
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

  const getStatusBadge = (status, reason) => {
    const statusConfig = {
      present: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Present', icon: 'CheckCircle', iconColor: 'text-emerald-500' },
      absent: { color: 'bg-red-50 text-red-700 border-red-200', label: 'Absent', icon: 'XCircle', iconColor: 'text-red-500' },
      late: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Late', icon: 'Clock', iconColor: 'text-amber-500' },
      early_checkin: { color: 'bg-sky-50 text-sky-700 border-sky-200', label: 'Early In', icon: 'Clock', iconColor: 'text-sky-500' },
      early_departure: { color: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Early Out', icon: 'LogOut', iconColor: 'text-orange-500' },
      not_checked_in: { color: 'bg-gray-50 text-gray-600 border-gray-200', label: 'Not Checked In', icon: 'MinusCircle', iconColor: 'text-gray-400' }
    };

    const config = statusConfig?.[status] || statusConfig?.absent;

    return (
      <div className="flex flex-col items-start gap-1">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${config?.color}`}>
          <Icon name={config?.icon} size={12} className={config?.iconColor} />
          <span>{config?.label}</span>
        </span>
        {reason && (
          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">{reason}</span>
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
      className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150 group"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1.5">
        <span>{children}</span>
        <Icon
          name={sortField === field && sortDirection === 'desc' ? 'ChevronDown' : 'ChevronUp'}
          size={14}
          className={`transition-opacity duration-150 ${
            sortField === field ? 'text-blue-600 opacity-100' : 'text-gray-400 opacity-0 group-hover:opacity-100'
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
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-sm text-gray-500">Loading attendance data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedEmployees?.length === attendanceData?.length && attendanceData?.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <SortableHeader field="employeeName">Employee</SortableHeader>
                <SortableHeader field="department">Department</SortableHeader>
                <SortableHeader field="checkInTime">Check In</SortableHeader>
                <SortableHeader field="checkOutTime">Check Out</SortableHeader>
                <SortableHeader field="workDuration">Work Duration</SortableHeader>
                <SortableHeader field="status">Status</SortableHeader>
                <SortableHeader field="location">Location</SortableHeader>
                <SortableHeader field="productivity">Productivity</SortableHeader>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {sortedData?.map((employee, index) => (
                <tr
                  key={employee?.id || employee?.employeeId || `attendance-row-${index}`}
                  className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer group"
                  onClick={() => handleEmployeeClick(employee)}
                >
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e?.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedEmployees?.includes(employee?.id || employee?.employeeId)}
                      onChange={() => handleSelectEmployee(employee?.id || employee?.employeeId)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <EmployeeAvatar employee={employee} size="md" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{employee?.employeeName || '—'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{employee?.employeeCode || employee?.employeeId || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{employee?.department || '—'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">
                      {formatTime(employee?.checkInTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">
                      {formatTime(employee?.checkOutTime)}
                    </div>
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {employee?.workDuration || '—'}
                    </div>
                    {employee?.overtime && employee?.overtime !== '0m' && employee?.overtime !== '--' && (
                      <div className="text-xs text-orange-600 flex items-center gap-0.5 mt-0.5">
                        <Icon name="Clock" size={10} />
                        +{employee?.overtime} OT
                      </div>
                    )}
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(employee?.status, employee?.reason)}
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Icon
                        name={employee?.location === 'Office' ? 'Building' : employee?.location === 'WFH' ? 'Home' : 'MapPin'}
                        size={14}
                        className="text-gray-400"
                      />
                      <span className="text-sm text-gray-700">{employee?.location || '—'}</span>
                    </div>
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee?.productivity > 0 && (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getProductivityBadge(employee?.productivity)}`}>
                        {employee?.productivity}%
                      </span>
                    )}
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e?.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {!employee.hasRecord ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCheckIn(employee.employeeId || employee.id);
                          }}
                          className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow"
                        >
                          Check In
                        </button>
                      ) : !employee.checkOutTime || employee.checkOutTime === '--' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCheckOut(employee.id || employee.employeeId);
                          }}
                          className="px-3 py-1.5 text-xs font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all shadow-sm hover:shadow"
                        >
                          Check Out
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">Completed</span>
                      )}

                      <button
                        onClick={() => onViewHistory(employee)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        title="View History"
                      >
                        <Icon name="Eye" size={16} />
                      </button>
                    </div>
                   </td>
                 </tr>
              ))}
            </tbody>
          </table>

          {attendanceData?.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Icon name="Users" size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No attendance records found</h3>
              <p className="text-sm text-gray-500">Try adjusting your filters or check back later.</p>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Modal */}
      {showModal && (
        <AttendanceModal
          employee={selectedEmployee}
          onClose={() => {
            setShowModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}
    </>
  );
};

export default AttendanceTable;