import React, { useState, useEffect } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import api from '../../../api/client';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';

const ManagerList = () => {
    const { user } = useAuthStore();
    const [managers, setManagers] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const fetchData = async () => {
        if (!user?.company?.id) return;
        try {
            setLoading(true);
            const response = await api.get(`/employees?companyId=${user.company.id}&t=${Date.now()}`);
            let employeesData = [];
            if (Array.isArray(response.data)) {
                employeesData = response.data;
            } else if (response.data && Array.isArray(response.data.data)) {
                employeesData = response.data.data;
            }

            // Dual-layer filter (Support both new RBAC and legacy role string)
            const managerList = employeesData.filter(emp =>
                emp.user?.roles?.some(r => r.name?.toLowerCase() === 'manager') ||
                emp.role?.toLowerCase() === 'manager'
            );
            
            setManagers(managerList);
            setAllEmployees(employeesData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleAssignManagers = async () => {
        if (selectedEmployeeIds.length === 0) return;
        try {
            setIsSaving(true);
            console.log('[ManagerList] Starting assignment for:', selectedEmployeeIds);
            
            await api.post('/employees/bulk-managers', { employeeIds: selectedEmployeeIds });
            console.log('[ManagerList] POST Success - Closing modal');
            
            setIsModalOpen(false);
            setSelectedEmployeeIds([]);
            
            // Trigger GET immediately with a follow-up after a short delay
            console.log('[ManagerList] Triggering GET refresh');
            await fetchData(); 
            
            setTimeout(() => fetchData(), 1000); // Insurance call
            
            alert('Managers assigned successfully!');
        } catch (error) {
            console.error('[ManagerList] Assignment Error:', error);
            alert('Failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveManager = async (employeeId) => {
        if (!window.confirm('Are you sure you want to remove this manager role? The user will remain an active employee.')) return;
        try {
            setDeletingId(employeeId);
            await api.delete(`/employees/${employeeId}/manager-role`);
            await fetchData();
        } catch (error) {
            console.error('Failed to remove manager role:', error);
            alert('Failed to remove manager role');
        } finally {
            setDeletingId(null);
        }
    };

    // Filter out employees who are already managers (either by role or string field)
    const nonManagerOptions = allEmployees
        .filter(emp => 
            !emp.user?.roles?.some(r => r.name?.toLowerCase() === 'manager') &&
            emp.role?.toLowerCase() !== 'manager'
        )
        .map(emp => ({
            value: emp.id,
            label: `${emp.user?.firstName} ${emp.user?.lastName} (${emp.role || 'Employee'})`
        }));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold">Company Managers</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Users with 'Manager' role can login with "pasword123" for manager portal.
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => fetchData()} iconName="RefreshCw">
                        Refresh
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)} iconName="Plus">
                        Add Manager
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {managers.map((manager) => (
                        <div key={manager.id} className="group relative p-5 border border-border rounded-xl bg-card hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border-2 border-primary/20">
                                    {manager.user?.firstName?.[0]}{manager.user?.lastName?.[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-lg truncate">
                                        {manager.user?.firstName} {manager.user?.lastName}
                                    </h3>
                                    <div className="flex items-center text-sm text-muted-foreground mt-0.5">
                                        <Icon name="Mail" size={14} className="mr-1.5" />
                                        <span className="truncate">{manager.user?.email}</span>
                                    </div>
                                    <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-2">
                                        Manager + Employee
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => handleRemoveManager(manager.id)}
                                disabled={deletingId === manager.id}
                                className="absolute top-4 right-4 p-2 text-muted-foreground/60 hover:text-destructive transition-colors disabled:opacity-50"
                                title="Remove Manager Role"
                            >
                                {deletingId === manager.id ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                                ) : (
                                    <Icon name="Trash" size={18} />
                                )}
                            </button>
                        </div>
                    ))}
                    
                    {managers.length === 0 && (
                        <div className="col-span-full border-2 border-dashed border-border rounded-2xl py-16 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Icon name="Users" size={32} className="text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">No managers found</h3>
                            <p className="text-muted-foreground mt-1 max-w-sm px-6">
                                Click 'Add Manager' to promote existing employees to the manager role.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-background p-8 rounded-2xl w-full max-w-xl shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold">Promote to Manager</h3>
                                <p className="text-muted-foreground mt-1">Select one or more employees to assign them manage access.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <Icon name="X" size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 pl-1 italic">
                                    Select Employees from Database
                                </label>
                                <Select
                                    options={nonManagerOptions}
                                    value={selectedEmployeeIds}
                                    onChange={(val) => Array.isArray(val) ? setSelectedEmployeeIds(val) : setSelectedEmployeeIds([val])}
                                    placeholder="Search and select employees..."
                                    multiple
                                    className="w-full"
                                    searchable
                                />
                            </div>

                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                                <div className="flex">
                                    <Icon name="Info" className="text-blue-400 mr-3" size={20} />
                                    <p className="text-sm text-blue-700">
                                        Selected employees will be given a separate manager password: <span className="font-bold underline">pasword123</span>. They will still retain their original employee login.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button 
                                    onClick={handleAssignManagers} 
                                    loading={isSaving}
                                    disabled={selectedEmployeeIds.length === 0}
                                    className="px-8"
                                >
                                    Assign Managers ({selectedEmployeeIds.length})
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerList;
