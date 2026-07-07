import React, { useState, useEffect, useMemo } from 'react';
import {
    Shield,
    Check,
    X,
    Search,
    Info,
    AlertCircle,
    Users,
    UserCheck,
    Lock,
    KeyRound,
    User,
    ChevronRight,
    Sliders,
    Save,
    RotateCcw
} from 'lucide-react';
import employeeService from '../../../services/employee.service';
import accessControlService from '../../../services/access-control.service';
import useAuthStore from '../../../store/useAuthStore';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import { isAdminUser } from '../../../config/roles';

const getPermissionSentence = (action, resource) => {
    const cleanAction = action === 'manage' ? 'manage' : action === 'read' ? 'view' : action === 'update' ? 'update' : action === 'create' ? 'create' : action;
    
    let formattedResource = resource;
    if (resource === 'employee') formattedResource = 'employees';
    else if (resource === 'user') formattedResource = 'users';
    else if (resource === 'project') formattedResource = 'projects';
    else if (resource === 'task') formattedResource = 'tasks';
    else if (resource === 'attendance') formattedResource = 'attendance records';
    else if (resource === 'leave') formattedResource = 'leaves';
    else if (resource === 'payroll') formattedResource = 'payroll';
    else if (resource === 'job') formattedResource = 'jobs';
    else if (resource === 'client') formattedResource = 'clients';
    else if (resource === 'expense') formattedResource = 'expenses';
    else if (resource === 'access-control') formattedResource = 'user permissions and roles';
    else if (resource === 'notification') formattedResource = 'notifications';
    else if (resource === 'monitoring') formattedResource = 'monitoring details';
    
    return `User can ${cleanAction} ${formattedResource}`;
};

