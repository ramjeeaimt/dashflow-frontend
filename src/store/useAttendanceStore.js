import { create } from 'zustand';
import attendanceService from '../services/attendance.service';
import employeeService from '../services/employee.service';
import { getISTDateString } from '../utils/dateUtils';

const useAttendanceStore = create((set, get) => ({
    attendanceData: [],
    filteredData: [],
    employees: [],
    analyticsData: null,
    loading: false,
    error: null,
    filters: {
        dateRange: 'today',
        department: 'all',
        status: 'all',
        location: 'all',
        search: ''
    },

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters }
        }));
        get().applyFilters();
    },

    fetchAttendanceData: async (companyId) => {
        if (!companyId) return;
        set({ loading: true, error: null });
        try {
            const [attendanceRecords, employeesList, analytics] = await Promise.all([
                attendanceService.getAll({ companyId }),
                employeeService.getAll({ companyId }),
                attendanceService.getAnalytics({ companyId })
            ]);

            const validEmployees = Array.isArray(employeesList) ? employeesList : employeesList?.data || [];
            const validAttendance = Array.isArray(attendanceRecords) ? attendanceRecords : attendanceRecords?.data || [];

            // Merge logic
            const attendanceMap = new Map();
            const todayDate = getISTDateString();

            validAttendance.forEach(record => {
                const recordDate = getISTDateString(new Date(record.date));
                if (recordDate === todayDate) {
                    attendanceMap.set(record.employee?.id, record);
                }
            });

            const mergedData = validEmployees.map((emp, index) => {
                const record = attendanceMap.get(emp.id);
                return {
                    id: record?.id || `temp-${emp.id || index}`,
                    employeeId: emp.id,
                    employeeName: `${emp.user?.firstName} ${emp.user?.lastName}`,
                    department: emp.department?.name || 'N/A',
                    checkInTime: record?.checkInTime || '--',
                    checkOutTime: record?.checkOutTime || '--',
                    workDuration: record?.workHours ? `${Math.floor(parseFloat(record.workHours))}h ${Math.round((parseFloat(record.workHours) % 1) * 60)}m` : '--',
                    breakDuration: '0m',
                    status: record?.status || 'not_checked_in',
                    location: record?.location || 'Office',
                    date: record?.date || todayDate,
                    profileImage: emp.user?.avatar,
                    hasRecord: !!record
                };
            });

            set({
                attendanceData: mergedData,
                employees: validEmployees,
                analyticsData: analytics,
                loading: false
            });
            get().applyFilters();
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    applyFilters: () => {
        const { attendanceData, filters } = get();
        let filtered = [...attendanceData];

        if (filters.department !== 'all') {
            filtered = filtered.filter((emp) => emp.department === filters.department);
        }

        if (filters.status !== 'all') {
            if (filters.status === 'absent') {
                filtered = filtered.filter((emp) => emp.status === 'absent' || emp.status === 'not_checked_in');
            } else if (filters.status === 'present') {
                filtered = filtered.filter((emp) => ['present', 'late', 'early_checkin', 'early_departure'].includes(emp.status));
            } else {
                filtered = filtered.filter((emp) => emp.status === filters.status);
            }
        }

        if (filters.location !== 'all') {
            filtered = filtered.filter((emp) => emp.location === filters.location);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(emp =>
                emp.employeeName.toLowerCase().includes(searchLower) ||
                emp.employeeId.toString().toLowerCase().includes(searchLower)
            );
        }

        set({ filteredData: filtered });
    },

    checkIn: async (employeeId, companyId, label) => {
        try {
            await attendanceService.checkIn(employeeId, 'Office', 'Manual Check-in', null, null, label);
            await get().fetchAttendanceData(companyId);
            return true;
        } catch (error) {
            throw error;
        }
    },

    checkOut: async (attendanceId, companyId, notes, label) => {
        try {
            await attendanceService.checkOut(attendanceId, notes || 'Manual Check-out', null, null, label);
            await get().fetchAttendanceData(companyId);
            return true;
        } catch (error) {
            throw error;
        }
    },

    createRecord: async (data, companyId) => {
        try {
            await attendanceService.create({
                ...data,
                checkInTime: data.checkInTime ? data.checkInTime + ':00' : null,
                checkOutTime: data.checkOutTime ? data.checkOutTime + ':00' : null,
            });
            await get().fetchAttendanceData(companyId);
            return true;
        } catch (error) {
            throw error;
        }
    },

    bulkCheckIn: async (employeeIds, companyId, notes, label) => {
        try {
            await attendanceService.bulkCheckIn(employeeIds, notes, label);
            await get().fetchAttendanceData(companyId);
            return true;
        } catch (error) {
            throw error;
        }
    }
}));

export default useAttendanceStore;
