import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Icon from '../../../components/AppIcon';
import financeService from '../../../services/finance.service';
import { leaveService } from '../../../services/leaveService';
import PayrollReviewModal from '../components/PayrollReviewModal';
import { toast } from 'react-hot-toast';

const PayrollDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [payroll, setPayroll] = useState(null);
    const [leaves, setLeaves] = useState([]);

    // Sibling payroll records for switching employees within this cycle
    const [cyclePayrolls, setCyclePayrolls] = useState([]);
    const [loadingCycle, setLoadingCycle] = useState(false);

    // Modal & action button states
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [isPrintingPdf, setIsPrintingPdf] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isRecalculating, setIsRecalculating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Edit form state
    const [editFormData, setEditFormData] = useState({
        basicSalary: 0,
        allowances: 0,
        deductions: 0,
        overtime: 0,
        status: 'draft',
        notes: ''
    });

    const fetchPayrollDetails = useCallback(async (payrollId) => {
        setLoading(true);
        try {
            const payrollData = await financeService.getPayrollById(payrollId);
            if (!payrollData) {
                throw new Error("Payroll record not found");
            }
            setPayroll(payrollData);

            // Populate edit form
            setEditFormData({
                basicSalary: payrollData.basicSalary || 0,
                allowances: payrollData.allowances || 0,
                deductions: payrollData.deductions || 0,
                overtime: payrollData.overtime || 0,
                status: payrollData.status || 'draft',
                notes: payrollData.notes || ''
            });

            // Fetch sibling cycle payrolls if not already fetched or if month/year changed
            if (payrollData?.companyId && payrollData?.month && payrollData?.year) {
                fetchCyclePayrolls(payrollData.companyId, payrollData.month, payrollData.year);
            }

            // Fetch employee leaves to show history for this specific cycle month/year
            if (payrollData?.employeeId) {
                try {
                    const leavesData = await leaveService.getEmployeeLeaves(payrollData.employeeId);
                    const leavesList = leavesData?.data?.data || leavesData?.data || leavesData || [];

                    const cycleMonth = Number(payrollData.month);
                    const cycleYear = Number(payrollData.year);
                    const filtered = Array.isArray(leavesList) ? leavesList.filter(lv => {
                        if (!lv || !lv.startDate || !lv.endDate) return false;
                        const start = new Date(lv.startDate);
                        const end = new Date(lv.endDate);
                        return (start.getMonth() + 1 === cycleMonth && start.getFullYear() === cycleYear) ||
                               (end.getMonth() + 1 === cycleMonth && end.getFullYear() === cycleYear);
                    }) : [];
                    setLeaves(filtered);
                } catch (leaveErr) {
                    console.warn("Non-fatal: could not load employee leaves:", leaveErr);
                    setLeaves([]);
                }
            }
        } catch (err) {
            console.error("Failed to load payroll details:", err);
            toast.error("Failed to load payroll details.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCyclePayrolls = async (companyId, month, year) => {
        setLoadingCycle(true);
        try {
            const list = await financeService.getPayroll(companyId, month, year);
            const array = Array.isArray(list) ? list : [];
            // Sort alphabetically by employee first name
            array.sort((a, b) => {
                const nameA = (a.employee?.user?.firstName || '').toLowerCase();
                const nameB = (b.employee?.user?.firstName || '').toLowerCase();
                return nameA.localeCompare(nameB);
            });
            setCyclePayrolls(array);
        } catch (err) {
            console.warn("Could not load sibling cycle payrolls:", err);
        } finally {
            setLoadingCycle(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchPayrollDetails(id);
        }
    }, [id, fetchPayrollDetails]);

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

    // --- Action Handlers ---

    // 1. Download PDF
    const handleDownloadPdf = async () => {
        if (!payroll?.id) return;
        setIsDownloadingPdf(true);
        try {
            const blob = await financeService.getPayslipPdf(payroll.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const empCode = payroll.employee?.employeeCode || 'EMP';
            a.download = `payslip-${empCode}-${payroll.month}-${payroll.year}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => window.URL.revokeObjectURL(url), 2000);
            toast.success('Payslip PDF downloaded');
        } catch (err) {
            console.error('PDF download error:', err);
            toast.error('Failed to download PDF payslip.');
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    // 2. Print / Preview PDF
    const handlePrintPdf = async () => {
        if (!payroll?.id) return;
        setIsPrintingPdf(true);
        try {
            const blob = await financeService.getPayslipPdf(payroll.id);
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank', 'noopener');
            setTimeout(() => window.URL.revokeObjectURL(url), 60000);
        } catch (err) {
            console.error('Print error:', err);
            toast.error('Failed to preview payslip.');
        } finally {
            setIsPrintingPdf(false);
        }
    };

    // 3. Toggle Status (Paid / Draft)
    const handleTogglePaidStatus = async () => {
        if (!payroll?.id) return;
        const newStatus = payroll.status === 'paid' ? 'draft' : 'paid';
        setIsUpdatingStatus(true);
        try {
            await financeService.updatePayroll(payroll.id, { status: newStatus });
            setPayroll(prev => ({ ...prev, status: newStatus }));
            setCyclePayrolls(prev => prev.map(p => p.id === payroll.id ? { ...p, status: newStatus } : p));
            toast.success(`Payroll marked as ${newStatus.toUpperCase()}`);
        } catch (err) {
            console.error('Failed to update status:', err);
            toast.error('Failed to update payroll status.');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    // 4. Recalculate / Regenerate
    const handleRecalculate = async () => {
        if (!payroll?.id) return;
        const confirmMsg = `Recalculate payroll for ${payroll.employee?.user?.firstName || 'this employee'} (${payroll.month}/${payroll.year}) from latest attendance & leaves?`;
        if (!window.confirm(confirmMsg)) return;

        setIsRecalculating(true);
        try {
            await financeService.bulkGenerateRealPayroll(
                payroll.month,
                payroll.year,
                payroll.companyId,
                payroll.employeeId
            );
            toast.success('Payroll recalculated successfully from live attendance!');
            await fetchPayrollDetails(payroll.id);
        } catch (err) {
            console.error('Recalculate failed:', err);
            toast.error('Failed to recalculate payroll.');
        } finally {
            setIsRecalculating(false);
        }
    };

    // 5. Save Manual Edits
    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!payroll?.id) return;
        try {
            const basic = parseFloat(editFormData.basicSalary) || 0;
            const allow = parseFloat(editFormData.allowances) || 0;
            const ded = parseFloat(editFormData.deductions) || 0;
            const ot = parseFloat(editFormData.overtime) || 0;
            const calculatedNet = Math.max(0, basic + allow + ot - ded);

            const payload = {
                basicSalary: basic,
                allowances: allow,
                deductions: ded,
                overtime: ot,
                netSalary: calculatedNet,
                status: editFormData.status,
                notes: editFormData.notes
            };

            await financeService.updatePayroll(payroll.id, payload);
            setPayroll(prev => ({ ...prev, ...payload }));
            setCyclePayrolls(prev => prev.map(p => p.id === payroll.id ? { ...p, ...payload } : p));
            setIsEditModalOpen(false);
            toast.success('Payroll details updated successfully!');
        } catch (err) {
            console.error('Failed to save payroll edits:', err);
            toast.error('Failed to save changes.');
        }
    };

    // 6. Delete Payroll
    const handleDeletePayroll = async () => {
        if (!payroll?.id) return;
        const empName = payroll.employee?.user?.firstName || 'Employee';
        if (!window.confirm(`Are you sure you want to delete the payroll record for ${empName}? This cannot be undone.`)) return;

        setIsDeleting(true);
        try {
            await financeService.deletePayroll(payroll.id);
            toast.success('Payroll record deleted');
            navigate('/payroll');
        } catch (err) {
            console.error('Delete failed:', err);
            toast.error('Failed to delete payroll record.');
            setIsDeleting(false);
        }
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
    const perDayRate = payroll.totalWorkingDays > 0 ? (payroll.basicSalary / payroll.totalWorkingDays) : 0;

    // Sibling navigation indices
    const currentIdx = cyclePayrolls.findIndex(p => p.id === payroll.id);
    const prevPayroll = currentIdx > 0 ? cyclePayrolls[currentIdx - 1] : null;
    const nextPayroll = currentIdx >= 0 && currentIdx < cyclePayrolls.length - 1 ? cyclePayrolls[currentIdx + 1] : null;

    return (
        <div className="min-h-screen bg-[#FBFBFE]">
            <Header />
            <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

            <main className={`transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-60"} pt-16 pb-12`}>
                <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

                    {/* Top Navigation Row: Back Link & Employee Switcher */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/payroll')} className="p-2 hover:bg-muted/60 rounded-xl transition-all border border-border/50">
                                <Icon name="ArrowLeft" size={20} className="text-muted-foreground/70" />
                            </button>
                            <div>
                                <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide">Back to Payroll Suite</span>
                                <h1 className="text-xl font-bold text-foreground">Payslip Audit Details</h1>
                            </div>
                        </div>

                        {/* Employee Switcher Toolbar */}
                        <div className="flex items-center gap-2 self-start sm:self-auto bg-card p-1.5 rounded-2xl border border-border shadow-xs">
                            <button
                                onClick={() => prevPayroll && navigate(`/payroll/${prevPayroll.id}`)}
                                disabled={!prevPayroll}
                                className="p-1.5 hover:bg-muted/80 rounded-xl text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                title={prevPayroll ? `Previous: ${prevPayroll.employee?.user?.firstName || 'Employee'}` : 'First employee in cycle'}
                            >
                                <Icon name="ChevronLeft" size={18} />
                            </button>

                            <div className="relative">
                                <select
                                    value={payroll.id}
                                    onChange={(e) => navigate(`/payroll/${e.target.value}`)}
                                    className="appearance-none bg-muted/40 hover:bg-muted/70 text-foreground text-xs font-semibold py-1.5 pl-3 pr-8 rounded-xl border border-border/60 focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer max-w-[210px] sm:max-w-[260px] truncate"
                                >
                                    {cyclePayrolls.length > 0 ? (
                                        cyclePayrolls.map((cp, idx) => {
                                            const u = cp.employee?.user || {};
                                            const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Employee';
                                            const code = cp.employee?.employeeCode || 'N/A';
                                            return (
                                                <option key={cp.id} value={cp.id}>
                                                    {idx + 1}. {name} ({code}) · {formatCurrency(cp.netSalary)}
                                                </option>
                                            );
                                        })
                                    ) : (
                                        <option value={payroll.id}>{fullName} ({employee.employeeCode || 'N/A'})</option>
                                    )}
                                </select>
                                <Icon name="ChevronDown" size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
                            </div>

                            <button
                                onClick={() => nextPayroll && navigate(`/payroll/${nextPayroll.id}`)}
                                disabled={!nextPayroll}
                                className="p-1.5 hover:bg-muted/80 rounded-xl text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                title={nextPayroll ? `Next: ${nextPayroll.employee?.user?.firstName || 'Employee'}` : 'Last employee in cycle'}
                            >
                                <Icon name="ChevronRight" size={18} />
                            </button>

                            {cyclePayrolls.length > 0 && (
                                <span className="text-[10px] font-bold text-muted-foreground/70 px-2 py-0.5 bg-muted rounded-lg border border-border/40 hidden md:inline-block">
                                    {currentIdx >= 0 ? currentIdx + 1 : 1}/{cyclePayrolls.length}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Employee Profile Header Summary + Action Toolbar */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-5">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-primary text-white rounded-[16px] flex items-center justify-center text-lg font-bold shadow-xs">
                                    {user.firstName?.[0] || 'E'}{user.lastName?.[0] || ''}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-bold text-foreground">{fullName}</h2>
                                        {employee.department && (
                                            <span className="text-[10px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/40">
                                                {typeof employee.department === 'string' ? employee.department : employee.department.name}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground/80 font-medium mt-0.5">
                                        ID: {employee.employeeCode || 'N/A'} · {payroll.month}/{payroll.year} Cycle
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 self-end md:self-auto">
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

                        {/* All Action Buttons Row */}
                        <div className="pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Mark as Paid / Mark as Draft Toggle */}
                                <button
                                    onClick={handleTogglePaidStatus}
                                    disabled={isUpdatingStatus}
                                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border shadow-xs transition-all ${
                                        payroll.status === 'paid'
                                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                                            : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                                    }`}
                                >
                                    <Icon name={payroll.status === 'paid' ? "RotateCcw" : "CheckCircle2"} size={15} />
                                    {payroll.status === 'paid' ? "Mark as Draft" : "Mark as Paid"}
                                </button>

                                {/* Review & Send Email Modal */}
                                <button
                                    onClick={() => setIsReviewModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 shadow-xs transition-all"
                                >
                                    <Icon name="Mail" size={15} />
                                    Review & Send Email
                                </button>

                                {/* Download PDF */}
                                <button
                                    onClick={handleDownloadPdf}
                                    disabled={isDownloadingPdf}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-card hover:bg-muted/80 text-foreground text-xs font-semibold rounded-xl border border-border shadow-xs transition-all disabled:opacity-50"
                                >
                                    <Icon name={isDownloadingPdf ? "Loader2" : "Download"} size={15} className={isDownloadingPdf ? "animate-spin" : ""} />
                                    {isDownloadingPdf ? "Downloading..." : "Download PDF"}
                                </button>

                                {/* Print / Preview PDF */}
                                <button
                                    onClick={handlePrintPdf}
                                    disabled={isPrintingPdf}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-card hover:bg-muted/80 text-foreground text-xs font-semibold rounded-xl border border-border shadow-xs transition-all disabled:opacity-50"
                                >
                                    <Icon name="Printer" size={15} />
                                    Print
                                </button>

                                {/* Recalculate Live Attendance */}
                                <button
                                    onClick={handleRecalculate}
                                    disabled={isRecalculating}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-card hover:bg-muted/80 text-foreground text-xs font-semibold rounded-xl border border-border shadow-xs transition-all disabled:opacity-50"
                                    title="Recalculate from live attendance, late arrivals, half-days, and holidays"
                                >
                                    <Icon name="RefreshCw" size={15} className={isRecalculating ? "animate-spin" : ""} />
                                    {isRecalculating ? "Recalculating..." : "Recalculate"}
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Edit Details */}
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-card hover:bg-muted/80 text-foreground text-xs font-semibold rounded-xl border border-border shadow-xs transition-all"
                                >
                                    <Icon name="Pencil" size={15} />
                                    Edit
                                </button>

                                {/* Delete Payroll */}
                                <button
                                    onClick={handleDeletePayroll}
                                    disabled={isDeleting}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-xl border border-rose-200 transition-all disabled:opacity-50"
                                    title="Delete this payroll record"
                                >
                                    <Icon name="Trash2" size={15} />
                                    Delete
                                </button>
                            </div>
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
                                    <div>
                                        <span>Leave Deduction</span>
                                        {payroll.unpaidLeaves > 0 && (
                                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                                                ({payroll.unpaidLeaves} unpaid day{payroll.unpaidLeaves > 1 ? 's' : ''} × {formatCurrency(perDayRate)}/day)
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-rose-600 font-bold">-{formatCurrency(payroll.leaveDeduction || 0)}</span>
                                </div>
                                <div className="flex justify-between font-medium text-muted-foreground">
                                    <div>
                                        <span>Half-Day & Late Deductions</span>
                                        {payroll.lateDeductionCount > 0 && (
                                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                                                ({payroll.lateDeductionCount} late arrival{payroll.lateDeductionCount > 1 ? 's' : ''} penalized as half-day)
                                            </p>
                                        )}
                                    </div>
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
                                    <span>Company Holidays (Paid)</span>
                                    <span className="text-indigo-600 font-bold">{payroll.holidaysCount || 0} days</span>
                                </div>
                                <div className="flex justify-between font-medium text-muted-foreground">
                                    <span>Half Days</span>
                                    <span className="text-amber-600 font-bold">{payroll.halfDaysCount || 0} days</span>
                                </div>
                                <div className="flex justify-between font-medium text-muted-foreground">
                                    <span>Late Arrivals</span>
                                    <span className="text-amber-600 font-bold">
                                        {payroll.lateCount || 0} days
                                        {payroll.lateCount > 0 && (
                                            <span className="text-[11px] font-normal text-muted-foreground ml-1.5">
                                                ({payroll.lateDeductionCount || 0} deducted, {(payroll.lateCount || 0) - (payroll.lateDeductionCount || 0)} waived)
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between font-medium text-muted-foreground">
                                    <span>Paid Leaves Used (CL)</span>
                                    <span className="text-emerald-600 font-bold">{payroll.paidLeaves || 0} days</span>
                                </div>
                                <div className="flex justify-between font-medium text-muted-foreground">
                                    <span>Unpaid Leaves (Deducted)</span>
                                    <span className="text-rose-600 font-bold">{payroll.unpaidLeaves || 0} days</span>
                                </div>
                                <div className="flex justify-between font-medium text-muted-foreground pt-1.5 border-t border-border/20">
                                    <span>Daily Salary Rate</span>
                                    <span className="text-foreground font-bold">{formatCurrency(perDayRate)}/day</span>
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

            {/* Review & Send Email Modal */}
            {isReviewModalOpen && (
                <PayrollReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    payroll={payroll}
                    mode="send"
                    onSend={async () => {
                        toast.success('Payslip email dispatched successfully!');
                        setPayroll(prev => ({ ...prev, status: 'sent' }));
                        setCyclePayrolls(prev => prev.map(p => p.id === payroll.id ? { ...p, status: 'sent' } : p));
                        setIsReviewModalOpen(false);
                    }}
                />
            )}

            {/* Edit Payroll Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-border/50 pb-3">
                            <div>
                                <h3 className="text-base font-bold text-foreground">Edit Payroll Details</h3>
                                <p className="text-xs text-muted-foreground">{fullName} · {payroll.month}/{payroll.year} Cycle</p>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-1 hover:bg-muted/70 rounded-lg text-muted-foreground hover:text-foreground"
                            >
                                <Icon name="X" size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Basic Salary (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editFormData.basicSalary}
                                        onChange={(e) => setEditFormData({ ...editFormData, basicSalary: e.target.value })}
                                        className="w-full text-xs font-semibold bg-background border border-border rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary/20"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Allowances (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editFormData.allowances}
                                        onChange={(e) => setEditFormData({ ...editFormData, allowances: e.target.value })}
                                        className="w-full text-xs font-semibold bg-background border border-border rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Deductions (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editFormData.deductions}
                                        onChange={(e) => setEditFormData({ ...editFormData, deductions: e.target.value })}
                                        className="w-full text-xs font-semibold bg-background border border-border rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Overtime Pay (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editFormData.overtime}
                                        onChange={(e) => setEditFormData({ ...editFormData, overtime: e.target.value })}
                                        className="w-full text-xs font-semibold bg-background border border-border rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Payroll Status</label>
                                    <select
                                        value={editFormData.status}
                                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                        className="w-full text-xs font-semibold bg-background border border-border rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="sent">Sent</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Calculated Net Salary</label>
                                    <div className="text-xs font-bold text-foreground bg-muted/50 border border-border/50 rounded-xl px-3 py-2">
                                        {formatCurrency(
                                            Math.max(
                                                0,
                                                (parseFloat(editFormData.basicSalary) || 0) +
                                                (parseFloat(editFormData.allowances) || 0) +
                                                (parseFloat(editFormData.overtime) || 0) -
                                                (parseFloat(editFormData.deductions) || 0)
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-muted-foreground block mb-1">Manager Remarks / Notes</label>
                                <textarea
                                    value={editFormData.notes}
                                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                                    rows={2}
                                    className="w-full text-xs bg-background border border-border rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary/20"
                                    placeholder="Add any manual deduction reasons or remarks..."
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted/60 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 shadow-xs"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayrollDetailsPage;
