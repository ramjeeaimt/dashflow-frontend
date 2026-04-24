import React, { useState, useEffect, useMemo } from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import useAuthStore from '../../../store/useAuthStore';
import financeService from '../../../services/finance.service';
import { employeeService } from '../../../services/employee.service';
import PayrollDetailsModal from '../components/PayrollDetailsModal';

const PayrollPage = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [payrollData, setPayrollData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const { user } = useAuthStore();

    // ========== NEW: Search filter state ==========
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPayrollId, setCurrentPayrollId] = useState(null);

    // ========== NEW: Manual payroll modal state ==========
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [employeesList, setEmployeesList] = useState([]);
    const [manualFormData, setManualFormData] = useState({
        employeeId: '',
        basicSalary: '',
        allowances: '',
        deductions: '',
        overtime: '',
        netSalary: '',
        month: selectedMonth,
        year: selectedYear,
        status: 'pending',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // ========== NEW: Auto‑calculate net salary ==========
    useEffect(() => {
        const basic = parseFloat(manualFormData.basicSalary) || 0;
        const allowances = parseFloat(manualFormData.allowances) || 0;
        const deductions = parseFloat(manualFormData.deductions) || 0;
        const overtime = parseFloat(manualFormData.overtime) || 0;
        const net = basic + allowances + overtime - deductions;
        setManualFormData(prev => ({ ...prev, netSalary: net.toFixed(2) }));
    }, [manualFormData.basicSalary, manualFormData.allowances, manualFormData.deductions, manualFormData.overtime]);

    // ========== NEW: Fetch employees when modal opens ==========
    useEffect(() => {
        if (isManualModalOpen && user?.company?.id) {
            const fetchEmployees = async () => {
                try {
                    const employees = await employeeService.getAll({ companyId: user.company.id });
                    setEmployeesList(employees);
                } catch (error) {
                    console.error('Failed to fetch employees:', error);
                }
            };
            fetchEmployees();
        }
    }, [isManualModalOpen, user]);

    const generatePayroll = async () => {
        // ... (your existing generatePayroll logic, unchanged)
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
        // ... (your existing fetchPayroll logic, unchanged)
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

    // ========== NEW: Filtered data based on search term ==========
    const filteredPayrollData = useMemo(() => {
        if (!payrollData || !Array.isArray(payrollData)) return [];
        if (!searchTerm.trim()) return payrollData;

        const term = searchTerm.toLowerCase();
        return payrollData.filter(record => {
            const employee = record.employee || {};
            const user = employee.user || {};
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
            const email = (user.email || '').toLowerCase();
            // Adjust phone field according to your data structure – here we assume it's under user.phone or employee.phone
            const phone = (user.phone || employee.phone || '').toLowerCase();

            return fullName.includes(term) || email.includes(term) || phone.includes(term);
        });
    }, [payrollData, searchTerm]);

    // ========== NEW: Manual payroll handlers ==========
    const handleManuallyPayroll = () => {
        setIsEditing(false);
        setCurrentPayrollId(null);
        // Reset form with current month/year
        setManualFormData({
            employeeId: '',
            basicSalary: '',
            allowances: '',
            deductions: '',
            overtime: '',
            netSalary: '',
            month: selectedMonth,
            year: selectedYear,
            status: 'pending',
            notes: ''
        });
        setIsManualModalOpen(true);
    };

    const handleEditPayroll = (record) => {
        setIsEditing(true);
        setCurrentPayrollId(record.id);
        setManualFormData({
            employeeId: record.employeeId,
            basicSalary: record.basicSalary || 0,
            allowances: record.allowances || 0,
            deductions: record.deductions || 0,
            overtime: record.overtime || 0,
            netSalary: record.netSalary || 0,
            month: record.month,
            year: record.year,
            status: record.status,
            notes: record.notes || ''
        });
        setIsManualModalOpen(true);
    };

    const handleDeletePayroll = async (id) => {
        if (!window.confirm('Are you sure you want to delete this payroll record?')) return;
        
        try {
            await financeService.deletePayroll(id);
            alert('Payroll record deleted successfully');
            fetchPayroll();
        } catch (error) {
            console.error('Failed to delete payroll:', error);
            alert('Error deleting payroll');
        }
    };

    const handleManualInputChange = (e) => {
        const { name, value } = e.target;
        setManualFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!manualFormData.employeeId) {
            alert('Please select an employee');
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = {
                ...manualFormData,
                basicSalary: parseFloat(manualFormData.basicSalary) || 0,
                allowances: parseFloat(manualFormData.allowances) || 0,
                deductions: parseFloat(manualFormData.deductions) || 0,
                overtime: parseFloat(manualFormData.overtime) || 0,
                netSalary: parseFloat(manualFormData.netSalary) || 0,
                companyId: user.company.id,
                month: parseInt(manualFormData.month),
                year: parseInt(manualFormData.year)
            };
            if (isEditing) {
                await financeService.updatePayroll(currentPayrollId, payload);
                alert('Payroll record updated successfully');
            } else {
                await financeService.createPayroll(payload);
                alert('Payroll record created successfully');
            }
            setIsManualModalOpen(false);
            fetchPayroll(); // Refresh list
        } catch (error) {
            console.error('Failed to create manual payroll:', error);
            alert('Error creating payroll');
        } finally {
            setIsSubmitting(false);
        }
    };

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    const handleToggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Payroll', path: '/payroll' },
    ];

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
                <div className="p-4 sm:p-6">
                    <BreadcrumbNavigation items={breadcrumbItems} />

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Payroll Management</h1>
                            <p className="text-muted-foreground mt-1">Manage employee salaries and disbursements</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    className="flex-1 sm:flex-none bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="flex-1 sm:flex-none bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <Button onClick={generatePayroll} iconName="Plus" className="w-full sm:w-auto">Generate Payroll</Button>
                                <Button onClick={handleManuallyPayroll} variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">Manually Generate</Button>
                            </div>
                        </div>
                    </div>

                    {/* ========== NEW: Search input ========== */}
                    <div className="mb-4">
                        <div className="relative">
                            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none "
                            />
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-border">
                            <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-full">
                                <thead>
                                    <tr className="bg-muted/50 border-b border-border">
                                        <th className="px-3 sm:px-6 py-4 text-sm font-semibold text-foreground">Employee</th>
                                        <th className="px-3 sm:px-6 py-4 text-sm font-semibold text-foreground">Basic Salary</th>
                                        <th className="px-3 sm:px-6 py-4 text-sm font-semibold text-foreground">Allowances</th>
                                        <th className="px-3 sm:px-6 py-4 text-sm font-semibold text-foreground">Deductions</th>
                                        <th className="px-3 sm:px-6 py-4 text-sm font-semibold text-foreground whitespace-nowrap">Net Payable</th>
                                        <th className="px-3 sm:px-6 py-4 text-sm font-semibold text-foreground">Status</th>
                                        <th className="px-3 sm:px-6 py-4 text-sm font-semibold text-foreground text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="7" className="px-3 sm:px-6 py-12 text-center">
                                                <Icon name="Loader2" size={24} className="animate-spin text-primary mx-auto mb-2" />
                                                <p className="text-muted-foreground">Loading payroll records...</p>
                                            </td>
                                        </tr>
                                    ) : (!filteredPayrollData || filteredPayrollData.length === 0) ? (
                                        <tr>
                                            <td colSpan="7" className="px-3 sm:px-6 py-12 text-center">
                                                <Icon name="DollarSign" size={48} className="text-muted-foreground/20 mx-auto mb-4" />
                                                <p className="text-foreground font-medium">
                                                    {searchTerm ? 'No matching records found' : 'No payroll records found'}
                                                </p>
                                                <p className="text-muted-foreground text-sm">
                                                    {searchTerm 
                                                        ? 'Try adjusting your search term.' 
                                                        : `Records for ${months.find(m => m.value === selectedMonth).label} ${selectedYear} will appear here.`}
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPayrollData.map((record) => (
                                            <React.Fragment key={record.id}>
                                            <tr className="hover:bg-muted/30 transition-colors">
                                                <td className="px-3 sm:px-6 py-4">
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
                                                <td className="px-3 sm:px-6 py-4 text-sm">₹{record.basicSalary}</td>
                                                <td className="px-3 sm:px-6 py-4 text-sm text-green-600">+₹{record.allowances}</td>
                                                <td className="px-3 sm:px-6 py-4 text-sm text-red-600">-₹{record.deductions}</td>
                                                <td className="px-3 sm:px-6 py-4 text-sm font-bold text-foreground whitespace-nowrap">₹{record.netSalary}</td>
                                                <td className="px-3 sm:px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-3 sm:px-6 py-4">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedPayroll(record);
                                                                setIsDetailsModalOpen(true);
                                                            }}
                                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                            title="View"
                                                        >
                                                            <Icon name="Eye" size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleEditPayroll(record)}
                                                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                            title="Edit"
                                                        >
                                                            <Icon name="Pencil" size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeletePayroll(record.id)}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Delete"
                                                        >
                                                            <Icon name="Trash2" size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            </React.Fragment>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* NEW: Manual Payroll Modal*/}
            {isManualModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h2 className="text-xl font-bold text-foreground">
                                {isEditing ? 'Edit Payroll Entry' : 'Manual Payroll Entry'}
                            </h2>
                            <button onClick={() => setIsManualModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <Icon name="X" size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Employee Selection */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-foreground mb-1">Employee *</label>
                                    <select
                                        name="employeeId"
                                        value={manualFormData.employeeId}
                                        onChange={handleManualInputChange}
                                        required
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">Select Employee</option>
                                        {employeesList.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.user?.firstName} {emp.user?.lastName} ({emp.employeeCode})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Month and Year */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Month</label>
                                    <select
                                        name="month"
                                        value={manualFormData.month}
                                        onChange={handleManualInputChange}
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                    >
                                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Year</label>
                                    <select
                                        name="year"
                                        value={manualFormData.year}
                                        onChange={handleManualInputChange}
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                    >
                                        {[2023, 2024, 2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>

                                {/* Salary Components */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Basic Salary</label>
                                    <input
                                        type="number"
                                        name="basicSalary"
                                        value={manualFormData.basicSalary}
                                        onChange={handleManualInputChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Allowances</label>
                                    <input
                                        type="number"
                                        name="allowances"
                                        value={manualFormData.allowances}
                                        onChange={handleManualInputChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Deductions</label>
                                    <input
                                        type="number"
                                        name="deductions"
                                        value={manualFormData.deductions}
                                        onChange={handleManualInputChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Overtime</label>
                                    <input
                                        type="number"
                                        name="overtime"
                                        value={manualFormData.overtime}
                                        onChange={handleManualInputChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>

                                {/* Net Salary (auto-calculated, read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Net Salary</label>
                                    <input
                                        type="number"
                                        name="netSalary"
                                        value={manualFormData.netSalary}
                                        readOnly
                                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                                    />
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={manualFormData.status}
                                        onChange={handleManualInputChange}
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="paid">Processing</option>
                                    </select>
                                </div>

                                {/* Notes */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
                                    <textarea
                                        name="notes"
                                        value={manualFormData.notes}
                                        onChange={handleManualInputChange}
                                        rows="3"
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                                <Button type="button" variant="outline" onClick={() => setIsManualModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting 
                                        ? (isEditing ? 'Updating...' : 'Creating...') 
                                        : (isEditing ? 'Update Payroll' : 'Create Payroll')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <PayrollDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                payroll={selectedPayroll}
            />
        </div>
    );
};

export default PayrollPage;