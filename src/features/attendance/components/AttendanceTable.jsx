import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';

import { getISTDateString } from '../../../utils/dateUtils';
import AppImage from '../../../components/AppImage';
import AttendanceModal from './AttendanceModal';
import EditAttendanceModal from './EditAttendanceModal';
import { Checkbox } from '../../../components/ui/Checkbox';

const DEFAULT_VISIBLE_COLUMNS = {
  employeeName: true,
  department: true,
  checkInTime: true,
  checkOutTime: true,
  workDuration: true,
  status: true,
  label: true,
  notes: true,
  location: true,
  productivity: true
};

const COLUMN_OPTIONS = [
  { key: 'department', label: 'Department' },
  { key: 'checkInTime', label: 'Check In' },
  { key: 'checkOutTime', label: 'Check Out' },
  { key: 'workDuration', label: 'Duration' },
  { key: 'status', label: 'Status' },
  { key: 'label', label: 'Label' },
  { key: 'notes', label: 'Notes' },
  { key: 'location', label: 'Location' },
  { key: 'productivity', label: 'Productivity' }
];

const COLUMN_STORAGE_KEY = 'attendance-table-visible-columns';

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
  onUpdate,
  onViewHistory
}) => {
  const [sortField, setSortField] = useState('employeeName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [attendanceToEdit, setAttendanceToEdit] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS);
  const [draftVisibleColumns, setDraftVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS);
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);

  const handleColumnToggle = (column) => {
    setDraftVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  useEffect(() => {
    try {
      const savedColumns = localStorage.getItem(COLUMN_STORAGE_KEY);
      if (!savedColumns) return;

      const parsedColumns = JSON.parse(savedColumns);
      const normalizedColumns = { ...DEFAULT_VISIBLE_COLUMNS, ...parsedColumns };
      setVisibleColumns(normalizedColumns);
      setDraftVisibleColumns(normalizedColumns);
    } catch (error) {
      console.error('Failed to load saved attendance columns:', error);
    }
  }, []);

  const handleOpenColumnSettings = (event) => {
    event.stopPropagation();
    setDraftVisibleColumns(visibleColumns);
    setIsColumnSettingsOpen(prev => !prev);
  };

  const handleCancelColumnSettings = () => {
    setDraftVisibleColumns(visibleColumns);
    setIsColumnSettingsOpen(false);
  };

  const handleSaveColumnSettings = () => {
    setVisibleColumns(draftVisibleColumns);
    setIsColumnSettingsOpen(false);
    try {
      localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(draftVisibleColumns));
    } catch (error) {
      console.error('Failed to save attendance columns:', error);
    }
  };


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

  const handleEditClick = (event, attendance) => {
    event.stopPropagation();
    setAttendanceToEdit(attendance);
    setShowEditModal(true);
  };

  const handleSaveUpdate = (id, data) => {
    onUpdate(id, data);
    setShowEditModal(false);
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
      wfh: { color: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'WFH', icon: 'Home', iconColor: 'text-indigo-500' },
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
      className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-all duration-150 group"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        <span>{children}</span>
        <Icon
          name={sortField === field && sortDirection === 'desc' ? 'ChevronDown' : 'ChevronUp'}
          size={12}
          className={`transition-opacity duration-150 ${sortField === field ? 'text-blue-600 opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100'
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
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-slate-400">Loading Attendance Records...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-left w-12">
                <input
                  type="checkbox"
                  checked={selectedEmployees?.length === attendanceData?.length && attendanceData?.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-100 transition-all cursor-pointer"
                />
              </th>
              {visibleColumns.employeeName && <SortableHeader field="employeeName">Employee</SortableHeader>}
              {visibleColumns.department && <SortableHeader field="department">Department</SortableHeader>}
              {visibleColumns.checkInTime && <SortableHeader field="checkInTime">Check In</SortableHeader>}
              {visibleColumns.checkOutTime && <SortableHeader field="checkOutTime">Check Out</SortableHeader>}
              {visibleColumns.workDuration && <SortableHeader field="workDuration">Duration</SortableHeader>}
              {visibleColumns.status && <SortableHeader field="status">Status</SortableHeader>}
              {visibleColumns.label && <SortableHeader field="label">Label</SortableHeader>}
              {visibleColumns.notes && <SortableHeader field="notes">Notes</SortableHeader>}
              {visibleColumns.location && <SortableHeader field="location">Location</SortableHeader>}
              {visibleColumns.productivity && <SortableHeader field="productivity">Productivity</SortableHeader>}

              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest relative">
                <div className="flex items-center gap-2">
                  <span>Actions</span>
                  <button
                    onClick={handleOpenColumnSettings}
                    className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-slate-600"
                  >
                    <Icon name="MoreVertical" size={14} />
                  </button>
                </div>

                {isColumnSettingsOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-slate-200 shadow-xl rounded-xl p-4 w-56 text-left">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Display Columns</h4>
                    <div className="space-y-1.5">
                      {COLUMN_OPTIONS.map(col => (
                        <div key={col.key} className="hover:bg-slate-50 px-1.5 py-1 rounded-lg transition-colors">
                          <Checkbox
                            checked={draftVisibleColumns[col.key]}
                            onChange={() => handleColumnToggle(col.key)}
                            label={col.label}
                            size="sm"
                            className="items-center space-x-3"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={handleCancelColumnSettings}
                        className="px-3 py-1.5 text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveColumnSettings}
                        className="px-3 py-1.5 text-[11px] font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </th>


            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-50">
            {sortedData?.map((employee, index) => (
              <tr
                key={employee?.id || employee?.employeeId || `attendance-row-${index}`}
                className="hover:bg-blue-50/30 transition-colors duration-150 cursor-pointer group"
                onClick={() => handleEmployeeClick(employee)}
              >
                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e?.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedEmployees?.includes(employee?.id || employee?.employeeId)}
                    onChange={() => handleSelectEmployee(employee?.id || employee?.employeeId)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-100 transition-all cursor-pointer"
                  />
                </td>
                {visibleColumns.employeeName && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <EmployeeAvatar employee={employee} size="md" />
                      <div>
                        <div className="text-sm font-bold text-slate-900 tracking-tight">{employee?.employeeName || '—'}</div>
                      </div>
                    </div>
                  </td>
                )}
                {visibleColumns.department && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">{employee?.department || 'Not Assigned'}</span>
                  </td>
                )}
                {visibleColumns.checkInTime && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm text-slate-900 font-bold">
                        {formatTime(employee?.checkInTime)}
                      </div>
                      {employee?.checkInTime && employee?.checkInTime !== '--' && (
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {getRelativeTime(employee.checkInTime, employee.date)}
                        </div>
                      )}
                    </div>
                  </td>
                )}
                {visibleColumns.checkOutTime && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900 font-bold">
                      {formatTime(employee?.checkOutTime)}
                    </div>
                  </td>
                )}
                {visibleColumns.workDuration && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">
                      {employee?.workDuration || '—'}
                    </div>
                    {employee?.overtime && employee?.overtime !== '0m' && employee?.overtime !== '--' && (
                      <div className="text-[10px] font-bold text-blue-600 flex items-center gap-1 mt-0.5">
                        <Icon name="Plus" size={10} />
                        {employee?.overtime} OT
                      </div>
                    )}
                  </td>
                )}
                {visibleColumns.status && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col items-start gap-1">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-[10px] font-bold uppercase tracking-wider border ${employee?.status === 'present' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' :
                        employee?.status === 'late' ? 'border-amber-100 bg-amber-50 text-amber-700' :
                          employee?.status === 'absent' ? 'border-rose-100 bg-rose-50 text-rose-700' :
                            employee?.status === 'wfh' ? 'border-indigo-100 bg-indigo-50 text-indigo-700' :
                              'border-slate-100 bg-slate-50 text-slate-600'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-none ${employee?.status === 'present' ? 'bg-emerald-500' :
                          employee?.status === 'late' ? 'bg-amber-500' :
                            employee?.status === 'absent' ? 'bg-rose-500' :
                              employee?.status === 'wfh' ? 'bg-indigo-500' : 'bg-slate-400'
                          }`}></div>
                        {employee?.status?.replace('_', ' ')}
                      </span>
                    </div>

                  </td>
                )}
                {visibleColumns.label && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee?.label ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-tight">
                        {employee.label}
                      </span>
                    ) : <span className="text-xs font-bold text-slate-300">—</span>}
                  </td>
                )}
                {/* {visibleColumns.notes && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee?.notes ? (
                      <div className="max-w-[250px] overflow-hidden text-ellipsis">
                         {employee.notes.split('|').map((note, i) => {
                            const isEditLog = note.includes('[Edited on');
                            return (
                                <div key={i} className={`text-[10px] truncate ${isEditLog ? 'text-blue-600 font-bold' : 'text-slate-500 font-medium'}`}>
                                    {note.trim()}
                                </div>
                            );
                         })}
                      </div>
                    ) : <span className="text-xs font-bold text-slate-300">—</span>}
                  </td>
                )} */}
                {visibleColumns.location && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Icon
                        name={employee?.location === 'Office' ? 'Building' : employee?.location === 'WFH' ? 'Home' : 'MapPin'}
                        size={14}
                        className="text-slate-400"
                      />
                      <span className="text-xs font-semibold">{employee?.location || '—'}</span>
                    </div>
                  </td>
                )}
                {visibleColumns.productivity && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee?.productivity > 0 ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${employee.productivity >= 80 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${employee?.productivity}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-700">{employee?.productivity}%</span>
                      </div>
                    ) : <span className="text-xs font-bold text-slate-300">—</span>}
                  </td>
                )}

                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e?.stopPropagation()}>
                  <div className="flex items-center gap-3">
                    {!employee.hasRecord ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCheckIn(employee.employeeId || employee.id);
                        }}
                        className="px-4 py-1.5 text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider rounded-none hover:bg-blue-700 transition-all shadow-sm"
                      >
                        Check In
                      </button>
                    ) : !employee.checkOutTime || employee.checkOutTime === '--' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCheckOut(employee.id || employee.employeeId);
                        }}
                        className="px-4 py-1.5 text-[10px] font-bold bg-white border border-slate-200 text-slate-700 uppercase tracking-wider rounded-none hover:bg-slate-50 transition-all shadow-sm"
                      >
                        Check Out
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1 rounded-none uppercase tracking-wider">Done</span>
                    )}

                    {employee.hasRecord && (
                      <button
                        onClick={(e) => handleEditClick(e, employee)}
                        className="p-2 bg-amber-50 border border-amber-100 text-amber-500 hover:text-amber-700 hover:bg-amber-100 transition-all rounded-none"
                        title="Edit Record"
                      >
                        <Icon name="Edit" size={14} />
                      </button>
                    )}

                    <button
                      onClick={() => onViewHistory(employee)}
                      className="p-2 bg-slate-50 border border-slate-100 text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all rounded-none"
                      title="View Details"
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
          <div className="text-center py-24 bg-slate-50/10">
            <div className="w-16 h-16 mx-auto mb-6 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm text-slate-200">
              <Icon name="Users" size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">No attendance records</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">Try adjusting your filters to find what you're looking for.</p>
          </div>
        )}
      </div>

      <EditAttendanceModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveUpdate}
        attendance={attendanceToEdit}
      />
    </div>
  );
};

export default AttendanceTable;
