import React, { useState, useEffect } from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import useAuthStore from '../../../store/useAuthStore';
import financeService from '../../../services/finance.service';
import { employeeService } from '../../../services/employee.service';

const PayrollPage = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [payrollData, setPayrollData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const { user } = useAuthStore();

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ];

   const generatePayroll = async () => {
    try {
        setIsLoading(true);

        // 🔹 1. Check already generated
        const existing = await financeService.getPayroll(
            user.company.id,
            selectedMonth,
            selectedYear
        );

        if (existing.length > 0) {
            alert("Payroll already generated for this month ");
            return;
        }

        // 🔹 2. Get employees
        const employees = await employeeService.getAll({
            companyId: user.company.id
        });

        if (!employees.length) {
            alert("No employees found ");
            return;
        }

        // 🔹 3. Generate payroll
        const requests = employees.map(emp => {
            const basicSalary = emp.salary || 20000;
            const allowances = 3000;
            const deductions = 1000;

            return financeService.createPayroll({
                employeeId: emp.id,
                companyId: user.company.id,
                basicSalary,
                allowances,
                deductions,
                netSalary: basicSalary + allowances - deductions,
                month: selectedMonth,
                year: selectedYear,
                status: "pending"
            });
        });

        // Parallel API calls (FAST)
        await Promise.all(requests);

        alert("Payroll generated successfully ");

        //  Refresh
        fetchPayroll();

    } catch (error) {
        console.error("Payroll generation failed:", error);
        alert("Error generating payroll ");
    } finally {
        setIsLoading(false);
    }
};

    const fetchPayroll = async () => {
        setIsLoading(true);
        try {
            const data = await financeService.getPayroll(user?.company?.id, selectedMonth, selectedYear);
            setPayrollData(data);
        } catch (error) {
            console.error('Failed to fetch payroll:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.company?.id) {
            fetchPayroll();
        }
    }, [user, selectedMonth, selectedYear]);

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Payroll', path: '/payroll' },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <Sidebar 
                isCollapsed={sidebarCollapsed} 
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
            />
            <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-20 lg:pb-8 flex flex-col min-h-screen`}>
                <div className="p-6">
                    <BreadcrumbNavigation items={breadcrumbItems} />

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Payroll Management</h1>
                            <p className="text-muted-foreground mt-1">Manage employee salaries and disbursements</p>
                        </div>
                        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {[2023, 2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <Button onClick={generatePayroll} iconName="Plus">Generate Payroll</Button>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/50 border-b border-border">
                                        <th className="px-6 py-4 text-sm font-semibold text-foreground">Employee</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-foreground">Basic Salary</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-foreground">Allowances</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-foreground">Deductions</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-foreground">Net Payable</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-foreground">Status</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-foreground">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center">
                                                <Icon name="Loader2" size={24} className="animate-spin text-primary mx-auto mb-2" />
                                                <p className="text-muted-foreground">Loading payroll records...</p>
                                            </td>
                                        </tr>
                                    ) : (!payrollData || !Array.isArray(payrollData) || payrollData.length === 0) ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center">
                                                <Icon name="DollarSign" size={48} className="text-muted-foreground/20 mx-auto mb-4" />
                                                <p className="text-foreground font-medium">No payroll records found</p>
                                                <p className="text-muted-foreground text-sm">Records for {months.find(m => m.value === selectedMonth).label} {selectedYear} will appear here.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        payrollData.map((record) => (
                                            <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                            {record.employee?.user?.firstName?.[0]}{record.employee?.user?.lastName?.[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">{record.employee?.user?.firstName} {record.employee?.user?.lastName}</p>
                                                            <p className="text-xs text-muted-foreground">{record.employee?.employeeCode}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm">${record.basicSalary}</td>
                                                <td className="px-6 py-4 text-sm text-green-600">+${record.allowances}</td>
                                                <td className="px-6 py-4 text-sm text-red-600">-${record.deductions}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-foreground">${record.netSalary}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button className="text-primary hover:text-primary/80 transition-colors">
                                                        <Icon name="Eye" size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PayrollPage;
