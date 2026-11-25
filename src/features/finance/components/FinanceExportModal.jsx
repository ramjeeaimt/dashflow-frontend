import React, { useState, useMemo } from 'react';
import {
    X,
    Download,
    FileSpreadsheet,
    FileText,
    Calendar,
    Filter,
    CheckCircle2,
    Layers,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    DollarSign,
    Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
    filterTransactionsForExport,
    exportFinanceToExcel,
    exportFinanceToCsv
} from '../../../utils/financeExport';

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL_MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const FinanceExportModal = ({
    isOpen,
    onClose,
    allTransactions = [],
    filteredTransactions = [],
    availableYears = [],
    defaultYear = new Date().getFullYear(),
    defaultMonth = new Date().getMonth(),
    knownCategories = ['All'],
    companyName = 'Difmo'
}) => {
    // Mode: 'single_month' | 'multiple_months' | 'year' | 'all' | 'current'
    const [exportMode, setExportMode] = useState('single_month');

    // Single Month selection
    const [selectedYear, setSelectedYear] = useState(defaultYear);
    const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

    // Multiple Months: Range or Custom Pick
    const [multiSubMode, setMultiSubMode] = useState('range'); // 'range' | 'custom_pick'
    const [startYear, setStartYear] = useState(defaultYear);
    const [startMonth, setStartMonth] = useState(Math.max(0, defaultMonth - 2)); // default last 3 months
    const [endYear, setEndYear] = useState(defaultYear);
    const [endMonth, setEndMonth] = useState(defaultMonth);

    // Custom Picked Months: Set of "YYYY-M" keys
    const [customMonths, setCustomMonths] = useState(() => {
        const curY = new Date().getFullYear();
        const curM = new Date().getMonth();
        return new Set([`${curY}-${curM}`]);
    });

    // Inclusions
    const [includeIncome, setIncludeIncome] = useState(true);
    const [includeExpenses, setIncludeExpenses] = useState(true);
    const [includePayroll, setIncludePayroll] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Format: 'xlsx' | 'csv'
    const [exportFormat, setExportFormat] = useState('xlsx');
    const [isExporting, setIsExporting] = useState(false);

    // Apply quick presets
    const applyPreset = (preset) => {
        const today = new Date();
        const curY = today.getFullYear();
        const curM = today.getMonth();

        if (preset === 'this_month') {
            setExportMode('single_month');
            setSelectedYear(curY);
            setSelectedMonth(curM);
        } else if (preset === 'last_month') {
            setExportMode('single_month');
            const prev = new Date(curY, curM - 1, 1);
            setSelectedYear(prev.getFullYear());
            setSelectedMonth(prev.getMonth());
        } else if (preset === 'last_3_months') {
            setExportMode('multiple_months');
            setMultiSubMode('range');
            const dStart = new Date(curY, curM - 2, 1);
            setStartYear(dStart.getFullYear());
            setStartMonth(dStart.getMonth());
            setEndYear(curY);
            setEndMonth(curM);
        } else if (preset === 'last_6_months') {
            setExportMode('multiple_months');
            setMultiSubMode('range');
            const dStart = new Date(curY, curM - 5, 1);
            setStartYear(dStart.getFullYear());
            setStartMonth(dStart.getMonth());
            setEndYear(curY);
            setEndMonth(curM);
        } else if (preset === 'this_year') {
            setExportMode('year');
            setSelectedYear(curY);
        } else if (preset === 'all') {
            setExportMode('all');
        }
    };

    // Toggle a custom month in custom pick mode
    const toggleCustomMonth = (yr, m) => {
        const key = `${yr}-${m}`;
        setCustomMonths(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                if (next.size > 1) next.delete(key);
                else toast.error('At least one month must remain selected');
            } else {
                next.add(key);
            }
            return next;
        });
    };

    // Calculate matching transactions for export
    const matchingTransactions = useMemo(() => {
        if (!isOpen) return [];

        if (exportMode === 'current') {
            return filteredTransactions.filter(t => {
                if (t.rawType === 'credit' && !includeIncome) return false;
                if (t.rawType === 'debit' && t._type === 'expense' && !includeExpenses) return false;
                if (t._type === 'payroll' && !includePayroll) return false;
                if (selectedCategory && selectedCategory !== 'All' && t.category !== selectedCategory) return false;
                return true;
            });
        }

        return filterTransactionsForExport(allTransactions, {
            mode: exportMode,
            selectedYear,
            selectedMonth,
            startYear,
            startMonth,
            endYear,
            endMonth,
            selectedMonthsList: multiSubMode === 'custom_pick' ? Array.from(customMonths) : null,
            includeIncome,
            includeExpenses,
            includePayroll,
            selectedCategory
        });
    }, [
        isOpen,
        exportMode,
        allTransactions,
        filteredTransactions,
        selectedYear,
        selectedMonth,
        startYear,
        startMonth,
        endYear,
        endMonth,
        multiSubMode,
        customMonths,
        includeIncome,
        includeExpenses,
        includePayroll,
        selectedCategory
    ]);

    // Live preview metrics
    const previewMetrics = useMemo(() => {
        let income = 0;
        let expenses = 0;
        let payroll = 0;

        matchingTransactions.forEach(t => {
            const amt = Number(t.amount || 0);
            if (t.rawType === 'credit') income += amt;
            else if (t._type === 'payroll') payroll += amt;
            else expenses += amt;
        });

        const net = income - expenses - payroll;
        return { income, expenses, payroll, net, count: matchingTransactions.length };
    }, [matchingTransactions]);

    // Compute dynamic file name and period label
    const { dynamicFileName, dynamicPeriodLabel } = useMemo(() => {
        let label = 'All_Time';
        let periodDesc = 'All Historical Records';

        if (exportMode === 'single_month') {
            label = `${SHORT_MONTHS[selectedMonth]}_${selectedYear}`;
            periodDesc = `${FULL_MONTHS[selectedMonth]} ${selectedYear}`;
        } else if (exportMode === 'year') {
            label = `Full_Year_${selectedYear}`;
            periodDesc = `Full Year ${selectedYear}`;
        } else if (exportMode === 'multiple_months') {
            if (multiSubMode === 'range') {
                label = `${SHORT_MONTHS[startMonth]}${startYear}_to_${SHORT_MONTHS[endMonth]}${endYear}`;
                periodDesc = `${SHORT_MONTHS[startMonth]} ${startYear} – ${SHORT_MONTHS[endMonth]} ${endYear}`;
            } else {
                label = `Selected_${customMonths.size}_Months`;
                periodDesc = `${customMonths.size} Custom Selected Months`;
            }
        } else if (exportMode === 'current') {
            label = `Filtered_View`;
            periodDesc = `Current Screen Filtered View (${filteredTransactions.length} items)`;
        }

        const safeComp = (companyName || 'Finance').replace(/[^a-zA-Z0-9_-]/g, '_');
        const fileName = `${safeComp}_Financials_${label}`;

        return { dynamicFileName: fileName, dynamicPeriodLabel: periodDesc };
    }, [exportMode, multiSubMode, selectedYear, selectedMonth, startYear, startMonth, endYear, endMonth, customMonths, companyName, filteredTransactions.length]);

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

    const handleExecuteExport = () => {
        if (!matchingTransactions || matchingTransactions.length === 0) {
            toast.error('No matching financial records found to export with active settings.');
            return;
        }

        setIsExporting(true);
        try {
            if (exportFormat === 'xlsx') {
                const generated = exportFinanceToExcel(matchingTransactions, {
                    fileName: dynamicFileName,
                    periodLabel: dynamicPeriodLabel,
                    companyName: companyName || 'DashFlow Finance'
                });
                toast.success(`Exported Excel workbook: ${generated}`);
            } else {
                const generated = exportFinanceToCsv(matchingTransactions, {
                    fileName: dynamicFileName
                });
                toast.success(`Exported CSV ledger: ${generated}`);
            }
            onClose();
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to generate export file');
        } finally {
            setIsExporting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* Modal Dialog */}
            <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <FileSpreadsheet size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground tracking-tight">Export Financial Data</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Download month-wise, multi-month, or custom ledger reports in Excel or CSV.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/60 transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
                    {/* Quick Presets */}
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                            <Layers size={13} className="text-primary" /> Quick Range Presets
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            {[
                                { key: 'this_month', label: `This Month (${SHORT_MONTHS[new Date().getMonth()]})` },
                                { key: 'last_month', label: 'Last Month' },
                                { key: 'last_3_months', label: 'Last 3 Months (Quarter)' },
                                { key: 'last_6_months', label: 'Last 6 Months' },
                                { key: 'this_year', label: `Full Year ${new Date().getFullYear()}` },
                                { key: 'all', label: 'All Historical' }
                            ].map(p => (
                                <button
                                    key={p.key}
                                    type="button"
                                    onClick={() => applyPreset(p.key)}
                                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary border border-border/80 transition-all"
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Export Mode Tabs */}
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                            Export Scope Mode
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-muted/60 p-1 rounded-xl border border-border text-xs font-semibold">
                            {[
                                { id: 'single_month', label: 'Single Month' },
                                { id: 'multiple_months', label: 'Multiple Months' },
                                { id: 'year', label: 'Full Year' },
                                { id: 'all', label: 'All Time' },
                                { id: 'current', label: 'Current Screen' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setExportMode(tab.id)}
                                    className={`py-2 px-2 rounded-lg text-center transition-all ${exportMode === tab.id ? 'bg-card text-foreground font-bold shadow-xs border border-border/60' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mode-Specific Selectors */}
                    {exportMode === 'single_month' && (
                        <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
                            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <Calendar size={14} className="text-primary" /> Choose Specific Month to Export
                            </span>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] text-muted-foreground font-semibold block mb-1">Year</label>
                                    <select
                                        value={selectedYear}
                                        onChange={e => setSelectedYear(parseInt(e.target.value))}
                                        className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                                    >
                                        {availableYears.map(yr => (
                                            <option key={yr} value={yr}>{yr}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] text-muted-foreground font-semibold block mb-1">Month</label>
                                    <select
                                        value={selectedMonth}
                                        onChange={e => setSelectedMonth(parseInt(e.target.value))}
                                        className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                                    >
                                        {FULL_MONTHS.map((m, idx) => (
                                            <option key={idx} value={idx}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {exportMode === 'multiple_months' && (
                        <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                    <Calendar size={14} className="text-primary" /> Multi-Month Configuration
                                </span>
                                <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border text-[11px] font-semibold">
                                    <button
                                        type="button"
                                        onClick={() => setMultiSubMode('range')}
                                        className={`px-2.5 py-1 rounded-md transition-all ${multiSubMode === 'range' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground'}`}
                                    >
                                        From-To Range
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMultiSubMode('custom_pick')}
                                        className={`px-2.5 py-1 rounded-md transition-all ${multiSubMode === 'custom_pick' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground'}`}
                                    >
                                        Pick Specific Months
                                    </button>
                                </div>
                            </div>

                            {multiSubMode === 'range' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-primary uppercase">From (Start Month)</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <select
                                                value={startMonth}
                                                onChange={e => setStartMonth(parseInt(e.target.value))}
                                                className="bg-card border border-border rounded-lg px-2.5 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                                            >
                                                {FULL_MONTHS.map((m, idx) => (
                                                    <option key={idx} value={idx}>{m}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={startYear}
                                                onChange={e => setStartYear(parseInt(e.target.value))}
                                                className="bg-card border border-border rounded-lg px-2.5 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                                            >
                                                {availableYears.map(yr => (
                                                    <option key={yr} value={yr}>{yr}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-primary uppercase">To (End Month)</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <select
                                                value={endMonth}
                                                onChange={e => setEndMonth(parseInt(e.target.value))}
                                                className="bg-card border border-border rounded-lg px-2.5 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                                            >
                                                {FULL_MONTHS.map((m, idx) => (
                                                    <option key={idx} value={idx}>{m}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={endYear}
                                                onChange={e => setEndYear(parseInt(e.target.value))}
                                                className="bg-card border border-border rounded-lg px-2.5 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                                            >
                                                {availableYears.map(yr => (
                                                    <option key={yr} value={yr}>{yr}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Click to toggle months ({customMonths.size} selected):</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const allSet = new Set();
                                                availableYears.forEach(y => {
                                                    for (let m = 0; m < 12; m++) allSet.add(`${y}-${m}`);
                                                });
                                                setCustomMonths(allSet);
                                            }}
                                            className="text-primary font-bold hover:underline"
                                        >
                                            Select All Months
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                        {FULL_MONTHS.map((m, idx) => {
                                            const key = `${selectedYear}-${idx}`;
                                            const isSelected = customMonths.has(key);
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => toggleCustomMonth(selectedYear, idx)}
                                                    className={`py-2 px-1 text-xs rounded-lg font-bold border transition-all flex items-center justify-center gap-1 ${isSelected ? 'bg-primary text-white border-primary shadow-xs' : 'bg-card text-muted-foreground border-border hover:border-foreground/40'}`}
                                                >
                                                    {isSelected && <Check size={12} strokeWidth={3} />}
                                                    {SHORT_MONTHS[idx]} '{String(selectedYear).slice(-2)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {exportMode === 'year' && (
                        <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-2">
                            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <Calendar size={14} className="text-primary" /> Select Full Year to Export (All 12 Months)
                            </span>
                            <div className="w-full sm:w-1/2">
                                <select
                                    value={selectedYear}
                                    onChange={e => setSelectedYear(parseInt(e.target.value))}
                                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                                >
                                    {availableYears.map(yr => (
                                        <option key={yr} value={yr}>Full Year {yr} (January – December)</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Filter Inclusions & Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        {/* Transaction Types */}
                        <div className="space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                                Include Transaction Types
                            </span>
                            <div className="space-y-1.5 bg-muted/20 border border-border rounded-xl p-3">
                                <label className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={includeIncome}
                                        onChange={e => setIncludeIncome(e.target.checked)}
                                        className="w-4 h-4 rounded text-primary focus:ring-primary"
                                    />
                                    <span className="text-emerald-600 font-bold">↑ Income / Credits</span>
                                    <span className="text-muted-foreground text-[10px] ml-auto">Revenues, Inflows</span>
                                </label>
                                <label className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={includeExpenses}
                                        onChange={e => setIncludeExpenses(e.target.checked)}
                                        className="w-4 h-4 rounded text-primary focus:ring-primary"
                                    />
                                    <span className="text-rose-600 font-bold">↓ Operational Expenses</span>
                                    <span className="text-muted-foreground text-[10px] ml-auto">Debits, Costs</span>
                                </label>
                                <label className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={includePayroll}
                                        onChange={e => setIncludePayroll(e.target.checked)}
                                        className="w-4 h-4 rounded text-primary focus:ring-primary"
                                    />
                                    <span className="text-amber-600 font-bold">◆ Payroll Disbursements</span>
                                    <span className="text-muted-foreground text-[10px] ml-auto">Salaries</span>
                                </label>
                            </div>
                        </div>

                        {/* Category & Format */}
                        <div className="space-y-3">
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                                    Category Filter
                                </span>
                                <select
                                    value={selectedCategory}
                                    onChange={e => setSelectedCategory(e.target.value)}
                                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                                >
                                    {knownCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat === 'All' ? 'All Expense Categories' : cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                                    Export Format
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setExportFormat('xlsx')}
                                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${exportFormat === 'xlsx' ? 'bg-primary/10 border-primary text-primary shadow-xs' : 'bg-card border-border text-muted-foreground hover:text-foreground'}`}
                                    >
                                        <FileSpreadsheet size={15} /> Excel (.xlsx)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setExportFormat('csv')}
                                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${exportFormat === 'csv' ? 'bg-primary/10 border-primary text-primary shadow-xs' : 'bg-card border-border text-muted-foreground hover:text-foreground'}`}
                                    >
                                        <FileText size={15} /> CSV Ledger
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Live Preview Metric Summary Bar */}
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-primary/10">
                            <div>
                                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Report Target</span>
                                <p className="text-sm font-bold text-foreground">{dynamicPeriodLabel}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Matching Entries</span>
                                <p className="text-sm font-bold text-foreground">
                                    {previewMetrics.count} transactions
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div>
                                <span className="text-[10px] text-muted-foreground font-semibold block">Total Income</span>
                                <span className="font-bold text-emerald-600">{formatCurrency(previewMetrics.income)}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-muted-foreground font-semibold block">Operational Spend</span>
                                <span className="font-bold text-rose-600">{formatCurrency(previewMetrics.expenses)}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-muted-foreground font-semibold block">Payroll</span>
                                <span className="font-bold text-amber-600">{formatCurrency(previewMetrics.payroll)}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-muted-foreground font-semibold block">Net Cash Flow</span>
                                <span className={`font-bold ${previewMetrics.net >= 0 ? 'text-primary' : 'text-rose-600'}`}>
                                    {formatCurrency(previewMetrics.net)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-5 sm:p-6 border-t border-border bg-muted/20">
                    <div className="text-xs text-muted-foreground truncate max-w-sm">
                        File: <span className="font-mono text-foreground font-semibold">{dynamicFileName}.{exportFormat}</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-4 py-2.5 border border-border text-muted-foreground hover:text-foreground font-semibold rounded-xl text-sm transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleExecuteExport}
                            disabled={isExporting || previewMetrics.count === 0}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-sm shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={16} />
                            {isExporting ? 'Generating...' : `Download ${exportFormat.toUpperCase()} (${previewMetrics.count})`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceExportModal;
