import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import AttendanceTable from './components/AttendanceTable';
import AttendanceFilters from './components/AttendanceFilters';
import AttendanceAnalytics from './components/AttendanceAnalytics';
import AttendanceActions from './components/AttendanceActions';

import AttendanceHistoryModal from './components/AttendanceHistoryModal';
import AttendanceModal from './components/AttendanceModal';
import TakeAttendanceModal from './components/TakeAttendanceModal';
import Icon from '../../components/AppIcon';
import attendanceService from '../../services/attendanceService';
import employeeService from '../../services/employeeService';
import useAuthStore from '../../store/useAuthStore';

const AttendanceManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: 'today',
    department: 'all',
    status: 'all',
    location: 'all'
  });
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTakeAttendanceOpen, setIsTakeAttendanceOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyEmployee, setHistoryEmployee] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user?.company?.id) {
      fetchAttendanceData();
      fetchEmployees();
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    applyFilters();
  }, [filters, attendanceData]);

  const fetchAttendanceData = async () => {
    if (!isAuthenticated || !user?.company?.id) return;

    setLoading(true);
    try {
      const [attendanceRecords, employeesList, analytics] = await Promise.all([
        attendanceService.getAll({ companyId: user?.company?.id }),
        employeeService.getAll({ companyId: user?.company?.id }),
        attendanceService.getAnalytics({ companyId: user?.company?.id })
      ]);

      setAnalyticsData(analytics);

      const validEmployees = Array.isArray(employeesList) ? employeesList : employeesList?.data || [];
      setEmployees(validEmployees);

      const validAttendance = Array.isArray(attendanceRecords) ? attendanceRecords : attendanceRecords?.data || [];

      // Create a map of attendance records for easier lookup
      const attendanceMap = new Map();
      if (Array.isArray(validAttendance)) {
        validAttendance.forEach(record => {
          // Only map today's attendance for the main view, or filter by date if needed
          // For now, we assume the backend returns relevant records based on filters
          // If filters.dateRange is 'today', we match by date
          const recordDate = new Date(record.date).toISOString().split('T')[0];
          const todayDate = new Date().toISOString().split('T')[0];

          if (recordDate === todayDate) {
            attendanceMap.set(record.employee?.id, record);
          }
        });
      }

      // Merge employees with attendance data
      const mergedData = validEmployees.map(emp => {
        const record = attendanceMap.get(emp.id);
        return {
          id: record?.id || `temp-${emp.id}`, // Use temp ID if no record
          employeeId: emp.id,
          employeeName: `${emp.user?.firstName} ${emp.user?.lastName}`,
          department: emp.department?.name || 'N/A',
          checkInTime: record?.checkInTime || '--',
          checkOutTime: record?.checkOutTime || '--',
          workDuration: record?.workHours ? `${Math.floor(parseFloat(record.workHours))}h ${Math.round((parseFloat(record.workHours) % 1) * 60)}m` : '--',
          breakDuration: '0m',
          status: record?.status || 'not_checked_in',
          location: record?.location || 'Office',
          date: record?.date || new Date().toISOString().split('T')[0],
          profileImage: emp.user?.avatar,
          alt: `${emp.user?.firstName}'s profile`,
          overtime: '0m',
          productivity: 0,
          hasRecord: !!record
        };
      });

      setAttendanceData(mergedData);
      setFilteredData(mergedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    // Already handled in fetchAttendanceData
  };

  const applyFilters = () => {
    let filtered = [...attendanceData];

    // Apply department filter
    if (filters?.department !== 'all') {
      filtered = filtered?.filter((emp) => emp?.department === filters?.department);
    }

    // Apply status filter
    if (filters?.status !== 'all') {
      if (filters.status === 'absent') {
        // Include 'not_checked_in' as absent for filtering purposes if desired, 
        // or strictly match 'absent' status from DB
        filtered = filtered?.filter((emp) => emp?.status === 'absent' || emp?.status === 'not_checked_in');
      } else {
        filtered = filtered?.filter((emp) => emp?.status === filters?.status);
      }
    }

    // Apply location filter
    if (filters?.location !== 'all') {
      filtered = filtered?.filter((emp) => emp?.location === filters?.location);
    }

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered?.filter(emp =>
        emp.employeeName.toLowerCase().includes(searchLower) ||
        emp.employeeId.toLowerCase().includes(searchLower)
      );
    }

    setFilteredData(filtered);
  };

  const handleCheckIn = async (employeeId) => {
    if (!window.confirm('Are you sure you want to check in this employee?')) return;

    try {
      await attendanceService.checkIn(employeeId, 'Office', 'Manual Check-in');
      fetchAttendanceData(); // Refresh data
      alert('Check-in successful');
    } catch (error) {
      console.error('Check-in error:', error);
      const message = error.response?.data?.message || 'Failed to check in';
      alert(message);
    }
  };

  const handleCheckOut = async (attendanceId) => {
    if (!window.confirm('Are you sure you want to check out this employee?')) return;

    const notes = window.prompt('Enter checkout notes (optional):');
    if (notes === null) return; // User cancelled

    try {
      console.log('[AttendanceManagement] Calling checkOut with ID:', attendanceId);
      await attendanceService.checkOut(attendanceId, notes || 'Manual Check-out');
      fetchAttendanceData(); // Refresh data
      alert('Check-out successful');
    } catch (error) {
      console.error('Check-out error:', error);
      const message = error.response?.data?.message || 'Failed to check out';
      alert(message);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleBulkAction = (action) => {
    if (selectedEmployees?.length === 0) {
      alert('Please select employees first');
      return;
    }
    console.log(`Performing ${action} on employees:`, selectedEmployees);
    setSelectedEmployees([]);
  };

  const handleExportReport = (format) => {
    console.log(`Exporting report in ${format} format`);
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleManualEntry = () => {
    setIsModalOpen(true);
  };

  const handleTakeAttendance = () => {
    setIsTakeAttendanceOpen(true);
  };

  const handleSaveAttendance = async (data) => {
    try {
      await attendanceService.create({
        employeeId: data.employeeId,
        date: data.date,
        checkInTime: data.checkInTime ? data.checkInTime + ':00' : null,
        checkOutTime: data.checkOutTime ? data.checkOutTime + ':00' : null,
        status: data.status,
        location: data.location,
        notes: data.notes
      });
      setIsModalOpen(false);
      fetchAttendanceData(); // Refresh list
      alert('Attendance record created successfully');
    } catch (error) {
      console.error('Error creating attendance:', error);
      alert('Failed to create attendance record');
    }
  };

  const handleSaveBulkAttendance = async (records) => {
    try {
      // Process sequentially to avoid overwhelming backend
      for (const record of records) {
        await attendanceService.create({
          employeeId: record.employeeId,
          date: record.date,
          checkInTime: record.checkInTime + ':00',
          checkOutTime: record.checkOutTime ? record.checkOutTime + ':00' : null,
          status: record.status,
          location: 'Office', // Default
          notes: 'Bulk Entry'
        });
      }
      setIsTakeAttendanceOpen(false);
      fetchAttendanceData();
      alert('Attendance records saved successfully');
    } catch (error) {
      console.error('Error saving bulk attendance:', error);
      alert('Failed to save some attendance records');
    }
  };

  const handleViewHistory = (employee) => {
    setHistoryEmployee(employee);
    setIsHistoryModalOpen(true);
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
          

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Filters Panel */}
            <div className="xl:col-span-1">
              <AttendanceFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                attendanceData={attendanceData} />
            </div>

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