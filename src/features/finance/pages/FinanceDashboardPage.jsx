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
import { FaRupeeSign } from 'react-icons/fa';

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

                    {/* Industrial Header Block */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-8 bg-blue-800 text-white border-b-4 border-blue-900 shadow-[12px_12px_0px_rgba(15,23,42,0.1)] group mb-10">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.4em] text-blue-200">
                                <span className="w-8 h-px bg-blue-600"></span>
                                <span>FINANCE_PROTOCOL: OVERWATCH_ACTIVE</span>
                            </div>
                            <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">
                                Financial_Unit
                            </h1>
                            <p className="text-blue-100/60 text-xs font-bold uppercase tracking-[0.2em] max-w-xl">
                                Comprehensive vector analysis of company solvency and expense allocation logs
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-8 lg:mt-0">
                            <div className="flex flex-col">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-blue-200 pl-1">Currency_Vector</label>
                                <select
                                    value={selectedCurrency}
                                    onChange={(e) => setSelectedCurrency(e.target.value)}
                                    className="bg-blue-900/40 border-2 border-blue-700/50 text-white rounded-none px-4 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-white transition-all cursor-pointer appearance-none min-w-[120px]"
                                >
                                    <option value="INR">INR (₹)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>
                            <button 
                                onClick={() => {
                                    setEditingExpense(null);
                                    setIsExpenseModalOpen(true);
                                }}
                                className="inline-flex items-center gap-4 px-8 py-4 bg-white text-blue-950 font-black uppercase tracking-[0.2em] text-[10px] shadow-[8px_8px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:scale-95 border-b-4 border-blue-200 self-end"
                            >
                                <Plus size={18} strokeWidth={3} />
                                Initiate_Expense_Entry
                            </button>
                        </div>
                    </div>

                    {/* Diagnostic Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-4 bg-white border-2 border-slate-900 shadow-[8px_8px_0px_rgba(15,23,42,0.05)] divide-y md:divide-y-0 md:divide-x-2 divide-slate-900 mb-10">
                        {/* Overall Balance / Revenue */}
                        <div className="p-8 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Est._Turnover</p>
                                <h3 className="text-3xl font-black text-slate-900 font-mono italic">{formatCurrency(summary?.turnover || 0)}</h3>
                                <div className="flex items-center text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-2">
                                    <ArrowUpRight size={14} className="mr-1" /> +12.5% [FLOW:POSITIVE]
                                </div>
                            </div>
                            <div className="p-3 bg-slate-900 text-white rounded-none shadow-[4px_4px_0px_rgba(15,23,42,0.1)]">
                                <TrendingUp size={24} />
                            </div>
                        </div>

                        {/* Total Expenses */}
                        <div className="p-8 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Total_Expenses</p>
                                <h3 className="text-3xl font-black text-slate-900 font-mono italic">{formatCurrency(summary?.totalExpenses || 0)}</h3>
                                <div className="flex items-center text-[9px] font-black text-rose-600 uppercase tracking-widest mt-2">
                                    <ArrowUpRight size={14} className="mr-1" /> +5.2% [VECTOR:RISING]
                                </div>
                            </div>
                            <div className="p-3 bg-slate-900 text-white rounded-none shadow-[4px_4px_0px_rgba(15,23,42,0.1)]">
                                <TrendingDown size={24} />
                            </div>
                        </div>

                        {/* Payroll Total */}
                        <div className="p-8 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Total_Payroll</p>
                                <h3 className="text-3xl font-black text-slate-900 font-mono italic">{formatCurrency(summary?.totalPayroll || 0)}</h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 border border-slate-200 px-2 py-0.5 inline-block">Cycle: CURRENT_MONTH</p>
                            </div>
                            <div className="p-3 bg-slate-900 text-white rounded-none shadow-[4px_4px_0px_rgba(15,23,42,0.1)]">
                                <Wallet size={24} />
                            </div>
                        </div>

                        {/* Net Margin/Profit */}
                        <div className="p-8 flex items-center justify-between group bg-slate-900 transition-colors">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Net_Profit_Vector</p>
                                <h3 className="text-3xl font-black text-emerald-400 font-mono italic">
                                    {formatCurrency((summary?.turnover || 0) - (summary?.totalExpenses || 0) - (summary?.totalPayroll || 0))}
                                </h3>
                                <div className="flex items-center text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 mr-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                    STATUS: HEALTHY
                                </div>
                            </div>
                            <div className="p-3 bg-white text-slate-900 rounded-none shadow-[4px_4px_0px_rgba(255,255,255,0.1)]">
                                <FaRupeeSign size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Integrated Intelligence Center (Charts) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
                        {/* Revenue vs Expenses Chart */}
                        <div className="lg:col-span-2 bg-white border-2 border-slate-900 shadow-[12px_12px_0px_rgba(15,23,42,0.05)] overflow-hidden group">
                            <div className="px-8 pt-8 pb-4 border-b border-slate-100 flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="w-1.5 h-6 bg-slate-900"></span>
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Growth_Vector</h3>
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-3.5">Analysis: SOLVENCY_TRENDS</p>
                                </div>
                                <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.2em]">
                                    <div className="flex items-center gap-2 text-blue-800">
                                        <div className="w-2.5 h-2.5 bg-blue-800" /> Revenue
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <div className="w-2.5 h-2.5 bg-slate-200" /> Expenses
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 h-[340px] w-full bg-slate-50/30">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#1e40af" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#1e40af" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="0" vertical={false} stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="month"
                                            axisLine={{ stroke: '#0f172a', strokeWidth: 1 }}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={{ stroke: '#0f172a', strokeWidth: 1 }}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                                            tickFormatter={(val) => `₹${val / 1000}K`}
                                        />
                                        <Tooltip
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-slate-900 p-4 shadow-[8px_8px_0px_rgba(15,23,42,0.1)]">
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}_CHRONO_POINT</p>
                                                            {payload.map((entry, index) => (
                                                                <div key={index} className="flex items-center justify-between gap-8 mt-1">
                                                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{entry.name}</span>
                                                                    <span className="text-sm font-black text-white font-mono italic">{formatCurrency(entry.value)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                            cursor={{ stroke: '#0f172a', strokeWidth: 1 }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="revenue" 
                                            stroke="#1e3a8a" 
                                            strokeWidth={3} 
                                            fillOpacity={1} 
                                            fill="url(#colorRev)" 
                                            activeDot={{ r: 4, strokeWidth: 4, stroke: '#ffffff', fill: '#1e3a8a' }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="expenses" 
                                            stroke="#94a3b8" 
                                            strokeWidth={2} 
                                            fill="transparent"
                                            strokeDasharray="5 5"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Expense Distribution */}
                        <div className="bg-white border-2 border-slate-900 shadow-[12px_12px_0px_rgba(15,23,42,0.05)] overflow-hidden">
                            <div className="px-8 pt-8 pb-4 border-b border-slate-100 mb-6">
                                <div className="flex items-center space-x-2">
                                    <span className="w-1.5 h-6 bg-slate-900"></span>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Cost_Split</h3>
                                </div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-3.5">Metrics: CATEGORY_ALLOCATION</p>
                            </div>
                            
                            <div className="px-8 flex flex-col items-center">
                                <div className="h-[220px] w-full mb-8">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RePieChart>
                                            <Pie
                                                data={categoryData}
                                                innerRadius={65}
                                                outerRadius={85}
                                                paddingAngle={4}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload;
                                                        return (
                                                            <div className="bg-slate-900 p-3 shadow-[8px_8px_0px_rgba(15,23,42,0.1)]">
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{data.name}_ALLOCATION</p>
                                                                <p className="text-lg font-black text-white font-mono italic">{formatCurrency(data.value)}</p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                        </RePieChart>
                                    </ResponsiveContainer>
                                </div>
                                
                                <div className="w-full space-y-2 pb-8">
                                    {categoryData.slice(0, 4).map((item, id) => (
                                        <div key={id} className="flex items-center justify-between p-3 bg-slate-50 border-l-4" style={{ borderColor: item.color }}>
                                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{item.name}</span>
                                            <span className="text-[10px] font-black font-mono italic text-slate-900">{formatCurrency(item.value)}</span>
                                        </div>
                                    ))}
                                    {categoryData.length > 4 && (
                                        <p className="text-[8px] font-black text-slate-400 text-center uppercase tracking-widest pt-2">+{categoryData.length - 4}_MIN_CHANNELS_REMAINING</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Transaction Audit Grid */}
                    <div className="bg-white border-2 border-slate-900 shadow-[12px_12px_0px_rgba(15,23,42,0.05)] overflow-hidden transition-all duration-300">
                        <div className="p-8 border-b-2 border-slate-900 bg-slate-50 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Transaction_Audit_Log</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sequence: REALTIME_FINANCIAL_STREAM</p>
                            </div>
                            
                            <div className="flex flex-wrap items-end gap-6">
                                <div className="flex flex-col">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-slate-400 pl-1">Search_Criteria</label>
                                    <div className="relative">
                                        <Icon name="Search" size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="SCAN_RECORDS..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="bg-white border-2 border-slate-200 rounded-none pl-12 pr-6 py-3 text-xs font-mono uppercase w-full sm:w-64 focus:outline-none focus:border-slate-900 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-slate-400 pl-1">Category_Filter</label>
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className="bg-white border-2 border-slate-200 rounded-none px-4 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-slate-900 transition-all cursor-pointer appearance-none min-w-[160px]"
                                    >
                                        <option value="All">ALL_CATEGORIES</option>
                                        <option value="Operating">OPERATING</option>
                                        <option value="Salaries">SALARIES</option>
                                        <option value="Marketing">MARKETING</option>
                                        <option value="Infrastructure">INFRASTRUCTURE</option>
                                        <option value="Maintenance">MAINTENANCE</option>
                                        <option value="Tax">TAX</option>
                                        <option value="Misc">MISC</option>
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-slate-400 pl-1">Temporal_Range</label>
                                    <div className="flex items-center gap-2 bg-white border-2 border-slate-200 px-4 py-2.5 rounded-none">
                                        <Calendar size={14} className="text-slate-400" />
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="bg-transparent text-[10px] font-mono uppercase focus:outline-none"
                                        />
                                        <span className="text-slate-300 text-[10px] font-black mx-1 inline-block select-none font-mono">::</span>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="bg-transparent text-[10px] font-mono uppercase focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {(searchTerm || filterCategory !== 'All' || startDate || endDate) && (
                                        <button
                                            onClick={resetFilters}
                                            className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] hover:text-rose-700 hover:underline transition-colors pb-3"
                                        >
                                            Reset_Filters
                                        </button>
                                    )}
                                    <button className="p-3 bg-slate-900 text-white rounded-none hover:bg-slate-800 transition-colors shadow-[4px_4px_0px_rgba(15,23,42,0.1)] mb-1">
                                        <Download size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b-2 border-slate-900">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Transaction_identity</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Vector_Type</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-center">Protocol_Date</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-center">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Metric_Value</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-center">Exec_Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="6" className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-10 h-1 bg-slate-100 overflow-hidden relative">
                                                        <div className="absolute inset-0 bg-slate-900 animate-[loading-bar_1.5s_infinite]"></div>
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">INITIALIZING_AUDIT_STREAM...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredExpenses.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center opacity-40 grayscale">
                                                    <Receipt size={64} strokeWidth={1} className="mb-6 text-slate-300" />
                                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">NO_DATA_INTERCEPTED</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Check filter parameters or temporal range</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredExpenses.map((expense, idx) => (
                                            <tr key={expense.id || idx} className="hover:bg-slate-50/50 transition-all duration-200 group">
                                                <td className="px-8 py-6 border-l-4 border-transparent group-hover:border-slate-900">
                                                    <div className="flex items-center gap-5">
                                                        <div className={`p-3 rounded-none shadow-[4px_4px_0px_rgba(15,23,42,0.05)] ${expense.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                            {expense.type === 'credit' ? <ArrowDownRight size={20} strokeWidth={3} /> : <CreditCard size={20} strokeWidth={2.5} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{expense.title}</p>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 italic">{expense.employee?.user?.firstName || 'SYSTEM_CORE'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-[9px] font-black bg-slate-100 border border-slate-200 px-3 py-1 text-slate-600 uppercase tracking-widest">
                                                        {expense.category || 'MAINTENANCE'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-[10px] font-black font-mono text-slate-500 uppercase text-center">
                                                    {format(new Date(expense.date), 'yyyy.MM.dd')}
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className={`inline-flex items-center px-4 py-1 border-2 text-[9px] font-black uppercase tracking-widest ${
                                                        expense.status === 'approved' 
                                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-[4px_4px_0px_rgba(16,185,129,0.1)]' 
                                                        : 'bg-amber-50 border-amber-500 text-amber-700 shadow-[4px_4px_0px_rgba(245,158,11,0.1)]'
                                                    }`}>
                                                        {expense.status === 'approved' ? '[ VERIFIED ]' : '[ PENDING ]'}
                                                    </span>
                                                </td>
                                                <td className={`px-8 py-6 text-sm font-black font-mono italic text-right ${expense.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                    {expense.type === 'credit' ? '+' : '-'}{formatCurrency(expense.amount)}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button
                                                            onClick={() => handleViewExpense(expense)}
                                                            className="p-2.5 text-blue-800 hover:bg-blue-50 border border-blue-100 transition-all uppercase text-[9px] font-black tracking-widest shadow-[3px_3px_0px_rgba(30,64,175,0.05)]"
                                                            title="INSPECT_ENTRY"
                                                        >
                                                            Inspect
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditExpense(expense)}
                                                            className="p-2.5 text-slate-900 hover:bg-slate-900 hover:text-white border border-slate-900 transition-all shadow-[3px_3px_0px_rgba(15,23,42,0.1)]"
                                                            title="MODIFY_ENTITY"
                                                        >
                                                            <Edit2 size={14} strokeWidth={3} />
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
