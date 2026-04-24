import React, { useState, useEffect } from 'react';
import { Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import attendanceService from '../../../services/attendance.service';
import employeeService from '../../../services/employee.service';
import useAuthStore from '../../../store/useAuthStore';

const QuickAttendance = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const { user, isAuthenticated } = useAuthStore();

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Quick Attendance', path: '/employee-check-in-check-out' }
  ];

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchEmployeeAndAttendance();
    }
  }, [user, isAuthenticated]);

  const fetchEmployeeAndAttendance = async () => {
    if (!isAuthenticated || !user?.id) return;
    try {
      setLoading(true);
      // Get employee record for current user
      const employees = await employeeService.getAll({ userId: user.id });
      if (employees && employees.length > 0) {
        const emp = employees[0];
        setEmployee(emp);

        // Get today's attendance
        const attendance = await attendanceService.getTodayAttendance(emp.id);
        setTodayAttendance(attendance);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!employee) {
      alert('Attendance profile not found. Please contact your admin to link your account.');
      return;
    }

    try {
      setLoading(true);
      await attendanceService.checkIn(employee.id, location, notes);
      alert('Checked in successfully!');
      await fetchEmployeeAndAttendance();
      setLocation('');
      setNotes('');
    } catch (err) {
      console.error('Error checking in:', err);
      alert('Failed to check in. You may have already checked in today.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) {
      alert('No check-in record found for today');
      return;
    }

    try {
      setLoading(true);
      await attendanceService.checkOut(todayAttendance.id, notes);
      alert('Checked out successfully!');
      await fetchEmployeeAndAttendance();
      setNotes('');
    } catch (err) {
      console.error('Error checking out:', err);
      alert('Failed to check out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={toggleMobileSidebar} />
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={handleToggleSidebar}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-8`}>
        <div className="px-4 sm:px-6 md:px-8">
          <BreadcrumbNavigation items={breadcrumbItems} />

          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-foreground mb-2">Quick Attendance</h1>
            <p className="text-muted-foreground">
              Check in and check out quickly and easily
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Current Time Card */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-8 mb-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <Clock className="h-12 w-12 text-primary" />
              </div>
              <div className="text-5xl font-bold text-foreground mb-2">{getCurrentTime()}</div>
              <div className="text-lg text-muted-foreground">{getCurrentDate()}</div>
            </div>

            {/* Status Card */}
            {todayAttendance && (
              <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Today's Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Check-in Time:</span>
                    <span className="font-medium flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {todayAttendance.checkInTime}
                    </span>
                  </div>
                  {todayAttendance.checkOutTime ? (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Check-out Time:</span>
                      <span className="font-medium flex items-center">
                        <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                        {todayAttendance.checkOutTime}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Check-out Time:</span>
                      <span className="font-medium flex items-center">
                        <XCircle className="h-4 w-4 text-gray-400 mr-2" />
                        Not checked out yet
                      </span>
                    </div>
                  )}
                  {todayAttendance.workHours && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Work Hours:</span>
                      <span className="font-medium">{todayAttendance.workHours} hours</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Form */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Office, Home, Client Site"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={loading || (todayAttendance && todayAttendance.checkOutTime)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes..."
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={loading || (todayAttendance && todayAttendance.checkOutTime)}
                  />
                </div>

                <div className="flex gap-4">
                  {!todayAttendance && (
                    <button
                      onClick={handleCheckIn}
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {loading ? 'Processing...' : 'Check In'}
                    </button>
                  )}

                  {todayAttendance && !todayAttendance.checkOutTime && (
                    <button
                      onClick={handleCheckOut}
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {loading ? 'Processing...' : 'Check Out'}
                    </button>
                  )}

                  {todayAttendance && todayAttendance.checkOutTime && (
                    <div className="flex-1 bg-gray-100 text-gray-600 py-3 px-6 rounded-lg text-center font-medium">
                      Attendance Completed for Today
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Make sure to check in when you start work and check out when you finish.
                Your work hours will be automatically calculated.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuickAttendance;