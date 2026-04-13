import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    PieChart,
    Plus,
    Calendar,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    CreditCard,
    Wallet,
    Receipt,
    Download,
    Edit2
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
    Cell
} from 'recharts';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import useAuthStore from '../../../store/useAuthStore';
import financeService from '../../../services/finance.service';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import ExpenseModal from '../components/ExpenseModal';
import ExpenseViewModal from '../components/ExpenseViewModal';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const FinanceDashboardPage = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [summary, setSummary] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [viewingExpense, setViewingExpense] = useState(null);
    const { user } = useAuthStore();
    const [selectedCurrency, setSelectedCurrency] = useState('INR');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [trendData, setTrendData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);

    useEffect(() => {
        if (user?.company?.id) {
            fetchFinanceData();
        }
    }, [user, selectedCurrency]);

    const fetchFinanceData = async () => {
        setIsLoading(true);
        try {
            const [summaryRes, expensesRes, payrollsRes] = await Promise.all([
                financeService.getSummary(user.company.id),
                financeService.getExpenses(user.company.id),
                financeService.getPayroll(user.company.id)
            ]);

            const summaryData = summaryRes?.data || summaryRes || {};
            const expensesData = expensesRes?.data || expensesRes || [];
            const payrollsData = Array.isArray(payrollsRes) ? payrollsRes : (payrollsRes?.data || payrollsRes || []);

            // Calculate credits and debits from expenses list
            const totalCredit = (expensesData || []).reduce((acc, e) => acc + (e.type === 'credit' ? Number(e.amount || 0) : 0), 0);
            const totalDebit = (expensesData || []).reduce((acc, e) => acc + (e.type === 'credit' ? 0 : Number(e.amount || 0)), 0);

            // Payroll total from payrolls endpoint (each payroll item may have `netSalary` or `amount`)
            const totalPayroll = (payrollsData || []).reduce((acc, p) => acc + Number(p.netSalary || p.amount || p.total || 0), 0);

            // Determine turnover: prefer server value, else use credits sum
            const turnover = summaryData.turnover || totalCredit;

            // Total expenses (excluding payroll) are debits
            const totalExpensesCalculated = totalDebit;

            // Merge computed fields with server summary (server wins when present)
            const mergedSummary = {
                ...summaryData,
                turnover,
                totalCredit,
                totalDebit,
                totalExpenses: summaryData.totalExpenses || totalExpensesCalculated,
                totalPayroll: summaryData.totalPayroll || totalPayroll,
            };

            setSummary(mergedSummary);
            setExpenses(Array.isArray(expensesData) ? expensesData : []);

            // Compute Chart Data dynamically
            const categoryMap = {};
            const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#ec4899'];
            let colorIdx = 0;

            (expensesData || []).forEach(exp => {
                if (exp.type !== 'credit') {
                    const cat = exp.category || 'Misc';
                    if (!categoryMap[cat]) {
                        categoryMap[cat] = { name: cat, value: 0, color: colors[colorIdx % colors.length] };
                        colorIdx++;
                    }
                    categoryMap[cat].value += Number(exp.amount || 0);
                }
            });
            setCategoryData(Object.values(categoryMap).sort((a, b) => b.value - a.value));

            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const trendMap = {};
            const today = new Date();
            for (let i = 5; i >= 0; i--) {
                const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const monthStr = months[d.getMonth()];
                trendMap[`${d.getFullYear()}-${d.getMonth()}`] = {
                    month: monthStr,
                    revenue: 0,
                    expenses: 0,
                    year: d.getFullYear(),
                    monthNum: d.getMonth()
                };
            }

            (expensesData || []).forEach(exp => {
                const d = exp.date ? new Date(exp.date) : new Date();
                const key = `${d.getFullYear()}-${d.getMonth()}`;
                if (trendMap[key]) {
                    if (exp.type === 'credit') {
                        trendMap[key].revenue += Number(exp.amount || 0);
                    } else {
                        trendMap[key].expenses += Number(exp.amount || 0);
                    }
                }
            });

            payrollsData.forEach(p => {
                const pMonth = p.month ? p.month - 1 : new Date(p.createdAt || new Date()).getMonth();
                const pYear = p.year || new Date(p.createdAt || new Date()).getFullYear();
                const key = `${pYear}-${pMonth}`;
                if (trendMap[key]) {
                    trendMap[key].expenses += Number(p.netSalary || p.amount || p.total || 0);
                }
            });

            setTrendData(Object.values(trendMap).sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return a.monthNum - b.monthNum;
            }).map(t => ({ month: t.month, revenue: t.revenue, expenses: t.expenses })));
        } catch (error) {
            console.error('Failed to fetch finance data:', error);
            toast.error('Failed to load financial data');
        } finally {
            setIsLoading(false);
        }
    };

    const breadcrumbItems = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Finance', path: '/finance' },
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: selectedCurrency,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch =
            (expense.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (expense.category?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (expense.employee?.user?.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesCategory = filterCategory === 'All' || expense.category === filterCategory;

        const expenseDate = new Date(expense.date);
        const matchesDate =
            (!startDate || expenseDate >= new Date(startDate)) &&
            (!endDate || expenseDate <= new Date(endDate));

        return matchesSearch && matchesCategory && matchesDate;
    });

    const resetFilters = () => {
        setSearchTerm('');
        setFilterCategory('All');
        setStartDate('');
        setEndDate('');
    };

    const handleEditExpense = (expense) => {
        setEditingExpense(expense);
        setIsExpenseModalOpen(true);
    };

    const handleViewExpense = (expense) => {
        setViewingExpense(expense);
    };

    const handleCloseModal = () => {
        setIsExpenseModalOpen(false);
        setEditingExpense(null);
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-12 flex flex-col min-h-screen`}>
                <div className="p-6 max-w-7xl mx-auto w-full">
                    <BreadcrumbNavigation items={breadcrumbItems} />

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Financial Overview
                            </h1>
                            <p className="text-muted-foreground mt-1">Track your company's financial health and expenses.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <select
                                value={selectedCurrency}
                                onChange={(e) => setSelectedCurrency(e.target.value)}
                                className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                            >
                                <option value="INR">INR (₹)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                            <Button className="shadow-lg shadow-primary/20" iconName="Plus" onClick={() => {
                                setEditingExpense(null);
                                setIsExpenseModalOpen(true);
                            }}>
                                Add Expense
                            </Button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Overall Balance / Revenue */}
                        <div className="relative group overflow-hidden bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                    <TrendingUp size={24} />
                                </div>
                                <span className="flex items-center text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                                    <ArrowUpRight size={14} className="mr-0.5" /> +12.5%
                                </span>
                            </div>
                            <h3 className="text-sm font-medium text-muted-foreground">Est. Turnover</h3>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(summary?.turnover || 0)}</p>
                        </div>

                        {/* Total Expenses */}
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500">
                                    <TrendingDown size={24} />
                                </div>
                                <span className="flex items-center text-xs font-semibold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                                    <ArrowUpRight size={14} className="mr-0.5" /> +5.2%
                                </span>
                            </div>
                            <h3 className="text-sm font-medium text-muted-foreground">Total Expenses</h3>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(summary?.totalExpenses || 0)}</p>
                        </div>

                        {/* Payroll Total */}
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500">
                                    <Wallet size={24} />
                                </div>
                                <span className="flex items-center text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                    Current Month
                                </span>
                            </div>
                            <h3 className="text-sm font-medium text-muted-foreground">Total Payroll</h3>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(summary?.totalPayroll || 0)}</p>
                        </div>

                        {/* Net Margin/Profit */}
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-green-500/10 rounded-xl text-green-500">
                                    <DollarSign size={24} />
                                </div>
                                <span className="flex items-center text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                                    Healthy
                                </span>
                            </div>
                            <h3 className="text-sm font-medium text-muted-foreground">Net Profit</h3>
                            <p className="text-2xl font-bold mt-1 text-green-500">
                                {formatCurrency((summary?.turnover || 0) - (summary?.totalExpenses || 0) - (summary?.totalPayroll || 0))}
                            </p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Revenue vs Expenses Chart */}
                        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold">Revenue vs Expenses</h3>
                                    <p className="text-xs text-muted-foreground">Monthly performance comparison</p>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-medium">
                                    <div className="flex items-center gap-1.5 text-primary">
                                        <div className="w-3 h-3 rounded-full bg-primary" /> Revenue
                                    </div>
                                    <div className="flex items-center gap-1.5 text-orange-500">
                                        <div className="w-3 h-3 rounded-full bg-orange-500" /> Expenses
                                    </div>
                                </div>
                            </div>
                            <div className="h-[300px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis
                                            dataKey="month"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#888', fontSize: 12 }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#888', fontSize: 12 }}
                                            tickFormatter={(val) => `₹${val / 1000}k`}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                                            itemStyle={{ fontSize: '13px' }}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                        <Area type="monotone" dataKey="expenses" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Expense Distribution */}
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-6">Expense Categories</h3>
                            <div className="h-[240px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={categoryData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                                        />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3 mt-4">
                                {categoryData.map((item, id) => (
                                    <div key={id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-sm text-foreground/80">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-semibold">{formatCurrency(item.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Transactions Table */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
                        <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold">Recent Transactions</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">Lateast expenses and incoming credits</p>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="relative">
                                        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search records..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-primary/50"
                                        />
                                    </div>
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
                                    >
                                        <option value="All">All Categories</option>
                                        <option value="Operating">Operating</option>
                                        <option value="Salaries">Salaries</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Infrastructure">Infrastructure</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Tax">Tax</option>
                                        <option value="Misc">Misc</option>
                                    </select>

                                    <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border border-border">
                                        <Calendar size={14} className="text-muted-foreground" />
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="bg-transparent text-xs focus:outline-none"
                                        />
                                        <span className="text-muted-foreground text-xs">to</span>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="bg-transparent text-xs focus:outline-none"
                                        />
                                    </div>

                                    {(searchTerm || filterCategory !== 'All' || startDate || endDate) && (
                                        <button
                                            onClick={resetFilters}
                                            className="text-xs font-semibold text-primary hover:underline"
                                        >
                                            Reset Filters
                                        </button>
                                    )}

                                    <div className="flex-1" />

                                    <button className="p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                                        <Download size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/30 border-b border-border">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Transaction</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Amount</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                                                    Loading transactions...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredExpenses.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center opacity-40">
                                                    <Receipt size={48} className="mb-4" />
                                                    <p className="text-foreground font-medium">No matches found</p>
                                                    <p className="text-sm">Try adjusting your search or filters.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredExpenses.map((expense, idx) => (
                                            <tr key={expense.id || idx} className="hover:bg-muted/30 transition-all duration-200">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${expense.type === 'credit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                            {expense.type === 'credit' ? <ArrowDownRight size={18} /> : <CreditCard size={18} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold">{expense.title}</p>
                                                            <p className="text-[10px] text-muted-foreground uppercase">{expense.employee?.user?.firstName || 'Company'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-medium bg-muted px-2 py-1 rounded-md text-foreground/70">
                                                        {expense.category || 'Maintenance'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-muted-foreground">
                                                    {format(new Date(expense.date), 'MMM dd, yyyy')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${expense.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                                        }`}>
                                                        {expense.status || 'Verified'}
                                                    </span>
                                                </td>
                                                <td className={`px-6 py-4 text-sm font-bold text-right ${expense.type === 'credit' ? 'text-green-500' : 'text-foreground'}`}>
                                                    {expense.type === 'credit' ? '+' : '-'}{formatCurrency(expense.amount)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleViewExpense(expense)}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-500/10 rounded-lg transition-colors border border-blue-500/30 hover:border-blue-500/50"
                                                            title="View details"
                                                        >
                                                            👁️ View
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditExpense(expense)}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/30 hover:border-primary/50"
                                                            title="Edit details"
                                                        >
                                                            <Edit2 size={14} />
                                                            Edit
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <ExpenseModal
                    isOpen={isExpenseModalOpen}
                    onClose={handleCloseModal}
                    onSuccess={fetchFinanceData}
                    expenseToEdit={editingExpense}
                />
                <ExpenseViewModal
                    isOpen={!!viewingExpense}
                    onClose={() => setViewingExpense(null)}
                    expense={viewingExpense}
                />
            </main>
        </div>
    );
};

export default FinanceDashboardPage;