const UserPermissionsPage = () => {
    const [employees, setEmployees] = useState([]);
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');

    // Sidebar layouts
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Editor State
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedRoleIds, setSelectedRoleIds] = useState([]);
    const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const { user: loggedInUser } = useAuthStore();

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    const handleToggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const companyId = loggedInUser?.company?.id;
            const [empData, rolesData, permsData] = await Promise.all([
                employeeService.getAll({ companyId }),
                accessControlService.getAllRoles(companyId),
                accessControlService.getAllPermissions()
            ]);
            setEmployees(empData);
            setRoles(rolesData);
            setPermissions(permsData);
            return empData;
        } catch (error) {
            console.error('Error fetching security and user access data:', error);
            setErrorMessage('Failed to fetch users and access details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEmployee = (emp) => {
        setSelectedEmployee(emp);
        setSuccessMessage('');
        setErrorMessage('');

        // Populate current user roles
        const currentRoleIds = emp.user?.roles?.map(r => r.id) || [];
        setSelectedRoleIds(currentRoleIds);

        // Populate current user direct permissions
        const currentPermissionIds = emp.user?.permissions?.map(p => p.id) || [];
        setSelectedPermissionIds(currentPermissionIds);
    };

    const handleToggleRole = (roleId) => {
        // Prevent removing the Employee role to ensure basic portal access
        const empRole = roles.find(r => r.name === 'Employee');
        if (empRole && roleId === empRole.id && selectedRoleIds.includes(roleId)) {
            return; // Can't uncheck the basic Employee role
        }

        setSelectedRoleIds(prev => {
            if (prev.includes(roleId)) {
                return prev.filter(id => id !== roleId);
            } else {
                return [...prev, roleId];
            }
        });
    };

    const handleTogglePermission = (permId) => {
        setSelectedPermissionIds(prev => {
            if (prev.includes(permId)) {
                return prev.filter(id => id !== permId);
            } else {
                return [...prev, permId];
            }
        });
    };

    const handleSelectAllPermissionsOfResource = (resource, permissionList) => {
        const resourcePermIds = permissionList.filter(p => p.resource === resource).map(p => p.id);
        const allSelected = resourcePermIds.every(id => selectedPermissionIds.includes(id));

        if (allSelected) {
            // Remove all
            setSelectedPermissionIds(prev => prev.filter(id => !resourcePermIds.includes(id)));
        } else {
            // Add missing ones
            setSelectedPermissionIds(prev => [...new Set([...prev, ...resourcePermIds])]);
        }
    };

    const handleResetToDefault = () => {
        if (!selectedEmployee) return;
        setSelectedPermissionIds([]); // Clears direct permissions, relying 100% on roles
    };

    const handleSaveChanges = async () => {
        if (!selectedEmployee) return;

        // Guard against locking out oneself
        if (selectedEmployee.user?.id === loggedInUser?.id) {
            const hasAdminRole = selectedRoleIds.some(rid => {
                const roleObj = roles.find(r => r.id === rid);
                return roleObj && ['Admin', 'Super Admin', 'ADMIN'].includes(roleObj.name);
            });
            if (!hasAdminRole) {
                setErrorMessage('Safety lock: You cannot remove your own administrator status to avoid losing console access.');
                return;
            }
        }

        setSaving(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            await employeeService.update(selectedEmployee.id, {
                roleIds: selectedRoleIds,
                permissionIds: selectedPermissionIds
            });
            setSuccessMessage(`Access policies updated successfully for ${selectedEmployee.user?.firstName || 'user'}!`);
            // Refresh local dataset and get the fresh list
            const freshEmployees = await fetchData();
            // Reselect updated employee to show accurate UI badges
            const updatedEmp = freshEmployees?.find(e => e.id === selectedEmployee.id);
            if (updatedEmp) {
                handleSelectEmployee(updatedEmp);
            }
        } catch (error) {
            console.error('Error updating employee permissions:', error);
            setErrorMessage(error.response?.data?.message || 'Failed to update access control. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Filters and search logic
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const name = `${emp.user?.firstName || ''} ${emp.user?.lastName || ''}`.toLowerCase();
            const email = (emp.user?.email || '').toLowerCase();
            const matchesSearch = name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());

            if (selectedRoleFilter === 'All') return matchesSearch;

            const hasRole = emp.user?.roles?.some(r => r.name === selectedRoleFilter);
            return matchesSearch && hasRole;
        });
    }, [employees, searchTerm, selectedRoleFilter]);

    // Statistics counts
    const stats = useMemo(() => {
        const total = employees.length;
        const admins = employees.filter(e => e.user?.roles?.some(r => ['Admin', 'Super Admin', 'ADMIN'].includes(r.name))).length;
        const customPerms = employees.filter(e => e.user?.permissions?.length > 0).length;
        return { total, admins, customPerms };
    }, [employees]);

    // Grouping of permission list by resource types
    const groupedPermissions = useMemo(() => {
        return permissions.reduce((acc, perm) => {
            if (!acc[perm.resource]) acc[perm.resource] = [];
            acc[perm.resource].push(perm);
            return acc;
        }, {});
    }, [permissions]);

    // Check if the current user is an Admin
    const isCurrentUserAdmin = isAdminUser(loggedInUser);

    if (!isCurrentUserAdmin) {
        return (
            <div className="min-h-screen bg-muted/60 flex flex-col items-center justify-center p-6">
                <div className="bg-card rounded-lg p-8 max-w-md w-full border border-border text-center shadow-sm">
                    <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center text-red-600 mx-auto mb-6">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
                    <p className="text-muted-foreground mt-2">
                        Only administrators are authorized to access and modify user access control policies and permission layers.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="mt-6 inline-flex items-center px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-md "
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header onToggleSidebar={toggleMobileSidebar} />
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={handleToggleSidebar}
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
            />

            <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-8 flex flex-col min-h-screen`}>
                <div className="p-4 sm:p-8 flex-1">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Title Section */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-semibold text-foreground tracking-tight flex items-center gap-3">
                                    <KeyRound className="text-primary" size={32} />
                                    User Access Control
                                </h1>
                                <p className="text-muted-foreground mt-1">Assign security roles and configure individual direct permission overlays for employees</p>
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-card rounded-lg border border-border p-6 shadow-sm flex items-center gap-5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-6 -mt-6" />
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total User Profiles</p>
                                    <h3 className="text-3xl font-semibold text-foreground mt-1">{stats.total}</h3>
                                </div>
                            </div>
                            <div className="bg-card rounded-lg border border-border p-6 shadow-sm flex items-center gap-5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-6 -mt-6" />
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">System Administrators</p>
                                    <h3 className="text-3xl font-semibold text-foreground mt-1">{stats.admins}</h3>
                                </div>
                            </div>
                            <div className="bg-card rounded-lg border border-border p-6 shadow-sm flex items-center gap-5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full -mr-6 -mt-6" />
                                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                                    <Sliders size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Custom Direct Overlays</p>
                                    <h3 className="text-3xl font-semibold text-foreground mt-1">{stats.customPerms}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Search and Main Content Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                            {/* User List Panel (Left Side) */}
                            <div className="lg:col-span-5 bg-card border border-border rounded-lg shadow-sm overflow-hidden flex flex-col max-h-[80vh]">
                                <div className="p-5 border-b border-border bg-muted/50 space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-3.5 top-3.5 text-muted-foreground" size={18} />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search users by name or email..."
                                            className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:bg-card transition-all font-medium text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                        {['All', 'Admin', 'Manager', 'Employee'].map((roleFilter) => (
                                            <button
                                                key={roleFilter}
                                                onClick={() => setSelectedRoleFilter(roleFilter)}
                                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 ${selectedRoleFilter === roleFilter
 ? 'bg-primary border-primary text-white shadow-sm'
 : 'bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground'
 }`}
                                            >
                                                {roleFilter === 'All' ? 'All Roles' : roleFilter}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto divide-y divide-border">
                                    {loading ? (
                                        [1, 2, 3, 4].map(i => (
                                            <div key={i} className="p-5 animate-pulse flex items-center justify-between">
                                                <div className="flex items-center gap-3 w-2/3">
                                                    <div className="w-10 h-10 bg-muted rounded-full" />
                                                    <div className="space-y-2 flex-1">
                                                        <div className="h-4 bg-muted rounded w-3/4" />
                                                        <div className="h-3 bg-muted rounded w-1/2" />
                                                    </div>
                                                </div>
                                                <div className="w-16 h-6 bg-muted rounded" />
                                            </div>
                                        ))
                                    ) : filteredEmployees.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground space-y-3">
                                            <AlertCircle className="mx-auto text-muted-foreground opacity-40" size={36} />
                                            <p className="text-sm font-medium">No users found matching your filters</p>
                                        </div>
                                    ) : (
                                        filteredEmployees.map((emp) => {
                                            const isSelected = selectedEmployee?.id === emp.id;
                                            const employeeName = emp.user?.name || `${emp.user?.firstName || ''} ${emp.user?.lastName || ''}`.trim() || 'No Name';
                                            return (
                                                <button
                                                    key={emp.id}
                                                    onClick={() => handleSelectEmployee(emp)}
                                                    className={`w-full p-4 flex items-center justify-between text-left transition-all hover:bg-primary/10 relative ${isSelected ? 'bg-primary/40 border-l-4 border-l-indigo-600' : ''
 }`}
                                                >
                                                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold uppercase shrink-0">
                                                            {emp.user?.avatar ? (
                                                                <img src={emp.user.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                                                            ) : (
                                                                employeeName.charAt(0)
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="font-bold text-foreground text-sm truncate flex items-center gap-2">
                                                                {employeeName}
                                                                {emp.user?.id === loggedInUser?.id && (
                                                                    <span className="text-[10px] bg-border text-foreground px-1.5 py-0.5 rounded font-semibold uppercase">You</span>
                                                                )}
                                                            </h4>
                                                            <p className="text-muted-foreground text-xs truncate mt-0.5">{emp.user?.email}</p>
                                                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                                                {emp.user?.roles?.map((r) => (
                                                                    <span
                                                                        key={r.id}
                                                                        className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full border ${['Admin', 'Super Admin', 'ADMIN'].includes(r.name)
 ? 'bg-red-50 border-red-200 text-red-600'
 : r.name === 'Manager'
 ? 'bg-amber-50 border-amber-200 text-amber-600'
 : 'bg-muted/60 border-border text-muted-foreground'
 }`}
                                                                    >
                                                                        {r.name}
                                                                    </span>
                                                                ))}
                                                                {emp.user?.permissions?.length > 0 && (
                                                                    <span className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full bg-primary/10 border border-border text-primary">
                                                                        +{emp.user.permissions.length} Overlays
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className={`text-muted-foreground/70 shrink-0 ml-2 transition-transform duration-300 ${isSelected ? 'translate-x-1 text-primary' : ''}`} size={16} />
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Permission Editor Panel (Right Side) */}
                            <div className="lg:col-span-7 space-y-6">
                                {selectedEmployee ? (
                                    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">

                                        {/* Header */}
                                        <div className="p-6 border-b border-border bg-primary flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md uppercase">
                                                    {selectedEmployee.user?.firstName?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                                        Manage Access Rules
                                                    </h3>
                                                    <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mt-0.5">
                                                        Employee Code: <span className="text-primary font-semibold">{selectedEmployee.employeeCode || 'N/A'}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleResetToDefault}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground hover:text-foreground hover:bg-border rounded-lg text-xs font-bold transition-all"
                                                title="Clears customized direct overlays, relying only on role permissions."
                                            >
                                                <RotateCcw size={13} />
                                                Reset
                                            </button>
                                        </div>

                                        {/* Success and Error Banners */}
                                        {successMessage && (
                                            <div className="mx-6 mt-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 text-sm font-semibold">
                                                <UserCheck size={18} className="text-emerald-600" />
                                                <span>{successMessage}</span>
                                            </div>
                                        )}
                                        {errorMessage && (
                                            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-3 text-sm font-semibold">
                                                <AlertCircle size={18} className="text-red-600" />
                                                <span>{errorMessage}</span>
                                            </div>
                                        )}

                                        <div className="p-6 space-y-8">
                                            {/* Security Roles Row */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <Shield size={18} className="text-primary" />
                                                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Security Roles</h4>
                                                </div>
                                                <p className="text-muted-foreground text-xs">Roles grant preset packages of permissions. Toggle roles below to set basic access levels.</p>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    {roles.map(role => {
                                                        const isSelected = selectedRoleIds.includes(role.id);
                                                        return (
                                                            <button
                                                                type="button"
                                                                key={role.id}
                                                                onClick={() => handleToggleRole(role.id)}
                                                                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left ${isSelected
 ? 'bg-primary border-primary text-white shadow-md'
 : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/50'
 }`}
                                                            >
                                                                <div>
                                                                    <span className="text-xs uppercase font-semibold tracking-wider block">{role.name}</span>
                                                                    <span className={`text-[10px] mt-0.5 block line-clamp-1 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground/70'}`}>
                                                                        {role.description || `Has default permissions`}
                                                                    </span>
                                                                </div>
                                                                {isSelected && <Check size={16} className="shrink-0 ml-2" />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Direct Permission Overlay Row */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <Sliders size={18} className="text-primary" />
                                                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Direct Permissions Overlays</h4>
                                                </div>
                                                <p className="text-muted-foreground text-xs">Assign individual fine-grained capabilities directly to this user. Checked items will override or add on top of their roles.</p>

                                                <div className="space-y-6">
                                                    {Object.entries(groupedPermissions).map(([resource, perms]) => {
                                                        const resourcePermIds = perms.map(p => p.id);
                                                        const isAllSelected = resourcePermIds.every(id => selectedPermissionIds.includes(id));
                                                        const hasSomeSelected = resourcePermIds.some(id => selectedPermissionIds.includes(id)) && !isAllSelected;

                                                        return (
                                                            <div key={resource} className="bg-muted/30 border border-border rounded-xl p-5 space-y-4">
                                                                <div className="flex items-center justify-between border-b border-border pb-3">
                                                                    <span className="font-semibold text-foreground capitalize tracking-wide flex items-center gap-2 text-sm">
                                                                        {resource} Management
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleSelectAllPermissionsOfResource(resource, permissions)}
                                                                        className="text-xs text-primary hover:text-primary font-bold uppercase tracking-wider"
                                                                    >
                                                                        {isAllSelected ? 'Deselect All' : 'Select All'}
                                                                    </button>
                                                                </div>

                                                                                                                                <div className="space-y-2">
                                                                    {perms.map(perm => {
                                                                        const isChecked = selectedPermissionIds.includes(perm.id);
                                                                        return (
                                                                            <div 
                                                                                key={perm.id} 
                                                                                className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors"
                                                                            >
                                                                                <span className="text-xs font-semibold text-foreground capitalize">
                                                                                    {getPermissionSentence(perm.action, perm.resource)}
                                                                                </span>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleTogglePermission(perm.id)}
                                                                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
 isChecked ? 'bg-primary' : 'bg-border'
 }`}
                                                                                >
                                                                                    <span
                                                                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow transition duration-200 ease-in-out ${
 isChecked ? 'translate-x-5' : 'translate-x-0'
 }`}
                                                                                    />
                                                                                </button>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom Actions Footer */}
                                        <div className="p-6 bg-muted/60 border-t border-border flex items-center justify-between">
                                            <div className="hidden sm:flex items-center text-muted-foreground space-x-2 text-xs italic">
                                                <Info size={14} className="text-primary" />
                                                <span>Updating permissions updates the user's active session instantly.</span>
                                            </div>
                                            <div className="flex space-x-3 w-full sm:w-auto justify-end">
                                                <button
                                                    type="button"
                                                    disabled={saving}
                                                    onClick={() => setSelectedEmployee(null)}
                                                    className="flex-1 sm:flex-none px-5 py-2.5 text-muted-foreground font-bold hover:bg-border rounded-xl transition-all text-xs"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={saving}
                                                    onClick={handleSaveChanges}
                                                    className="flex-1 sm:flex-none px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-md text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {saving ? (
                                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Save size={15} />
                                                    )}
                                                    <span>{saving ? 'Saving...' : 'Save Policies'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-card border border-border border-dashed rounded-lg p-16 text-center text-muted-foreground space-y-4 flex flex-col items-center justify-center min-h-[400px]">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-primary/60 shadow-inner">
                                            <KeyRound size={28} />
                                        </div>
                                        <h3 className="text-lg font-bold text-foreground">Select an Employee</h3>
                                        <p className="text-sm text-muted-foreground max-w-sm">
                                            Choose an employee from the directory on the left to configure their organizational security roles and individual permission overrides.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserPermissionsPage;
