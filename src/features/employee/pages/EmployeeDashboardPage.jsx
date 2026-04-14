import React, { useState, useEffect } from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import attendanceService from '../../../services/attendance.service';
import employeeService from '../../../services/employee.service';
import useAuthStore from '../../../store/useAuthStore';
import {
    Clock,
    MapPin,
    XCircle,
    Calendar,
    History,
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import Icon from '../../../components/AppIcon';
import { formatTime12h } from '../../../utils/dateUtils';
import AttendanceHistoryModal from '../../attendance/components/AttendanceHistoryModal';
import EmployeePayrollPage from 'features/payroll/pages/EmployeePayrollPage';
import LeaveForm from './LeaveForm';
import LocationVerification from '../components/LocationVerification';

const EmployeeDashboard = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [employee, setEmployee] = useState(null);
    const [locationData, setLocationData] = useState({
        latitude: null,
        longitude: null,
        address: 'Fetching location...',
        verified: false
    });
    const [location, setLocation] = useState(''); // Keep for manual override if needed
    const [notes, setNotes] = useState('');
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [geoLoading, setGeoLoading] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    const { user, isAuthenticated } = useAuthStore();
    const [currentTime, setCurrentTime] = useState(new Date());

    

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/dashboard' }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            fetchEmployeeAndData();
        }
    }, [user, isAuthenticated]);

    const fetchEmployeeAndData = async () => {
        if (!isAuthenticated || !user?.id) return;
        try {
            setLoading(true);
            const employees = await employeeService.getAll({ userId: user.id });

            if (Array.isArray(employees) && employees.length > 0) {
                const emp = employees[0];
                setEmployee(emp);
                const attendance = await attendanceService.getTodayAttendance(emp.id);
                setTodayAttendance(attendance);

                // Get history (last 5 records)
                // Assuming getAll supports limit or pagination, otherwise we slice frontend side
                const history = await attendanceService.getAll({ employeeId: emp.id });
                // Sort by date desc if not already
                const sortedHistory = Array.isArray(history)
                    ? history.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
                    : [];
                setAttendanceHistory(sortedHistory);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getUserLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                setLocationData({
                    latitude,
                    longitude,
                    address: 'GPS coordinates retrieved.',
                    verified: true
                });
                
                // Also update the string location for backward compatibility
                setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
                setGeoLoading(false);
            },
            (error) => {
                console.error('Error getting location:', error);
                // alert('Unable to retrieve your location. Please check your browser settings.');
                setLocationData(prev => ({ ...prev, verified: false, address: 'Enable GPS to verify location' }));
                setGeoLoading(false);
            }
        );
    };

    const handleCheckIn = async () => {
        if (!employee) {
            alert('Employee record not found');
            return;
        }

        if (!location) {
            alert('Please click "Get GPS" or provide your location before Checking In.');
            return;
        }

        try {
            setLoading(true);

            let lat = null;
            let lng = null;
            if (location && location.includes(',')) {
                const parts = location.split(',');
                if (parts.length === 2) {
                    lat = parseFloat(parts[0].trim());
                    lng = parseFloat(parts[1].trim());
                }
            }

            const currentLat = locationData.latitude || lat;
            const currentLng = locationData.longitude || lng;

            await attendanceService.checkIn(employee.id, location || 'Office', notes, currentLat, currentLng);
            alert('Checked in successfully!');
            await fetchEmployeeAndData();
            setLocation('');
            setNotes('');
        } catch (err) {
            console.error('Error checking in:', err);
            alert('Failed to check in. ' + (err.response?.data?.message || ''));
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        if (!todayAttendance) {
            alert('No check-in record found for today');
            return;
        }

        if (!location) {
            alert('Please click "Get GPS" or provide your location before Checking Out.');
            return;
        }

        try {
            setLoading(true);
            let lat = null;
            let lng = null;
            if (location && location.includes(',')) {
                const parts = location.split(',');
                if (parts.length === 2) {
                    lat = parseFloat(parts[0].trim());
                    lng = parseFloat(parts[1].trim());
                }
            }

            const currentLat = locationData.latitude || lat;
            const currentLng = locationData.longitude || lng;

            await attendanceService.checkOut(todayAttendance.id, notes, currentLat, currentLng);
            alert('Checked out successfully!');
            await fetchEmployeeAndData();
            setNotes('');
            setLocation('');
        } catch (err) {
            console.error('Error checking out:', err);
            alert('Failed to check out. ' + (err.response?.data?.message || ''));
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={handleToggleSidebar} />


            <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
                } pt-16 pb-20 lg:pb-8`}>
                <div className="p-6 max-w-7xl mx-auto">
                    {/* Welcome Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                        <div>
                            <BreadcrumbNavigation items={breadcrumbItems} />
                            <h1 className="text-3xl font-semibold text-foreground mb-2">My Dashboard</h1>
                            <p className="text-muted-foreground">
                                Welcome back, {user?.firstName || 'Employee'}!
                            </p>
                        </div>
                        {/* <div>
                            <EmployeePayrollPage/>
                        </div> */}
                        {/* <div>
                            <LeaveForm employeeId={user?.id} />
                        </div> */}

                        <div className="flex items-center space-x-4 mt-4 lg:mt-0 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                            <Clock className="w-5 h-5 text-primary" />
                            <div className="text-right">
                                <p className="text-sm font-semibold text-foreground">
                                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Quick Attendance Card */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold flex items-center">
                                        <Icon name="CheckCircle" size={20} className="mr-2 text-primary" />
                                        Quick Attendance
                                    </h2>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${todayAttendance?.checkOutTime
                                        ? 'bg-gray-100 text-gray-600'
                                        : todayAttendance
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {todayAttendance?.checkOutTime
                                            ? 'Completed'
                                            : todayAttendance
                                                ? 'Checked In'
                                                : 'Not Started'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Status Display */}
                                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                                        <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Today's Session</h3>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                                        <Icon name="LogIn" size={14} className="text-green-600" />
                                                    </div>
                                                    <span className="text-sm font-medium">Check In</span>
                                                </div>
                                                <span className={`text-sm ${todayAttendance ? 'font-semibold text-gray-900' : 'text-gray-400 italic'}`}>
                                                    {formatTime12h(todayAttendance?.checkInTime)}
                                                </span>
                                            </div>

                                            <div className="w-px h-4 bg-gray-200 ml-4"></div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                                        <Icon name="LogOut" size={14} className="text-blue-600" />
                                                    </div>
                                                    <span className="text-sm font-medium">Check Out</span>
                                                </div>
                                                <span className={`text-sm ${todayAttendance?.checkOutTime ? 'font-semibold text-gray-900' : 'text-gray-400 italic'}`}>
                                                    {formatTime12h(todayAttendance?.checkOutTime)}
                                                </span>
                                            </div>
                                        </div>

                                        {todayAttendance && !todayAttendance.checkOutTime && (
                                            <div className="mt-6 pt-4 border-t border-gray-100">
                                                <p className="text-xs text-center text-green-600 font-medium">
                                                    You are currently active since {formatTime12h(todayAttendance.checkInTime)}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Form */}
                                    <div className="flex flex-col justify-between">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 pl-1">
                                                    Location
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={location}
                                                        onChange={(e) => setLocation(e.target.value)}
                                                        placeholder="Enter location..."
                                                        className="w-full pl-9 pr-24 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                        disabled={loading || (todayAttendance && todayAttendance.checkOutTime)}
                                                    />
                                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />

                                                    <button
                                                        onClick={getUserLocation}
                                                        disabled={geoLoading || (todayAttendance && todayAttendance.checkOutTime)}
                                                        className="absolute right-1 top-1 bottom-1 px-3 bg-gray-100 hover:bg-gray-200 text-xs font-medium text-gray-600 rounded-md transition-colors"
                                                    >
                                                        {geoLoading ? '...' : 'Get GPS'}
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 pl-1">
                                                    Notes
                                                </label>
                                                <textarea
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    placeholder="Add optional notes..."
                                                    rows={2}
                                                    className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                                    disabled={loading || (todayAttendance && todayAttendance.checkOutTime)}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            {!todayAttendance && (
                                                <button
                                                    onClick={handleCheckIn}
                                                    disabled={loading}
                                                    className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary/90 transition shadow-sm font-medium flex items-center justify-center space-x-2"
                                                >
                                                    {loading ? (
                                                        <span className="animate-pulse">Checking In...</span>
                                                    ) : (
                                                        <>
                                                            <Icon name="LogIn" size={18} />
                                                            <span>CHECK IN NOW</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            {todayAttendance && !todayAttendance.checkOutTime && (
                                                <button
                                                    onClick={handleCheckOut}
                                                    disabled={loading}
                                                    className="w-full bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600 transition shadow-sm font-medium flex items-center justify-center space-x-2"
                                                >
                                                    {loading ? (
                                                        <span className="animate-pulse">Checking Out...</span>
                                                    ) : (
                                                        <>
                                                            <Icon name="LogOut" size={18} />
                                                            <span>CHECK OUT NOW</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            {todayAttendance && todayAttendance.checkOutTime && (
                                                <div className="w-full bg-gray-100 text-gray-500 py-2.5 rounded-lg text-center text-sm font-medium cursor-default">
                                                    Attendance Completed
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location Verification & Details */}
                            <LocationVerification 
                                location={locationData}
                                onRefreshLocation={getUserLocation}
                                workMode={employee?.employeeType || 'office'}
                            />
                        </div>

                        {/* Attendance History Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-card rounded-xl shadow-sm border border-border h-full">
                                <div className="p-5 border-b border-border flex items-center justify-between">
                                    <h2 className="font-semibold flex items-center">
                                        <History className="w-5 h-5 mr-2 text-primary" />
                                        Recent History
                                    </h2>
                                    <button
                                        onClick={() => setShowHistoryModal(true)}
                                        className="text-xs text-primary hover:underline bg-transparent border-none cursor-pointer"
                                    >
                                        View All
                                    </button>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {attendanceHistory.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground text-sm">
                                            No recent records found.
                                        </div>
                                    ) : (
                                        attendanceHistory.map((record, index) => (
                                            <div key={record.id || index} className="p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </div>
                                                    <div className={`text-xs px-2 py-0.5 rounded-full ${record.status === 'present' ? 'bg-green-100 text-green-700' :
                                                        record.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                                                            record.status === 'early_departure' ? 'bg-orange-100 text-orange-700' :
                                                                record.status === 'absent' ? 'bg-red-100 text-red-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {record.status?.replace('_', ' ').toUpperCase() || 'PRESENT'}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <div className="flex items-center">
                                                        <Icon name="LogIn" size={12} className="mr-1" />
                                                        <span className="font-medium mr-1">In:</span>
                                                        {formatTime12h(record.checkInTime)}
                                                    </div>
                                                    {record.checkOutTime && (
                                                        <div className="flex items-center">
                                                            <Icon name="LogOut" size={12} className="mr-1" />
                                                            <span className="font-medium mr-1">Out:</span>
                                                            {formatTime12h(record.checkOutTime)}
                                                        </div>
                                                    )}
                                                </div>
                                                {record.workHours && (
                                                    <div className="mt-2 text-xs text-gray-400 flex items-center">
                                                        <Clock size={12} className="mr-1" />
                                                        {record.workHours} hrs
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <AttendanceHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                employee={employee}
            />
        </div>
    );
};

export default EmployeeDashboard;
