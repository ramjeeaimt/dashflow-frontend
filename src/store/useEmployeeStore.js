import { create } from 'zustand';
import employeeService from '../services/employee.service';

const transformEmployee = (emp) => ({
    id: emp.id,
    name: `${emp.user?.firstName || ''} ${emp.user?.lastName || ''}`.trim() || emp.user?.email,
    firstName: emp.user?.firstName || '',
    lastName: emp.user?.lastName || '',
    email: emp.user?.email,
    phone: emp.user?.phone,
    department: emp.department?.name || emp.departmentId,
    role: emp.user?.roles?.[0]?.name || emp.role,
    status: emp.status,
    hireDate: emp.hireDate,
    manager: emp.manager,
    branch: emp.branch,
    employmentType: emp.employmentType,
    salary: emp.salary,
    avatar: emp.avatar || emp.profileImage || emp.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.user?.firstName + ' ' + emp.user?.lastName)}&background=random`,
    profileImage: emp.profileImage || emp.avatar || emp.user?.avatar,
    documents: emp.documents || [],
    address: emp.address,
    emergencyContact: emp.emergencyContact,
    emergencyPhone: emp.emergencyPhone,
    skills: emp.skills || [],
    userId: emp.userId,
    designationId: emp.designationId || emp.designation?.id,
    companyId: emp.companyId,
    departmentId: emp.department?.id || emp.departmentId,
    roleIds: emp.user?.roles?.map(r => typeof r === 'string' ? r : (r?.id || r)) || [],
    permissionIds: emp.user?.permissions?.map(p => typeof p === 'string' ? p : (p?.id || p)) || []
});

const useEmployeeStore = create((set, get) => ({
    employees: [],
    loading: false,
    error: null,
    stats: null,

    fetchEmployees: async (companyId, filters = {}) => {
        set({ loading: true, error: null });
        try {
            const data = await employeeService.getAll({ ...filters, companyId });
            const transformedData = Array.isArray(data) ? data.map(transformEmployee) : [];
            set({ employees: transformedData, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    fetchStats: async (companyId) => {
        try {
            const stats = await employeeService.getCount(companyId);
            set({ stats });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    },

    createEmployee: async (employeeData, companyId) => {
        set({ loading: true });
        try {
            await employeeService.create(employeeData);
            await get().fetchEmployees(companyId);
            set({ loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updateEmployee: async (id, employeeData, companyId) => {
        set({ loading: true });
        try {
            await employeeService.update(id, employeeData);
            await get().fetchEmployees(companyId);
            set({ loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deleteEmployee: async (id, companyId) => {
        try {
            await employeeService.delete(id);
            await get().fetchEmployees(companyId);
        } catch (error) {
            throw error;
        }
    },

    setEmployees: (employees) => {
        set({ employees: typeof employees === 'function' ? employees(get().employees) : employees });
    }
}));

export default useEmployeeStore;
