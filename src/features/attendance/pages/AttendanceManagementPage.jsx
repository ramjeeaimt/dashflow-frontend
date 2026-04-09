import React, { useState, useEffect } from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
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
    totalEmployees: attendanceData?.length || 0,
    presentToday: attendanceData?.filter((emp) => emp?.status === 'present')?.length || 0,
    absentToday: attendanceData?.filter((emp) => emp?.status === 'absent')?.length || 0,
    lateArrivals: attendanceData?.filter((emp) => emp?.status === 'late')?.length || 0,
    earlyCheckins: attendanceData?.filter((emp) => emp?.status === 'early_checkin')?.length || 0,
    earlyDepartures: attendanceData?.filter((emp) => emp?.status === 'early_departure')?.length || 0,
    avgProductivity: 0 // Placeholder
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={handleToggleSidebar} />
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-20 lg:pb-8`
      }>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <BreadcrumbNavigation items={breadcrumbItems} />
              <h1 className="text-3xl font-semibold text-foreground mb-2">Attendance Management</h1>
              <p className="text-muted-foreground">
                Comprehensive workforce attendance oversight and policy management
              </p>
            </div>

            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-150 ${showAnalytics ?
                  'bg-primary text-primary-foreground' :
                  'bg-card border border-border text-foreground hover:bg-accent'}`
                }>
                <Icon name="BarChart3" size={16} />
                <span className="hidden sm:inline">Analytics</span>
              </button>

              <button
                onClick={fetchAttendanceData}
                className="flex items-center space-x-2 px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-accent transition-colors duration-150">
                <Icon name="RefreshCw" size={16} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Icon name="Users" size={20} className="text-primary" />
                <div>
                  <p className="text-2xl font-semibold text-foreground">{attendanceStats?.totalEmployees}</p>
                  <p className="text-xs text-muted-foreground">Total Records</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Icon name="UserCheck" size={20} className="text-success" />
                <div>
                  <p className="text-2xl font-semibold text-success">{attendanceStats?.presentToday}</p>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Icon name="UserX" size={20} className="text-error" />
                <div>
                  <p className="text-2xl font-semibold text-error">{attendanceStats?.absentToday}</p>
                  <p className="text-xs text-muted-foreground">Absent</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Icon name="Clock" size={20} className="text-warning" />
                <div>
                  <p className="text-2xl font-semibold text-warning">{attendanceStats?.lateArrivals}</p>
                  <p className="text-xs text-muted-foreground">Late</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Icon name="LogOut" size={20} className="text-orange-500" />
                <div>
                  <p className="text-2xl font-semibold text-orange-500">{attendanceStats?.earlyDepartures}</p>
                  <p className="text-xs text-muted-foreground">Early Out</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Icon name="TrendingUp" size={20} className="text-blue-500" />
                <div>
                  <p className="text-2xl font-semibold text-blue-500">--</p>
                  <p className="text-xs text-muted-foreground">Avg Productivity</p>
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