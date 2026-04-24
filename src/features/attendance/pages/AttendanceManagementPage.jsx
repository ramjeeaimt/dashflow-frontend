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
    } else if (action === 'mark_absent') {
      // Logic for mark absent can be added here if needed, 
      // but usually bulk check-in is for present status.
      alert('Bulk mark absent logic coming soon');
    } else {
      console.log(`Bulk action ${action} for employees:`, employeeIds);
      alert(`Action ${action} executed`);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Total Records */}
            <div className="bg-slate-50 border border-slate-100 p-5   hover:shadow-md transition-all group">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">Total Team</p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-slate-900 tracking-tight leading-none">{attendanceStats?.totalEmployees}</span>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                  <Icon name="Users" size={20} />
                </div>
              </div>
            </div>

            {/* Present */}
            <div className="bg-emerald-50 border border-emerald-100 p-5  hover:shadow-md transition-all group">
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600/70 mb-3 ml-1">Present Today</p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-emerald-700 tracking-tight leading-none">{attendanceStats?.presentToday}</span>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-all border border-emerald-100/50">
                  <Icon name="UserCheck" size={20} />
                </div>
              </div>
            </div>

            {/* Inactive */}
            <div className="bg-rose-50 border border-rose-100 p-5  hover:shadow-md transition-all group">
              <p className="text-[11px] font-bold uppercase tracking-widest text-rose-600/70 mb-3 ml-1">Absent</p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-rose-700 tracking-tight leading-none">{attendanceStats?.absentToday}</span>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-600 group-hover:scale-110 transition-all border border-rose-100/50">
                  <Icon name="UserX" size={20} />
                </div>
              </div>
            </div>

            {/* Late */}
            <div className="bg-amber-50 border border-amber-100 p-5  hover:shadow-md transition-all group">
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600/70 mb-3 ml-1">Late </p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-amber-700 tracking-tight leading-none">{attendanceStats?.lateArrivals}</span>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-all border border-amber-100/50">
                  <Icon name="Clock" size={20} />
                </div>
              </div>
            </div>

            {/* Early Out */}
            {/* <div className="bg-orange-50 border border-orange-100 p-5  hover:shadow-md transition-all group">
                <p className="text-[11px] font-bold uppercase tracking-widest text-orange-600/70 mb-3 ml-1">Early Out</p>
                <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-orange-700 tracking-tight leading-none">{attendanceStats?.earlyDepartures}</span>
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-all border border-orange-100/50">
                      <Icon name="LogOut" size={20} />
                    </div>
                </div>
            </div> */}

            {/* Early In */}
            <div className="bg-sky-50 border border-sky-100 p-5 hover:shadow-md transition-all group">
              <p className="text-[11px] font-bold uppercase tracking-widest text-sky-600/70 mb-3 ml-1">Early check-In</p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-sky-700 tracking-tight leading-none">{attendanceStats?.earlyCheckins}</span>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sky-600 group-hover:scale-110 transition-all border border-sky-100/50">
                  <Icon name="Sun" size={20} />
                </div>
              </div>
            </div>

            {/* Checked Out */}
            <div className="bg-slate-100/50 border border-slate-200 p-5  hover:shadow-md transition-all group">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3 ml-1">Checked Out</p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-slate-700 tracking-tight leading-none">{attendanceStats?.checkedOutTotal}</span>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-500 group-hover:scale-110 transition-all border border-slate-200/50">
                  <Icon name="LogOut" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Panel */}
          {showAnalytics &&
            <div className="mb-6">
              <AttendanceAnalytics analyticsData={analyticsData} />
            </div>
          }

          {/* Policy Violation Alerts */}


          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Filters Panel */}
            {/* <div className="xl:col-span-1">
              <AttendanceFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                attendanceData={attendanceData} />
            </div> */}

            {/* Main Content */}
            <div className="xl:col-span-3 space-y-8">
              {/* WFH Requests Manager */}
              <WFHRequestManager />

              {/* Bulk Actions */}
              <AttendanceActions
                selectedEmployees={selectedEmployees}
                onBulkAction={handleBulkAction}
                onExportReport={handleExportReport}
                onManualEntry={handleManualEntry}
                onTakeAttendance={handleTakeAttendance}
                totalRecords={filteredData?.length} />

              {/* Attendance Table */}
              <AttendanceTable
                attendanceData={filteredData}
                loading={loading}
                selectedEmployees={selectedEmployees}
                onSelectionChange={setSelectedEmployees}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                onViewHistory={handleViewHistory}
              />
            </div>
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