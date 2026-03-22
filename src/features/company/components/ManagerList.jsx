import React, { useState, useEffect } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import api from '../../../api/client';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ManagerList = () => {
    const { user } = useAuthStore();
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchManagers = async () => {
        if (!user?.company?.id) return;
        try {
            setLoading(true);
            // Fetch employees with role 'manager' or similar
            // Assuming we can filter employees by role
            const response = await api.get(`/employees?companyId=${user.company.id}&role=Manager`); // Adjust role filter as needed
            // If the API doesn't support role filtering directly, we might need to filter client side or update API
            // Based on EmployeeService, it supports 'search' which checks role.
            // But let's try to just fetch all and filter client side if needed, or rely on search.
            // Actually, let's just fetch all employees and filter for now.
            const allEmployees = await api.get(`/employees?companyId=${user.company.id}`);

            let employeesData = [];
            if (Array.isArray(allEmployees.data)) {
                employeesData = allEmployees.data;
            } else if (allEmployees.data && Array.isArray(allEmployees.data.data)) {
                employeesData = allEmployees.data.data;
            }

            console.log('ManagerList: Employees fetched:', employeesData.length);
            employeesData.forEach(e => console.log(`Employee: ${e.user?.firstName}, Role: ${e.role}`));

            // Filter for managers (assuming role string contains 'Manager' or similar)
            const managerList = employeesData.filter(emp =>
                emp.role?.toLowerCase().includes('manager') ||
                emp.role?.toLowerCase().includes('admin') ||
                emp.role?.toLowerCase().includes('lead')
            );
            console.log('ManagerList: Managers found:', managerList.length);
            setManagers(managerList);
        } catch (error) {
            console.error('Failed to fetch managers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchManagers();
    }, [user]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Managers</h2>
                <Button onClick={() => window.location.href = '/employee-management?action=add'} iconName="Plus">
                    Add Manager
                </Button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {managers.map((manager) => (
                        <div key={manager.id} className="p-4 border border-border rounded-lg bg-card flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                                {manager.user?.firstName?.[0]}{manager.user?.lastName?.[0]}
                            </div>
                            <div>
                                <h3 className="font-medium">{manager.user?.firstName} {manager.user?.lastName}</h3>
                                <p className="text-sm text-muted-foreground">{manager.role}</p>
                                <p className="text-xs text-muted-foreground">{manager.user?.email}</p>
                            </div>
                        </div>
                    ))}
                    {managers.length === 0 && (
                        <div className="col-span-full text-center py-8 text-muted-foreground">
                            No managers found. Add employees with 'Manager' role.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ManagerList;
