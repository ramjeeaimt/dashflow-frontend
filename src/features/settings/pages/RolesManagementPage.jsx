import React, { useState, useEffect } from 'react';
import {
    Shield,
    Plus,
    Edit2,
    Trash2,
    Check,
    X,
    ChevronRight,
    Lock,
    Search,
    Info,
    AlertCircle
} from 'lucide-react';
import accessControlService from '../../../services/access-control.service';
import useAuthStore from '../../../store/useAuthStore';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';

const RolesManagement = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRole, setCurrentRole] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [roleForm, setRoleForm] = useState({
        name: '',
        description: '',
        permissionIds: []
    });

    const { user } = useAuthStore();

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
            const [rolesData, permsData] = await Promise.all([
                accessControlService.getAllRoles(user?.company?.id),
                accessControlService.getAllPermissions()
            ]);
            setRoles(rolesData);
            setPermissions(permsData);
        } catch (error) {
            console.error('Error fetching access control data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSeedPermissions = async () => {
        setLoading(true);
        try {
            await accessControlService.seedPermissions();
            await fetchData();
            alert('Default permissions seeded successfully!');
        } catch (error) {
            console.error('Error seeding permissions:', error);
            alert('Failed to seed permissions. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (role = null) => {
        if (role) {
            setCurrentRole(role);
            setRoleForm({
                name: role.name,
                description: role.description || '',
                permissionIds: role.permissions?.map(p => p.id) || []
            });
        } else {
            setCurrentRole(null);
            setRoleForm({
                name: '',
                description: '',
                permissionIds: []
            });
        }
        setIsModalOpen(true);
    };

    const handleTogglePermission = (id) => {
        setRoleForm(prev => {
            const exists = prev.permissionIds.includes(id);
            if (exists) {
                return { ...prev, permissionIds: prev.permissionIds.filter(pid => pid !== id) };
            } else {
                return { ...prev, permissionIds: [...prev.permissionIds, id] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentRole) {
                await accessControlService.updateRole(currentRole.id, roleForm);
            } else {
                await accessControlService.createRole({
                    ...roleForm,
                    companyId: user?.company?.id
                });
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error saving role:', error);
        }
    };

    const handleDeleteRole = async (roleId) => {
        if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
            try {
                setLoading(true);
                await accessControlService.deleteRole(roleId);
                await fetchData();
            } catch (error) {
                console.error('Error deleting role:', error);
                alert(error.response?.data?.message || 'Failed to delete role');
            } finally {
                setLoading(false);
            }
        }
    };

    const groupedPermissions = permissions.reduce((acc, perm) => {
        if (!acc[perm.resource]) acc[perm.resource] = [];
        acc[perm.resource].push(perm);
        return acc;
    }, {});

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
                <div className="p-4 sm:p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-foreground tracking-tight">Access Control Center</h1>
                                <p className="text-muted-foreground mt-1">Manage what your team members can see and do</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {permissions.length === 0 && (
                                    <button
                                        onClick={handleSeedPermissions}
                                        className="inline-flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-all shadow-sm active:scale-95 space-x-2 w-fit"
                                    >
                                        <Shield size={18} />
                                        <span>Initialize Permissions</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => handleOpenModal()}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-sm active:scale-95 space-x-2 w-fit"
                                >
                                    <Plus size={18} />
                                    <span>Create New Role</span>
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-48 bg-card rounded-2xl border border-border shadow-sm" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {roles.map((role) => (
                                    <div
                                        key={role.id}
                                        className="group bg-card rounded-2xl border border-border shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300 p-6 flex flex-col relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />

                                        <div className="flex items-start justify-between relative z-10">
                                            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                                <Shield size={24} />
                                            </div>
                                            <div className="flex space-x-1">
                                                <button
                                                    onClick={() => handleOpenModal(role)}
                                                    className="p-2 text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteRole(role.id)}
                                                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-foreground group-hover:text-indigo-500 transition-colors uppercase tracking-wider">{role.name}</h3>
                                        <p className="text-muted-foreground text-sm mt-1 mb-4 flex-1 line-clamp-2">
                                            {role.description || 'No description provided for this role.'}
                                        </p>

                                        <div className="pt-4 border-t border-border flex items-center justify-between mt-auto relative z-10">
                                            <div className="flex -space-x-2">
                                                <div className="w-8 h-8 rounded-full border-2 border-card bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">JD</div>
                                                <div className="w-8 h-8 rounded-full border-2 border-card bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">AS</div>
                                                <div className="w-8 h-8 rounded-full border-2 border-card bg-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-600">+5</div>
                                            </div>
                                            <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-md uppercase">
                                                {role.permissions?.length || 0} Permissions
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Role Editor Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

                        <div className="bg-card w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-border flex items-center justify-between bg-indigo-600 text-white">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Lock size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">{currentRole ? 'Edit Role' : 'Create New Role'}</h2>
                                        <p className="text-indigo-100 text-xs uppercase tracking-widest font-medium">Fine-grained access control</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
                                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Role Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={roleForm.name}
                                                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                                                className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-card transition-all font-medium"
                                                placeholder="e.g. Project Manager"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                                            <input
                                                type="text"
                                                value={roleForm.description}
                                                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                                                className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-card transition-all font-medium"
                                                placeholder="What can this role do?"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Permissions & Policies</label>
                                            <div className="flex items-center space-x-2 text-xs text-muted-foreground font-bold uppercase tracking-widest bg-muted px-3 py-1 rounded-full">
                                                <Info size={12} />
                                                <span>Select capabilities</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-8">
                                            {Object.keys(groupedPermissions).length === 0 ? (
                                                <div className="flex flex-col items-center justify-center p-12 bg-muted/20 border border-dashed border-border rounded-3xl text-center">
                                                    <AlertCircle size={48} className="text-amber-500 mb-4 opacity-50" />
                                                    <h3 className="text-lg font-bold text-foreground">No Permissions Found</h3>
                                                    <p className="text-muted-foreground text-sm max-w-xs mt-2">
                                                        The system has not been initialized with default permissions yet. Please close this and click <b>Initialize Permissions</b>.
                                                    </p>
                                                </div>
                                            ) : (
                                                Object.entries(groupedPermissions).map(([resource, perms]) => (
                                                    <div key={resource} className="bg-muted/30 rounded-2xl border border-border p-6">
                                                        <div className="flex items-center space-x-2 mb-4">
                                                            <span className="text-lg font-bold text-foreground capitalize">{resource}</span>
                                                            <div className="h-px flex-1 bg-border" />
                                                        </div>
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                                            {perms.map(perm => {
                                                                const isSelected = roleForm.permissionIds.includes(perm.id);
                                                                return (
                                                                    <button
                                                                        type="button"
                                                                        key={perm.id}
                                                                        onClick={() => handleTogglePermission(perm.id)}
                                                                        className={`group flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${isSelected
                                                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md scale-105'
                                                                                : 'bg-card border-border text-muted-foreground hover:border-indigo-500/50 hover:bg-muted/50'
                                                                            }`}
                                                                    >
                                                                        <span className="text-[10px] uppercase font-black mb-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                                                            {perm.action}
                                                                        </span>
                                                                        {isSelected && <Check size={14} className="mb-1" />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-muted border-t border-border flex items-center justify-between">
                                    <div className="hidden md:flex items-center text-muted-foreground space-x-2">
                                        <AlertCircle size={16} />
                                        <span className="text-xs font-medium italic">Changes affect all associated users immediately.</span>
                                    </div>
                                    <div className="flex space-x-3 w-full md:w-auto">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="flex-1 md:flex-none px-6 py-2.5 text-muted-foreground font-bold hover:bg-border rounded-xl transition-colors text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 md:flex-none px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 text-sm"
                                        >
                                            {currentRole ? 'Update Role' : 'Create Role'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default RolesManagement;
