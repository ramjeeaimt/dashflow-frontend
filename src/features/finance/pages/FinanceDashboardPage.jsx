import React, { useState, useEffect, useMemo } from 'react';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Plus,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    CreditCard,
    Wallet,
    Receipt,
    Download,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Activity,
    BarChart2,
    Filter,
    X
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart as RePieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Icon from '../../../components/AppIcon';
import useAuthStore from '../../../store/useAuthStore';
import financeService from '../../../services/finance.service';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import ExpenseModal from '../components/ExpenseModal';
import ExpenseViewModal from '../components/ExpenseViewModal';
import PayrollEditModal from '../components/PayrollEditModal';
import { format, isValid, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';

const PIE_COLORS = ['#2563eb', '#dc2626', '#d97706', '#059669', '#7c3aed', '#db2777', '#0891b2'];

const safeParse = (dateStr) => {
    if (!dateStr) return new Date();
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    return isValid(d) ? d : new Date();
};

const FinanceDashboardPage = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [summary, setSummary] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [payrolls, setPayrolls] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [viewingExpense, setViewingExpense] = useState(null);
    const [editingPayroll, setEditingPayroll] = useState(null);
    const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
    const { user } = useAuthStore();

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterType, setFilterType] = useState('All'); // All | credit | debit | payroll
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;

    // Chart data
    const [trendData, setTrendData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);

    // Active section tab
    const [activeTab, setActiveTab] = useState('overview'); // overview | history

    useEffect(() => {
        if (user?.company?.id) fetchFinanceData();
    }, [user]);

    const fetchFinanceData = async () => {
        setIsLoading(true);
        try {
            const [summaryRes, expensesRes, payrollsRes] = await Promise.all([
                financeService.getSummary(user.company.id),
                financeService.getExpenses(user.company.id),
                financeService.getPayroll(user.company.id)
            ]);

            const summaryData = summaryRes?.data || summaryRes || {};
            const expensesData = Array.isArray(expensesRes?.data || expensesRes)
                ? (expensesRes?.data || expensesRes) : [];
            const payrollsData = Array.isArray(payrollsRes) ? payrollsRes : (payrollsRes?.data || []);

            const totalCredit = expensesData.reduce((acc, e) => acc + (e.type === 'credit' ? Number(e.amount || 0) : 0), 0);
            const totalDebit = expensesData.reduce((acc, e) => acc + (e.type !== 'credit' ? Number(e.amount || 0) : 0), 0);
            const totalPayroll = payrollsData.reduce((acc, p) => acc + Number(p.netSalary || p.amount || p.total || 0), 0);
            const turnover = summaryData.turnover || totalCredit;

            setSummary({
                ...summaryData,
                turnover,
                totalCredit,
                totalDebit,
                totalExpenses: summaryData.totalExpenses || totalDebit,
                totalPayroll: summaryData.totalPayroll || totalPayroll,
            });

            setExpenses(expensesData);
            setPayrolls(payrollsData);

            // Category pie data
            const categoryMap = {};
            expensesData.forEach(exp => {
                if (exp.type !== 'credit') {
                    const cat = exp.category || 'Misc';
                    categoryMap[cat] = (categoryMap[cat] || 0) + Number(exp.amount || 0);
                }
            });
            // Add payroll as a category
            if (totalPayroll > 0) categoryMap['Payroll'] = (categoryMap['Payroll'] || 0) + totalPayroll;

            setCategoryData(
                Object.entries(categoryMap)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, value], i) => ({ name, value, color: PIE_COLORS[i % PIE_COLORS.length] }))
            );

            // Monthly trend (last 6 months)
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const trendMap = {};
            const today = new Date();
            for (let i = 5; i >= 0; i--) {
                const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                trendMap[`${d.getFullYear()}-${d.getMonth()}`] = {
                    month: months[d.getMonth()],
                    revenue: 0,
                    expenses: 0,
                    payroll: 0,
                    year: d.getFullYear(),
                    monthNum: d.getMonth()
                };
            }

            expensesData.forEach(exp => {
                const d = safeParse(exp.date);
                const key = `${d.getFullYear()}-${d.getMonth()}`;
                if (trendMap[key]) {
                    if (exp.type === 'credit') trendMap[key].revenue += Number(exp.amount || 0);
                    else trendMap[key].expenses += Number(exp.amount || 0);
                }
            });

            payrollsData.forEach(p => {
                const pMonth = p.month ? p.month - 1 : safeParse(p.createdAt).getMonth();
                const pYear = p.year || safeParse(p.createdAt).getFullYear();
                const key = `${pYear}-${pMonth}`;
                if (trendMap[key]) trendMap[key].payroll += Number(p.netSalary || p.amount || p.total || 0);
            });

            setTrendData(Object.values(trendMap).sort((a, b) => a.year !== b.year ? a.year - b.year : a.monthNum - b.monthNum));
        } catch (error) {
            console.error('Failed to fetch finance data:', error);
            toast.error('Failed to load financial data');
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

    // Build unified transaction list: expenses + payroll rows
    const allTransactions = useMemo(() => {
        const expenseRows = expenses.map(e => ({
            id: e.id,
            _type: 'expense',
            rawType: e.type, // credit | debit
            title: e.title || '—',
            category: e.category || 'Misc',
            date: safeParse(e.date),
            dateStr: e.date,
            amount: Number(e.amount || 0),
            status: e.status || 'approved',
            employee: e.employee,
            description: e.description,
            currency: e.currency || 'INR',
            createdAt: e.createdAt,
            updatedAt: e.updatedAt,
            _raw: e
        }));

        const payrollRows = payrolls.map(p => ({
            id: `payroll-${p.id}`,
            _type: 'payroll',
            rawType: 'debit',
            title: `Payroll — ${p.employee?.user?.firstName || ''} ${p.employee?.user?.lastName || ''}`.trim() || 'Payroll Disbursement',
            category: 'Payroll',
            date: p.month && p.year ? new Date(p.year, p.month - 1, 1) : safeParse(p.createdAt),
            dateStr: p.createdAt,
            amount: Number(p.netSalary || p.amount || p.total || 0),
            status: p.status || 'approved',
            employee: p.employee,
            description: `Month: ${p.month || '?'}/${p.year || '?'} | Gross: ${formatCurrency(p.grossSalary || p.amount)} | Net: ${formatCurrency(p.netSalary || p.amount)}`,
            currency: 'INR',
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            _raw: p
        }));

        return [...expenseRows, ...payrollRows].sort((a, b) => b.date - a.date);
    }, [expenses, payrolls]);

    // Known categories from data
    const knownCategories = useMemo(() => {
        const cats = new Set(['All']);
        allTransactions.forEach(t => cats.add(t.category));
        return Array.from(cats);
    }, [allTransactions]);

    // Filter
    const filteredTransactions = useMemo(() => {
        return allTransactions.filter(t => {
            const matchSearch =
                t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.employee?.user?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchCategory = filterCategory === 'All' || t.category === filterCategory;

            const matchType =
                filterType === 'All' ||
                (filterType === 'credit' && t.rawType === 'credit') ||
                (filterType === 'debit' && t.rawType === 'debit' && t._type === 'expense') ||
                (filterType === 'payroll' && t._type === 'payroll');

            const tDate = t.date;
            const matchStart = !startDate || tDate >= new Date(startDate);
            const matchEnd = !endDate || tDate <= new Date(endDate + 'T23:59:59');

            return matchSearch && matchCategory && matchType && matchStart && matchEnd;
        });
    }, [allTransactions, searchTerm, filterCategory, filterType, startDate, endDate]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
    const pagedTransactions = filteredTransactions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const resetFilters = () => {
        setSearchTerm('');
        setFilterCategory('All');
        setFilterType('All');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };

    const hasActiveFilters = searchTerm || filterCategory !== 'All' || filterType !== 'All' || startDate || endDate;

    const handleEditExpense = (t) => {
        if (t._type !== 'expense') return;
        setEditingExpense(t._raw);
        setIsExpenseModalOpen(true);
    };

    const handleViewExpense = (t) => {
        setViewingExpense(t._raw || t);
    };

    const handleDeleteExpense = async (t) => {
        if (t._type !== 'expense') return;
        if (!window.confirm(`Delete "${t.title}"? This cannot be undone.`)) return;
        try {
            await financeService.deleteExpense(t.id);
            toast.success('Transaction deleted');
            fetchFinanceData();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to delete');
        }
    };

    const handleEditPayroll = (t) => {
        if (t._type !== 'payroll') return;
        setEditingPayroll(t);
        setIsPayrollModalOpen(true);
    };

    const handleDeletePayroll = async (t) => {
        const payrollId = t.id.replace('payroll-', '');
        if (!window.confirm(`Delete payroll for ${t.employee?.user?.firstName || 'this employee'}?`)) return;
        try {
            await financeService.deletePayroll(payrollId);
            toast.success('Payroll record deleted');
            fetchFinanceData();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to delete payroll');
        }
    };

    const handleSavePayroll = async (id, data) => {
        try {
            await financeService.updatePayroll(id, data);
            toast.success('Payroll updated successfully');
            fetchFinanceData();
        } catch (err) {
            toast.error('Failed to update payroll');
            throw err;
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
        { label: 'Finance', path: '/finance' },
    ];

    const netProfit = (summary?.turnover || 0) - (summary?.totalExpenses || 0) - (summary?.totalPayroll || 0);

    // Custom tooltip for area chart
    const AreaTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-white border border-slate-100 shadow-xl rounded-xl p-4 text-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
                {payload.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between gap-8 mt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: entry.color }}>{entry.name}</span>
                        <span className="font-bold text-slate-900">{formatCurrency(entry.value)}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Header onToggleSidebar={toggleMobileSidebar} />
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={handleToggleSidebar}
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
            />

            <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-12 flex flex-col min-h-screen`}>
                <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto w-full space-y-8">
                    <BreadcrumbNavigation items={breadcrumbItems} />

                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Finance</h1>
                            <p className="text-slate-500 text-sm mt-1">Monitoring and managing your company's financial activities</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchFinanceData}
                                className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-all"
                            >
                                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                            <button
                                onClick={() => { setEditingExpense(null); setIsExpenseModalOpen(true); }}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
                            >
                                <Plus size={18} strokeWidth={3} />
                                New Entry
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {/* Turnover / Income */}
                        <div className="bg-white p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                            <div>
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Total Income</p>
                                <h3 className="text-2xl font-bold text-slate-800 tracking-tight leading-none mb-1.5">
                                    {isLoading ? <span className="h-7 w-28 bg-slate-100 rounded animate-pulse block" /> : formatCurrency(summary?.turnover)}
                                </h3>
                                <div className="flex items-center text-[10px] font-bold text-emerald-600 uppercase tracking-tight">
                                    <ArrowUpRight size={12} className="mr-1" /> Credits Received
                                </div>
                            </div>
                            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <TrendingUp size={22} />
                            </div>
                        </div>

                        {/* Expenses */}
                        <div className="bg-white p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                            <div>
                                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">Total Expenses</p>
                                <h3 className="text-2xl font-bold text-slate-800 tracking-tight leading-none mb-1.5">
                                    {isLoading ? <span className="h-7 w-28 bg-slate-100 rounded animate-pulse block" /> : formatCurrency(summary?.totalExpenses)}
                                </h3>
                                <div className="flex items-center text-[10px] font-bold text-rose-500 uppercase tracking-tight">
                                    <TrendingDown size={12} className="mr-1" /> Operational Spend
                                </div>
                            </div>
                            <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                                <Receipt size={22} />
                            </div>
                        </div>

                        {/* Payroll */}
                        <div className="bg-white p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                            <div>
                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Total Payroll</p>
                                <h3 className="text-2xl font-bold text-slate-800 tracking-tight leading-none mb-1.5">
                                    {isLoading ? <span className="h-7 w-28 bg-slate-100 rounded animate-pulse block" /> : formatCurrency(summary?.totalPayroll)}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{payrolls.length} disbursements</p>
                            </div>
                            <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                                <Wallet size={22} />
                            </div>
                        </div>

                        {/* Net Profit */}
                        <div className={`p-5 shadow-lg flex items-center justify-between group ${netProfit >= 0 ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-rose-600 shadow-rose-600/20'}`}>
                            <div>
                                <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-1">Net Profit</p>
                                <h3 className="text-2xl font-bold text-white tracking-tight leading-none mb-1.5">
                                    {isLoading ? <span className="h-7 w-28 bg-white/20 rounded animate-pulse block" /> : formatCurrency(netProfit)}
                                </h3>
                                <div className="flex items-center text-[10px] font-bold text-white/80 uppercase tracking-tight">
                                    <span className="w-2 h-2 bg-white/60 mr-2 rounded-full animate-pulse" />
                                    {netProfit >= 0 ? 'Healthy' : 'Deficit'}
                                </div>
                            </div>
                            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                <DollarSign size={22} />
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-xl p-1 w-fit shadow-sm">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            <BarChart2 size={16} /> Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            <Activity size={16} /> Full Activity Log
                            <span className="ml-1 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {allTransactions.length}
                            </span>
                        </button>
                    </div>

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Revenue vs Expenses Area Chart */}
                                <div className="lg:col-span-2 bg-white p-6 border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Monthly Cash Flow</h3>
                                            <p className="text-slate-500 text-xs mt-0.5">Income vs Expenses vs Payroll — Last 6 months</p>
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider flex-wrap justify-end">
                                            <div className="flex items-center gap-1.5 text-blue-600"><div className="w-3 h-1 bg-blue-600 rounded" /> Income</div>
                                            <div className="flex items-center gap-1.5 text-rose-500"><div className="w-3 h-1 bg-rose-400 rounded" /> Expenses</div>
                                            <div className="flex items-center gap-1.5 text-amber-500"><div className="w-3 h-1 bg-amber-400 rounded" /> Payroll</div>
                                        </div>
                                    </div>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colRev" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colExp" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.12} />
                                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colPay" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.12} />
                                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} dy={8} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}`} />
                                                <Tooltip content={<AreaTooltip />} />
                                                <Area type="monotone" dataKey="revenue" name="Income" stroke="#2563eb" strokeWidth={2.5} fill="url(#colRev)" activeDot={{ r: 5, strokeWidth: 3, stroke: '#fff', fill: '#2563eb' }} />
                                                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" strokeWidth={2} fill="url(#colExp)" activeDot={{ r: 5, strokeWidth: 3, stroke: '#fff', fill: '#f43f5e' }} />
                                                <Area type="monotone" dataKey="payroll" name="Payroll" stroke="#f59e0b" strokeWidth={2} fill="url(#colPay)" activeDot={{ r: 5, strokeWidth: 3, stroke: '#fff', fill: '#f59e0b' }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Category Breakdown */}
                                <div className="bg-white p-6 border border-slate-100 shadow-sm flex flex-col">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-slate-900">Expense Breakdown</h3>
                                        <p className="text-slate-500 text-xs mt-0.5">Spending by category</p>
                                    </div>
                                    {categoryData.length > 0 ? (
                                        <>
                                            <div className="h-[180px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RePieChart>
                                                        <Pie data={categoryData} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                                                            {categoryData.map((entry, i) => (
                                                                <Cell key={i} fill={entry.color} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            content={({ active, payload }) => {
                                                                if (!active || !payload?.length) return null;
                                                                const d = payload[0].payload;
                                                                return (
                                                                    <div className="bg-white p-3 shadow-xl border border-slate-100 rounded-xl text-xs">
                                                                        <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">{d.name}</p>
                                                                        <p className="font-bold text-slate-900 text-base">{formatCurrency(d.value)}</p>
                                                                    </div>
                                                                );
                                                            }}
                                                        />
                                                    </RePieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="mt-4 space-y-2 flex-1">
                                                {categoryData.slice(0, 6).map((item, i) => (
                                                    <div key={i} className="flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                                            <span className="font-semibold text-slate-700 truncate max-w-[100px]">{item.name}</span>
                                                        </div>
                                                        <span className="font-bold text-slate-900">{formatCurrency(item.value)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">No expense data</div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Transactions Preview (last 5) */}
                            <div className="bg-white border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
                                        <p className="text-slate-500 text-xs mt-0.5">Latest 5 financial activities</p>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('history')}
                                        className="text-blue-600 text-sm font-bold hover:underline"
                                    >
                                        View All →
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50/60 border-b border-slate-100">
                                                {['Transaction', 'Category', 'Date', 'Type', 'Amount', 'Actions'].map(h => (
                                                    <th key={h} className={`px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${h === 'Actions' ? 'text-center' : ''}`}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {isLoading ? (
                                                Array.from({ length: 5 }).map((_, i) => (
                                                    <tr key={i}>
                                                        {Array.from({ length: 5 }).map((_, j) => (
                                                            <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse w-24" /></td>
                                                        ))}
                                                    </tr>
                                                ))
                                            ) : allTransactions.slice(0, 5).map((t, idx) => (
                                                <TransactionRow
                                                    key={t.id || idx}
                                                    t={t}
                                                    formatCurrency={formatCurrency}
                                                    onView={() => handleViewExpense(t)}
                                                    onEdit={() => t._type === 'payroll' ? handleEditPayroll(t) : handleEditExpense(t)}
                                                    onDelete={() => t._type === 'payroll' ? handleDeletePayroll(t) : handleDeleteExpense(t)}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* HISTORY / FULL ACTIVITY TAB */}
                    {activeTab === 'history' && (
                        <div className="bg-white border border-slate-100 shadow-sm overflow-hidden">
                            {/* Filter Bar */}
                            <div className="p-6 border-b border-slate-100">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
                                        {/* Search */}
                                        <div className="relative col-span-2 lg:col-span-1">
                                            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search transactions..."
                                                value={searchTerm}
                                                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
                                            />
                                        </div>

                                        {/* Type filter */}
                                        <select
                                            value={filterType}
                                            onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }}
                                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        >
                                            <option value="All">All Types</option>
                                            <option value="credit">Credit (Income)</option>
                                            <option value="debit">Debit (Expense)</option>
                                            <option value="payroll">Payroll</option>
                                        </select>

                                        {/* Category filter */}
                                        <select
                                            value={filterCategory}
                                            onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        >
                                            {knownCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>

                                        {/* Date range */}
                                        <div className="flex items-center gap-2 col-span-2 lg:col-span-1">
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }}
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                            />
                                            <span className="text-slate-400 text-xs font-bold">to</span>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }}
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {hasActiveFilters && (
                                            <button
                                                onClick={resetFilters}
                                                className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-100 transition-all"
                                            >
                                                <X size={14} /> Clear
                                            </button>
                                        )}
                                        <button className="p-2.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 transition-all" title="Export CSV">
                                            <Download size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Filter summary */}
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-xs text-slate-500 font-medium">
                                        Showing <span className="font-bold text-slate-800">{filteredTransactions.length}</span> of <span className="font-bold text-slate-800">{allTransactions.length}</span> transactions
                                        {hasActiveFilters && <span className="ml-1 text-blue-600">(filtered)</span>}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                                        <span className="text-emerald-600">↑ Credit: {formatCurrency(filteredTransactions.filter(t => t.rawType === 'credit').reduce((s, t) => s + t.amount, 0))}</span>
                                        <span className="text-rose-600">↓ Debit: {formatCurrency(filteredTransactions.filter(t => t.rawType === 'debit').reduce((s, t) => s + t.amount, 0))}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/60 border-b border-slate-100">
                                            <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-8">#</th>
                                            <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Transaction</th>
                                            <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</th>
                                            <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</th>
                                            <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">Type</th>
                                            <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">Status</th>
                                            <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">Amount</th>
                                            <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {isLoading ? (
                                            Array.from({ length: 8 }).map((_, i) => (
                                                <tr key={i}>
                                                    {Array.from({ length: 8 }).map((_, j) => (
                                                        <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}px` }} /></td>
                                                    ))}
                                                </tr>
                                            ))
                                        ) : pagedTransactions.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-16 text-center">
                                                    <div className="flex flex-col items-center gap-3 text-slate-400">
                                                        <Activity size={36} strokeWidth={1} />
                                                        <p className="text-sm font-semibold">No transactions found</p>
                                                        {hasActiveFilters && (
                                                            <button onClick={resetFilters} className="text-blue-600 text-xs font-bold hover:underline">Clear filters</button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            pagedTransactions.map((t, idx) => {
                                                const rowNum = (currentPage - 1) * PAGE_SIZE + idx + 1;
                                                return (
                                                    <tr key={t.id || idx} className="hover:bg-slate-50/60 transition-colors">
                                                        <td className="px-6 py-4 text-[11px] font-bold text-slate-300">{rowNum}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-2 rounded-lg flex-shrink-0 ${t.rawType === 'credit' ? 'bg-emerald-50 text-emerald-600' : t._type === 'payroll' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                                                                    {t.rawType === 'credit' ? <ArrowDownRight size={16} /> : t._type === 'payroll' ? <Wallet size={16} /> : <CreditCard size={16} />}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-semibold text-slate-900 truncate max-w-[200px]">{t.title}</p>
                                                                    <p className="text-[10px] text-slate-400 font-medium">{t.employee?.user?.firstName ? `${t.employee.user.firstName} ${t.employee.user.lastName || ''}` : 'System'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-[10px] font-bold bg-slate-100 px-2.5 py-1 rounded-full text-slate-600 uppercase tracking-tight whitespace-nowrap">
                                                                {t.category}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-[11px] font-semibold text-slate-600 whitespace-nowrap">
                                                            {isValid(t.date) ? format(t.date, 'MMM dd, yyyy') : '—'}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${t.rawType === 'credit' ? 'bg-emerald-50 text-emerald-700' : t._type === 'payroll' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                                                                }`}>
                                                                {t.rawType === 'credit' ? 'Credit' : t._type === 'payroll' ? 'Payroll' : 'Debit'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${t.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                                }`}>
                                                                {t.status === 'approved' ? 'Done' : 'Pending'}
                                                            </span>
                                                        </td>
                                                        <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${t.rawType === 'credit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                                            {t.rawType === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <button
                                                                    onClick={() => handleViewExpense(t)}
                                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                    title="View details"
                                                                >
                                                                    <Icon name="Eye" size={15} />
                                                                </button>
                                                                {(t._type === 'expense' || t._type === 'payroll') && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => t._type === 'payroll' ? handleEditPayroll(t) : handleEditExpense(t)}
                                                                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                                                            title={t._type === 'payroll' ? "Edit payroll" : "Edit expense"}
                                                                        >
                                                                            <Edit2 size={15} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => t._type === 'payroll' ? handleDeletePayroll(t) : handleDeleteExpense(t)}
                                                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                                            title={t._type === 'payroll' ? "Delete payroll" : "Delete expense"}
                                                                        >
                                                                            <Trash2 size={15} />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {!isLoading && filteredTransactions.length > PAGE_SIZE && (
                                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                                    <p className="text-xs text-slate-500 font-medium">
                                        Page <span className="font-bold text-slate-700">{currentPage}</span> of <span className="font-bold text-slate-700">{totalPages}</span>
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronLeft size={16} /> Prev
                                        </button>
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            const page = currentPage <= 3 ? i + 1 : currentPage + i - 2;
                                            if (page < 1 || page > totalPages) return null;
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-8 h-8 text-sm font-bold rounded-lg transition-all ${currentPage === page ? 'bg-blue-600 text-white' : 'text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                        >
                                            Next <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <ExpenseModal
                    isOpen={isExpenseModalOpen}
                    onClose={() => { setIsExpenseModalOpen(false); setEditingExpense(null); }}
                    onSuccess={fetchFinanceData}
                    expenseToEdit={editingExpense}
                />
                <ExpenseViewModal
                    isOpen={!!viewingExpense}
                    onClose={() => setViewingExpense(null)}
                    expense={viewingExpense}
                />
                <PayrollEditModal
                    isOpen={isPayrollModalOpen}
                    onClose={() => { setIsPayrollModalOpen(false); setEditingPayroll(null); }}
                    payroll={editingPayroll}
                    onSave={handleSavePayroll}
                />
            </main>
        </div>
    );
};

// Reusable compact transaction row for the Overview "Recent" table
const TransactionRow = ({ t, formatCurrency, onView, onEdit, onDelete }) => (
    <tr className="hover:bg-slate-50/60 transition-colors">
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${t.rawType === 'credit' ? 'bg-emerald-50 text-emerald-600' : t._type === 'payroll' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                    {t.rawType === 'credit' ? <ArrowDownRight size={15} /> : t._type === 'payroll' ? <Wallet size={15} /> : <CreditCard size={15} />}
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-900 truncate max-w-[180px]">{t.title}</p>
                    <p className="text-[10px] text-slate-400">{t.employee?.user?.firstName || 'System'}</p>
                </div>
            </div>
        </td>
        <td className="px-6 py-4">
            <span className="text-[10px] font-bold bg-slate-100 px-2.5 py-1 rounded-full text-slate-600 uppercase">{t.category}</span>
        </td>
        <td className="px-6 py-4 text-[11px] font-semibold text-slate-600">
            {isValid(t.date) ? format(t.date, 'MMM dd, yyyy') : '—'}
        </td>
        <td className="px-6 py-4">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${t.rawType === 'credit' ? 'bg-emerald-50 text-emerald-700' : t._type === 'payroll' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                }`}>
                {t.rawType === 'credit' ? 'Credit' : t._type === 'payroll' ? 'Payroll' : 'Debit'}
            </span>
        </td>
        <td className={`px-6 py-4 text-sm font-bold ${t.rawType === 'credit' ? 'text-emerald-600' : 'text-slate-800'}`}>
            {t.rawType === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center justify-center gap-1">
                <button onClick={onView} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View">
                    <Icon name="Eye" size={14} />
                </button>
                {(t._type === 'expense' || t._type === 'payroll') && (
                    <>
                        <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all" title="Edit">
                            <Edit2 size={14} />
                        </button>
                        <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete">
                            <Trash2 size={14} />
                        </button>
                    </>
                )}
            </div>
        </td>
    </tr>
);

export default FinanceDashboardPage;
