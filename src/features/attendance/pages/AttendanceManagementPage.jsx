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
    try {
      await checkIn(employeeId, user.company.id);
      alert('Check-in successful');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async (attendanceId) => {
    if (!window.confirm('Are you sure you want to check out this employee?')) return;
    const notes = window.prompt('Enter checkout notes (optional):');
    if (notes === null) return;
    try {
      await checkOut(attendanceId, user.company.id, notes);
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

  const handleBulkAction = (action, employeeIds) => {
    console.log(`Bulk action ${action} for employees:`, employeeIds);
    alert('Bulk action executed');
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
      <Header />
      <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={handleToggleSidebar} />
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-20 lg:pb-8`}>
        <div className="p-8 max-w-[1600px] mx-auto space-y-12">
          
          {/* Industrial Header Block */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-8 bg-blue-900 text-white border-b-4 border-slate-700 shadow-[8px_8px_0px_rgba(15,23,42,0.1)]">
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                <span className="w-8 h-px bg-slate-700"></span>
                <Icon name="UserCheck" size={14} />
                <span>COMMAND_MODULE: ATTENDANCE_TERMINAL_V4</span>
              </div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">
                Attendance Management
              </h1>
              <div className="flex items-center space-x-4 pt-2">
                <div className="flex items-center space-x-2 px-3 py-1 bg-white/10 text-[10px] font-black uppercase tracking-widest border border-white/10">
                  <span className="w-2 h-2 bg-emerald-500 animate-pulse"></span>
                  <span>Oversight Mode Active</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 border-l border-white/10">
                   Comprehensive workforce oversight and policy management
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 mt-6 lg:mt-0">
               <button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className={`p-3 border transition-all active:translate-y-0.5 group ${
                    showAnalytics ? 'bg-white text-slate-900 border-white' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                  }`}
                  title="Toggle Analytics Matrix"
                >
                  <Icon name="BarChart3" size={18} className="group-hover:scale-110 transition-transform" strokeWidth={3} />
                </button>
                <button
                  onClick={fetchAttendanceData}
                  className="p-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:translate-y-0.5 group"
                  title="Sync Local Data"
                >
                  <Icon name="RefreshCw" size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
                </button>
            </div>
          </div>

          {/* Diagnostic Bar (Quick Stats) */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-0 border border-slate-900 shadow-[12px_12px_0px_rgba(15,23,42,0.05)] bg-slate-50">
            {/* Total Records */}
            <div className="p-4 border-r border-slate-200 space-y-2">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Total_Manifest</p>
                <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-slate-900 tracking-tighter font-mono">{attendanceStats?.totalEmployees}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">UNIT</span>
                </div>
            </div>

            {/* Present */}
            <div className="p-4 border-r border-slate-200 space-y-2 bg-emerald-50/50">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600">Active_Units</p>
                <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-emerald-700 tracking-tighter font-mono">{attendanceStats?.presentToday}</span>
                    <Icon name="UserCheck" size={12} className="text-emerald-500" />
                </div>
            </div>

            {/* Absent */}
            <div className="p-4 border-r border-slate-200 space-y-2 bg-rose-50/50">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-600">Inactive_Units</p>
                <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-rose-700 tracking-tighter font-mono">{attendanceStats?.absentToday}</span>
                    <Icon name="UserX" size={12} className="text-rose-500" />
                </div>
            </div>

            {/* Late */}
            <div className="p-4 border-r border-slate-200 space-y-2">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-600">Late_Arrive</p>
                <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-amber-700 tracking-tighter font-mono">{attendanceStats?.lateArrivals}</span>
                    <Icon name="Clock" size={12} className="text-amber-500" />
                </div>
            </div>

            {/* Early Out */}
            <div className="p-4 border-r border-slate-200 space-y-2">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-600">Early_Departure</p>
                <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-orange-700 tracking-tighter font-mono">{attendanceStats?.earlyDepartures}</span>
                    <Icon name="LogOut" size={12} className="text-orange-500" />
                </div>
            </div>

            {/* Early In */}
            <div className="p-4 border-r border-slate-200 space-y-2">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-600">Early_Incursion</p>
                <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-sky-700 tracking-tighter font-mono">{attendanceStats?.earlyCheckins}</span>
                    <Icon name="Sun" size={12} className="text-sky-500" />
                </div>
            </div>

            {/* Checked Out */}
            <div className="p-4 space-y-2">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Archive_Complete</p>
                <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-slate-700 tracking-tighter font-mono">{attendanceStats?.checkedOutTotal}</span>
                    <Icon name="LogOut" size={12} className="text-slate-400" />
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
            <div className="xl:col-span-3 space-y-6">
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