import React, { useState, useEffect } from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import { getISTDateString } from '../../../utils/dateUtils';
import {
  AttendanceTable,
  AttendanceFilters,
  AttendanceAnalytics,
  AttendanceActions,
  AttendanceHistoryModal,
  AttendanceModal,
  TakeAttendanceModal,
  WFHRequestManager,
  useAttendanceStore
} from 'features/attendance';
import useAuthStore from '../../../store/useAuthStore';
import Icon from '../../../components/AppIcon';

const colorMap = {
  slate: { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-900', icon: 'text-slate-400', label: 'text-slate-400' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', icon: 'text-emerald-600', label: 'text-emerald-600/70' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', icon: 'text-rose-600', label: 'text-rose-600/70' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', icon: 'text-amber-600', label: 'text-amber-600/70' },
  sky: { bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-700', icon: 'text-sky-600', label: 'text-sky-600/70' },
};

const StatCard = ({ label, value, icon, color }) => {
  const c = colorMap[color] || colorMap.slate;
  return (
    <div className={`${c.bg} border ${c.border} p-5 hover:shadow-md transition-all group`}>
      <p className={`text-[11px] font-bold uppercase tracking-widest ${c.label} mb-3 ml-1`}>{label}</p>
      <div className="flex items-center justify-between">
        <span className={`text-3xl font-bold ${c.text} tracking-tight leading-none`}>{value ?? 0}</span>
        <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center ${c.icon} group-hover:scale-110 transition-all border ${c.border}`}>
          <Icon name={icon} size={20} />
        </div>
      </div>
    </div>
  );
};

const AttendanceManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const {
    attendanceData,
    filteredData,
    employees,
    analyticsData,
    loading,
    filters,
    fetchAttendanceData,
    setFilters,
    checkIn,
    checkOut,
    updateRecord,
    createRecord
  } = useAttendanceStore();

  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTakeAttendanceOpen, setIsTakeAttendanceOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyEmployee, setHistoryEmployee] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user?.company?.id) {
      fetchAttendanceData(user.company.id);
    }
  }, [user, isAuthenticated, fetchAttendanceData]);

  const handleCheckIn = async (employeeId) => {
    if (!window.confirm('Are you sure you want to check in this employee?')) return;
    const label = window.prompt('Enter check-in label/reason (e.g. Late check, etc.):');
    if (label === null) return;
    try {
      await checkIn(employeeId, user.company.id, label);
      alert('Check-in successful');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async (attendanceId) => {
    if (!window.confirm('Are you sure you want to check out this employee?')) return;
    const label = window.prompt('Enter check-out label/reason (e.g. Early departure, Finished work, etc.):');
    if (label === null) return;
    const notes = window.prompt('Enter checkout notes (optional):');
    if (notes === null) return;
    try {
      await checkOut(attendanceId, user.company.id, notes, label);
      alert('Check-out successful');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to check out');
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSaveAttendance = async (data) => {
    try {
      await createRecord(data, user.company.id);
      setIsModalOpen(false);
      alert('Attendance record created successfully');
    } catch (error) {
      alert('Failed to create attendance record');
    }
  };

  const handleUpdateAttendance = async (id, data) => {
    try {
      await updateRecord(id, data, user.company.id);
      alert('Attendance record updated successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update attendance record');
    }
  };

  const handleRevoke = async (employeeId) => {
    if (!window.confirm('Are you sure you want to revoke today\'s attendance for this employee? This will delete their current check-in/out record.')) return;
    try {
      await useAttendanceStore.getState().revokeAttendance(employeeId, user.company.id);
      alert('Attendance revoked successfully. Employee can now check in again.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to revoke attendance');
    }
  };

  const handleSaveBulkAttendance = async (records) => {
    try {
      for (const record of records) {
        await createRecord(record, user.company.id);
      }
      setIsTakeAttendanceOpen(false);
      alert('Attendance records saved successfully');
    } catch (error) {
      alert('Failed to save some attendance records');
    }
  };

  const handleViewHistory = (employee) => {
    setHistoryEmployee(employee);
    setIsHistoryModalOpen(true);
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleBulkAction = async (action, employeeIds) => {
    if (!employeeIds || employeeIds.length === 0) {
      alert('Please select employees first');
      return;
    }

    if (action === 'mark_present') {
      const label = window.prompt('Enter label/reason for bulk check-in (e.g. On Time, Training, etc.):');
      if (label === null) return;
      try {
        await useAttendanceStore.getState().bulkCheckIn(employeeIds, user.company.id, 'Bulk Check-in', label);
        alert(`Successfully marked ${employeeIds.length} employees as present`);
      } catch (error) {
        alert('Failed to execute bulk check-in');
      }
    } else if (action === 'mark_half_day') {
      if (!window.confirm(`Mark ${employeeIds.length} selected employee(s) as half-day? This will affect their payroll.`)) return;
      try {
        for (const empId of employeeIds) {
          const today = new Date().toISOString().split('T')[0];
          await useAttendanceStore.getState().updateRecord(empId, { status: 'half-day', notes: 'Marked half-day by admin' }, user.company.id);
        }
        alert(`${employeeIds.length} employee(s) marked as half-day`);
      } catch (error) {
        alert('Failed to mark half-day for some employees');
      }
    } else if (action === 'mark_absent') {
      if (!window.confirm(`Mark ${employeeIds.length} selected employee(s) as absent?`)) return;
      try {
        for (const empId of employeeIds) {
          await useAttendanceStore.getState().updateRecord(empId, { status: 'absent', notes: 'Marked absent by admin' }, user.company.id);
        }
        alert(`${employeeIds.length} employee(s) marked as absent`);
      } catch (error) {
        alert('Failed to mark absent for some employees');
      }
    } else {
      console.log(`Bulk action ${action} for employees:`, employeeIds);
    }
  };

  const handleExportReport = () => {
    console.log('Exporting attendance report...');
    alert('Report generation started');
  };

  const handleManualEntry = () => {
    setIsModalOpen(true);
  };

  const handleTakeAttendance = () => {
    setIsTakeAttendanceOpen(true);
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Attendance Management', path: '/attendance-management' }
  ];

  const attendanceStats = {
    totalEmployees: employees?.length || 0,
    presentToday: attendanceData?.filter((emp) => emp?.hasRecord && emp?.status !== 'not_checked_in')?.length || 0,
    absentToday: employees?.length - (attendanceData?.filter((emp) => emp?.hasRecord && emp?.status !== 'not_checked_in')?.length || 0),
    lateArrivals: attendanceData?.filter((emp) => emp?.hasRecord && emp?.status === 'late')?.length || 0,
    earlyCheckins: attendanceData?.filter((emp) => emp?.hasRecord && emp?.status === 'early_checkin')?.length || 0,
    earlyDepartures: attendanceData?.filter((emp) => emp?.hasRecord && emp?.status === 'early_departure')?.length || 0,
    checkedOutTotal: attendanceData?.filter((emp) => emp?.hasRecord && emp?.checkOutTime && emp?.checkOutTime !== '--')?.length || 0,
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onToggleSidebar={toggleMobileSidebar} />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-8`}>
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-10">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <BreadcrumbNavigation items={breadcrumbItems} />
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight mt-3">Attendance Management</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Track daily presence, check-ins, and productivity metrics.</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all border ${showAnalytics
                  ? 'bg-blue-50 border-blue-100 text-blue-600 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <Icon name="BarChart2" size={16} />
                <span>{showAnalytics ? 'Hide Analytics' : 'Show Analytics'}</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard label="Total Team" value={attendanceStats?.totalEmployees} icon="Users" color="slate" />
            <StatCard label="Present" value={attendanceStats?.presentToday} icon="UserCheck" color="emerald" />
            <StatCard label="Absent" value={attendanceStats?.absentToday} icon="UserX" color="rose" />
            <StatCard label="Late" value={attendanceStats?.lateArrivals} icon="Clock" color="amber" />
            <StatCard label="Early Check-in" value={attendanceStats?.earlyCheckins} icon="Sun" color="sky" />
          </div>

          {/* Analytics Panel */}
          {showAnalytics &&
            <div className="mb-6">
              <AttendanceAnalytics analyticsData={analyticsData} />
            </div>
          }

          {/* Policy Violation Alerts */}


          <div className="space-y-8">
            <WFHRequestManager />
            <AttendanceActions
              selectedEmployees={selectedEmployees}
              onBulkAction={handleBulkAction}
              onExportReport={handleExportReport}
              onManualEntry={handleManualEntry}
              onTakeAttendance={handleTakeAttendance}
              totalRecords={filteredData?.length}
            />
            <AttendanceTable
              attendanceData={filteredData}
              loading={loading}
              selectedEmployees={selectedEmployees}
              onSelectionChange={setSelectedEmployees}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onUpdate={handleUpdateAttendance}
              onRevoke={handleRevoke}
              onViewHistory={handleViewHistory}
            />
          </div>
        </div>

        <AttendanceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveAttendance}
          employees={employees}
        />

        <TakeAttendanceModal
          isOpen={isTakeAttendanceOpen}
          onClose={() => setIsTakeAttendanceOpen(false)}
          onSave={handleSaveBulkAttendance}
          employees={employees}
          existingAttendance={attendanceData}
        />

        <AttendanceHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          employee={historyEmployee}
        />
      </main>
    </div>
  );
};

export default AttendanceManagement;