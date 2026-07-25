import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Icon from '../../../components/AppIcon';
import financeService from '../../../services/finance.service';
import { leaveService } from '../../../services/leaveService';
import { toast } from 'react-hot-toast';

const PayrollDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [payroll, setPayroll] = useState(null);
    const [leaves, setLeaves] = useState([]);

    useEffect(() => {
        const fetchPayrollDetails = async () => {
            setLoading(true);
            try {
                const payrollData = await financeService.getPayrollById(id);
                setPayroll(payrollData);

                // Fetch employee leaves to show history for this specific cycle month/year
                if (payrollData?.employeeId) {
                    const leavesData = await leaveService.getEmployeeLeaves(payrollData.employeeId);
                    const leavesList = leavesData?.data || leavesData || [];

                    // Filter leaves falling within the payroll month/year
                    const cycleMonth = payrollData.month;
                    const cycleYear = payrollData.year;
                    const filtered = leavesList.filter(lv => {
                        const start = new Date(lv.startDate);
                        const end = new Date(lv.endDate);
                        return (start.getMonth() + 1 === cycleMonth && start.getFullYear() === cycleYear) ||
                               (end.getMonth() + 1 === cycleMonth && end.getFullYear() === cycleYear);
                    });
                    setLeaves(filtered);
                }
            } catch (err) {
                console.error("Failed to load payroll details:", err);
                toast.error("Failed to load payroll details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPayrollDetails();
        }
    }, [id]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const fmtDate = (d) => {
        if (!d) return '---';
        return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const inclusiveDays = (start, end) => {
        if (!start || !end) return 0;
        const s = new Date(start);
        const e = new Date(end);
        const diff = e.getTime() - s.getTime();
        return Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FBFBFE]">
                <Header />
                <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <main className={`transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-60"} pt-16`}>
                    <div className="h-[60vh] flex flex-col items-center justify-center">
                        <Icon name="Loader" className="animate-spin text-primary mb-2" size={40} />
                        <p className="text-muted-foreground text-sm font-medium">Loading payroll details...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!payroll) {
        return (
            <div className="min-h-screen bg-[#FBFBFE]">
                <Header />
                <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <main className={`transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-60"} pt-16`}>
                    <div className="max-w-4xl mx-auto px-6 py-12 text-center">
                        <Icon name="AlertCircle" className="text-muted-foreground/30 mx-auto mb-4" size={48} />
                        <h2 className="text-lg font-bold text-foreground mb-1">Payroll Record Not Found</h2>
                        <p className="text-muted-foreground text-sm mb-4">The payroll record you are looking for does not exist or you do not have permission to view it.</p>
                        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl">Go Back</button>
                    </div>
                </main>
            </div>
        );
    }

    const employee = payroll.employee || {};
    const user = employee.user || {};
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Employee';
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthLabel = monthNames[payroll.month - 1] || '---';

    return (
        <div className="min-h-screen bg-[#FBFBFE]">
            <Header />
            <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

            <main className={`transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-60"} pt-16 pb-12`}>
                <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
                    {/* Top back navigation */}
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted/60 rounded-xl transition-all">
                            <Icon name="ArrowLeft" size={20} className="text-muted-foreground/70" />
                        </button>
                        <div>
                            <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide">Back to Payroll Suite</span>
                            <h1 className="text-xl font-bold text-foreground">Payslip Audit Details</h1>
                        </div>
                    </div>

                    {/* Employee Profile Header Summary */}
                    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-primary text-white rounded-[16px] flex items-center justify-center text-lg font-bold">
                                {user.firstName?.[0] || 'E'}{user.lastName?.[0] || ''}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-foreground">{fullName}</h2>
                                <p className="text-xs text-muted-foreground/80 font-medium">ID: {employee.employeeCode || 'N/A'} · {payroll.month}/{payroll.year} Cycle</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide">Net Payable</span>
                                <h3 className="text-xl font-extrabold text-foreground">{formatCurrency(payroll.netSalary)}</h3>
                            </div>
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase border ${
                                payroll.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                payroll.status === 'sent' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                                {payroll.status || 'draft'}
                            </span>
                        </div>
                    </div>

                    {/* Breakdown Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Monthly Earnings */}
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-4">
                            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide border-b border-border/40 pb-2 flex items-center gap-1.5">
                                <Icon name="PlusCircle" size={14} className="text-emerald-500" /> Earnings
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between font-medium text-muted-foreground">
                                    <span>Basic Salary</span>
                                    <span className="text-foreground font-bold">{formatCurrency(payroll.basicSalary)}</span>
                                </div>
                                <div className="flex justify-between font-medium text-muted-foreground">
                                    <span>Allowances</span>
                                    <span className="text-emerald-600 font-bold">+{formatCurrency(payroll.allowances)}</span>
                                </div>
                                <div className="flex justify-between font-medium text-muted-foreground">
                                    <span>Overtime Pay</span>
                                    <span className="text-emerald-600 font-bold">+{formatCurrency(payroll.overtime)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Deductions breakdown */}
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-4">
                            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide border-b border-border/40 pb-2 flex items-center gap-1.5">
                                <Icon name="MinusCircle" size={14} className="text-rose-500" /> Deductions
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between font-medium text-muted-foreground">
                                    <span>Leave Deduction</span>
                                    <span className="text-rose-600 font-bold">-{formatCurrency(payroll.leaveDeduction || 0)}</span>
                                </div>
                                <div className="flex justify-between font-medium text-muted-foreground">
                                    <span>Half-Day Deduction</span>
                                    <span className="text-rose-600 font-bold">-{formatCurrency(payroll.halfDeduction || 0)}</span>
                                </div>
                                <div className="flex justify-between border-t border-border/40 pt-2 font-bold text-foreground">
                                    <span>Total Deductions</span>
                                    <span className="text-rose-600">{formatCurrency(payroll.deductions)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Leave Balance & Attendance Stats */}
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-4">
                            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide border-b border-border/40 pb-2 flex items-center gap-1.5">
                                <Icon name="Calendar" size={14} className="text-primary" /> Cycle Attendance
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between font-medium text-muted-foreground">
                                    <span>Working Days in Month</span>
                                    <span className="text-foreground font-bold">{payroll.totalWorkingDays || 22} days</span>
                                </div>
                                <div className="flex justify-between font-medium text-muted-foreground">
                                    <span>Worked Days</span>
                                    <span className="text-foreground font-bold">{payroll.workDays || 0} days</span>
                                </div>
                                <div className="flex justify-between font-medium text-muted-foreground">
                                    <span>Paid Leaves Used (CL)</span>
                                    <span className="text-emerald-600 font-bold">{payroll.paidLeaves || 0} days</span>
                                </div>
                                <div className="flex justify-between font-medium text-muted-foreground">
                                    <span>Unpaid Leaves (Deducted)</span>
                                    <span className="text-rose-600 font-bold">{payroll.unpaidLeaves || 0} days</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Leaves list taken in this month */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wide border-b border-border/40 pb-3 flex items-center gap-1.5 mb-4">
                            <Icon name="Palmtree" size={14} className="text-primary" /> Leaves Taken in {monthLabel} {payroll.year} ({leaves.length})
                        </h3>

                        {leaves.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground/60 text-sm">
                                <Icon name="Info" size={24} className="mx-auto mb-2 text-slate-200" />
                                No leave applications registered for this calendar month.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="text-muted-foreground uppercase tracking-wider font-bold border-b border-border/40">
                                            <th className="py-2.5 px-3">Category</th>
                                            <th className="py-2.5 px-3">Start Date</th>
                                            <th className="py-2.5 px-3">End Date</th>
                                            <th className="py-2.5 px-3">Duration</th>
                                            <th className="py-2.5 px-3">Reason</th>
                                            <th className="py-2.5 px-3 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {leaves.map((lv) => (
                                            <tr key={lv.id} className="hover:bg-muted/30 transition-all">
                                                <td className="py-3 px-3 capitalize font-bold text-foreground">{lv.type} Leave</td>
                                                <td className="py-3 px-3 text-muted-foreground/90">{fmtDate(lv.startDate)}</td>
                                                <td className="py-3 px-3 text-muted-foreground/90">{fmtDate(lv.endDate)}</td>
                                                <td className="py-3 px-3 font-semibold text-foreground">{inclusiveDays(lv.startDate, lv.endDate)} day(s)</td>
                                                <td className="py-3 px-3 text-muted-foreground/80 max-w-xs truncate" title={lv.reason}>{lv.reason || '---'}</td>
                                                <td className="py-3 px-3 text-right">
                                                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase border ${
                                                        lv.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        lv.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                                    }`}>
                                                        {lv.status || 'pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Manager Notes / Remarks */}
                    {payroll.notes && (
                        <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-6 space-y-2">
                            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                                <Icon name="FileText" size={14} /> Manager Remarks
                            </h4>
                            <p className="text-sm text-amber-900/80 font-medium whitespace-pre-wrap">{payroll.notes}</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PayrollDetailsPage;
