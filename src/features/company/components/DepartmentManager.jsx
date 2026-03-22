import React, { useState, useEffect } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import api from '../../../api/client';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';

const DepartmentManager = () => {
    const { user } = useAuthStore();
    const [departments, setDepartments] = useState([]);
    const [managers, setManagers] = useState([]); // Store manager options
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', managerId: '' });

    const fetchDepartments = async () => {
        if (!user?.company?.id) return;
        try {
            setLoading(true);
            const response = await api.get(`/departments?companyId=${user.company.id}`);
            if (Array.isArray(response.data)) {
                console.log('DepartmentManager: Departments fetched (array):', response.data);
                setDepartments(response.data);
            } else if (response.data && Array.isArray(response.data.data)) {
                console.log('DepartmentManager: Departments fetched (nested):', response.data.data);
                setDepartments(response.data.data);
            } else {
                console.error('Unexpected departments response format:', response.data);
                setDepartments([]);
            }
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchManagers = async () => {
        if (!user?.company?.id) return;
        try {
            // Fetch all employees to allow selecting any employee as manager
            const response = await api.get(`/employees?companyId=${user.company.id}`);
            let employees = [];
            if (Array.isArray(response.data)) {
                employees = response.data;
            } else if (response.data && Array.isArray(response.data.data)) {
                employees = response.data.data;
            }

            // Map to options for Select component
            const managerOptions = employees.map(emp => ({
                value: emp.user?.id, // Assuming we link by User ID as per entity
                label: `${emp.user?.firstName} ${emp.user?.lastName} (${emp.role})`
            })).filter(opt => opt.value); // Filter out any without user ID

            setManagers(managerOptions);
        } catch (error) {
            console.error('Failed to fetch managers:', error);
        }
    };

    useEffect(() => {
        fetchDepartments();
        fetchManagers();
    }, [user]);

    const handleOpenModal = (dept = null) => {
        if (dept) {
            setEditingDept(dept);
            setFormData({
                name: dept.name,
                description: dept.description || '',
                managerId: dept.manager?.id || '' // Use manager's User ID
            });
        } else {
            setEditingDept(null);
            setFormData({ name: '', description: '', managerId: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDept(null);
        setFormData({ name: '', description: '', managerId: '' });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                companyId: user.company.id,
                managerId: formData.managerId || null
            };
            if (editingDept) {
                await api.patch(`/departments/${editingDept.id}`, payload);
            } else {
                await api.post('/departments', payload);
            }
            fetchDepartments();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save department:', error);
            alert('Failed to save department');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;
        try {
            await api.delete(`/departments/${id}`);
            fetchDepartments();
        } catch (error) {
            console.error('Failed to delete department:', error);
            alert('Failed to delete department');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Departments</h2>
                <Button onClick={() => handleOpenModal()} iconName="Plus">
                    Add Department
                </Button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departments.map((dept) => (
                        <div key={dept.id} className="p-4 border border-border rounded-lg bg-card">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-lg">{dept.name}</h3>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleOpenModal(dept)} className="text-muted-foreground hover:text-primary">
                                        <Icon name="Edit" size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(dept.id)} className="text-muted-foreground hover:text-destructive">
                                        <Icon name="Trash" size={16} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">{dept.description || 'No description'}</p>
                            <div className="text-sm">
                                <span className="text-muted-foreground">Manager: </span>
                                <span className="font-medium">{dept.manager ? `${dept.manager.firstName} ${dept.manager.lastName}` : 'Unassigned'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">{editingDept ? 'Edit Department' : 'Add Department'}</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <Input
                                label="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <Input
                                label="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />

                            <Select
                                label="Department Manager"
                                options={managers}
                                value={formData.managerId}
                                onChange={(value) => setFormData({ ...formData, managerId: value })}
                                placeholder="Select a manager"
                                searchable
                                clearable
                            />

                            <div className="flex justify-end space-x-2 mt-6">
                                <Button variant="ghost" onClick={handleCloseModal} type="button">Cancel</Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentManager;
