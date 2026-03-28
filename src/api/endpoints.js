export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        PROFILE: '/auth/profile',
    },
    ATTENDANCE: {
        BASE: '/attendance',
        CHECK_IN: '/attendance/check-in',
        BULK_CHECK_IN: '/attendance/bulk-check-in',
        CHECK_OUT: '/attendance/check-out',
        TODAY: (employeeId) => `/attendance/today/${employeeId}`,
        ANALYTICS: '/attendance/analytics',
        RECORD: (id) => `/attendance/${id}`,
    },
    EMPLOYEES: {
        BASE: '/employees',
        BY_ID: (id) => `/employees/${id}`,
        STATS: '/employees/stats/count',
    },
    PROJECTS: {
        BASE: '/projects',
        BY_ID: (id) => `/projects/${id}`,
    },
    DESIGNATIONS: {
        BASE: '/designations',
        BY_ID: (id) => `/designations/${id}`,
    },
    DEPARTMENTS: {
        BASE: '/departments',
        BY_ID: (id) => `/departments/${id}`,
    },
    DASHBOARD: {
        BASE: '/dashboard',
        STATS: '/dashboard',
    },
    FINANCE: {
        BASE: '/finance',
        PAYROLL: '/finance/payroll',
        PAYROLL_BY_ID: (id) => `/finance/payroll/${id}`
    },


    TIME_TRACKING: {
        BASE: '/time-tracking',
    },
    ACCESS_CONTROL: {
        BASE: '/access-control',
        ROLES: '/access-control/roles',
        PERMISSIONS: '/access-control/permissions',
    },

    UPLOAD_IMAGE: {
        IMAGE: "/upload/image",
        DOCUMENT: "/upload/document",
        AVATAR: "/upload/profileImage"
    },
    PRODUCTIVITY_ANALYTICS: {
        GET_ANALYTICS: "/productivity"

    },

    LEAVES: {
        BASE: '/leaves',
        BY_ID: (id) => `/leaves/${id}`,
        // ✅ Add this line to match your @Patch(':id/status') controller
        UPDATE_STATUS: (id) => `/leaves/${id}/status`,
        BY_EMPLOYEE: (employeeId) => `/leaves/employee/${employeeId}`,
    },
};
