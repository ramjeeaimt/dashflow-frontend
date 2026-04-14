import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import attendanceService from '../../../services/attendance.service';
import { leaveService } from '../../../services/leaveService';
import Icon from '../../../components/AppIcon';
import { formatTime12h } from '../../../utils/dateUtils';

const AttendanceHistoryModal = ({ isOpen, onClose, employee }) => {
    const [history, setHistory] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [stats, setStats] = useState({ present: 0, absent: 0, leaves: 0 });

    useEffect(() => {
        if (isOpen && employee) {
            fetchData();
        }
    }, [isOpen, employee, month]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [year, m] = month.split('-');
            const startDate = `${year}-${m}-01`;
            const endDate = new Date(year, parseInt(m), 0).toISOString().split('T')[0];

            // Fetch Attendance
            const attendanceData = await attendanceService.getAll({
                employeeId: employee.employeeId || employee.id,
                startDate,
                endDate
            });

            // Fetch Approved Leaves
            const leaveData = await leaveService.getAll({
                employeeId: employee.userId || employee.employeeId || employee.id,
                startDate,
                endDate,
                status: 'APPROVED'
            });

            const attendanceRecords = Array.isArray(attendanceData) ? attendanceData : [];
            const leaveRecords = Array.isArray(leaveData) ? leaveData : [];

            setHistory(attendanceRecords);
            setLeaves(leaveRecords);
            calculateStats(attendanceRecords, leaveRecords, year, m);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (attendance, approvedLeaves, year, monthStr) => {
        const y = parseInt(year);
        const m = parseInt(monthStr);
        
        // Present days (any record that isn't explicitly marked absent)
        const presentCount = attendance.filter(r => 
            ['present', 'late', 'early_checkin', 'early_departure'].includes(r.status)
        ).length;

        // Leave days (total duration of approved leaves in this month)
        // For simplicity, we count the number of leave entries that fell in this month
        // In a real scenario, we would iterate dates, but here we use entries as a proxy
        const leaveCount = approvedLeaves.length;

        // Calculate working days in month (excluding Sundays)
        const daysInMonth = new Date(y, m, 0).getDate();
        let workingDaysCount = 0;
        for (let d = 1; d <= daysInMonth; d++) {
            const dayOfWeek = new Date(y, m - 1, d).getDay();
            if (dayOfWeek !== 0) workingDaysCount++; // 0 is Sunday
        }

        // Absent = Working Days - (Present + Leaves)
        // Ensuring we don't go below zero
        const absentCount = Math.max(0, workingDaysCount - (presentCount + leaveCount));

        setStats({
            present: presentCount,
            absent: absentCount,
            leaves: leaveCount
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full max-w-4xl rounded-lg shadow-lg border border-border animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">
                            {employee?.user ? `${employee.user.firstName} ${employee.user.lastName}` : (employee?.employeeName || employee?.name || 'Employee')}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Code: {employee?.employeeCode || 'N/A'} | Department: {employee?.department?.name || employee?.department || 'N/A'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 bg-muted/30 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <Icon name="Filter" size={16} className="text-muted-foreground" />
                        <label className="text-sm font-medium text-foreground whitespace-nowrap">Filter by Month:</label>
                        <input
                            type="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-md shadow-sm">
                            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-tighter mr-2">Present</span>
                            <span className="text-sm font-bold text-emerald-700">{stats.present}</span>
                        </div>
                        <div className="flex items-center px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-md shadow-sm">
                            <span className="text-xs font-semibold text-rose-600 uppercase tracking-tighter mr-2">Absent</span>
                            <span className="text-sm font-bold text-rose-700">{stats.absent}</span>
                        </div>
                        <div className="flex items-center px-3 py-1.5 bg-sky-50 border border-sky-100 rounded-md shadow-sm">
                            <span className="text-xs font-semibold text-sky-600 uppercase tracking-tighter mr-2">Leaves</span>
                            <span className="text-sm font-bold text-sky-700">{stats.leaves}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Icon name="Loader2" size={32} className="animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground animate-pulse">Syncing records...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-muted rounded-lg">
                            <Icon name="Calendar" size={40} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                            <h3 className="text-lg font-medium text-foreground mb-1">No activity records</h3>
                            <p className="text-sm text-muted-foreground">No attendance records found for the selected month.</p>
                        </div>
                    ) : (
                        <div className="border border-border rounded-lg overflow-hidden shadow-sm bg-background">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-muted text-left">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Date</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Check In</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Check Out</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest text-center">Work Hours</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Status</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {history.map((record) => (
                                        <tr key={record.id} className="hover:bg-accent/30 transition-colors group">
                                            <td className="px-4 py-3 text-sm font-medium text-foreground">{formatDate(record.date)}</td>
                                            <td className="px-4 py-3 text-sm font-mono text-foreground font-semibold">
                                                {formatTime12h(record.checkInTime)}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-mono text-foreground">
                                                {formatTime12h(record.checkOutTime)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-foreground text-center tabular-nums">
                                                {record.workHours ? (
                                                    <span className="bg-muted px-2 py-0.5 rounded text-xs font-medium">
                                                        {record.workHours}h
                                                    </span>
                                                ) : '--'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider border shadow-sm
                                                    ${record.status === 'present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        record.status === 'late' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                            record.status === 'early_departure' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                                record.status === 'absent' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                                    'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                                    {record.status?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate group-hover:text-foreground transition-colors" title={record.notes}>
                                                {record.notes || '--'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceHistoryModal;
