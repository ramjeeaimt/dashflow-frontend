import React, { useState, useEffect } from 'react';
import { X, Save, TrendingUp, TrendingDown, Banknote, Wallet, ShieldCheck, Clock, Search } from 'lucide-react';
import Icon from '../../../components/AppIcon';
import { toast } from 'react-hot-toast';

const PayrollEditModal = ({ isOpen, onClose, payroll, employees = [], onSave, mode = 'edit' }) => {
    const [formData, setFormData] = useState({
        employeeId: '',
        basicSalary: 0,
        allowances: 0,
        deductions: 0,
        overtime: 0,
        netSalary: 0,
        status: 'pending',
        notes: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        if (payroll && mode === 'edit') {
            const raw = payroll._raw || payroll;
            setFormData({
                employeeId: raw.employeeId || '',
                basicSalary: Number(raw.basicSalary || raw.salary || raw.amount || 0),
                allowances: Number(raw.allowances || 0),
                deductions: Number(raw.deductions || 0),
                overtime: Number(raw.overtime || 0),
                netSalary: Number(raw.netSalary || 0),
                status: (raw.status || 'pending').toLowerCase(),
                notes: raw.notes || '',
                month: raw.month || new Date().getMonth() + 1,
                year: raw.year || new Date().getFullYear()
            });
        } else if (mode === 'create') {
            setFormData({
                employeeId: '',
                basicSalary: 0,
                allowances: 0,
                deductions: 0,
                overtime: 0,
                netSalary: 0,
                status: 'pending',
                notes: '',
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear()
            });
            setSearchTerm('');
        }
    }, [payroll, mode, isOpen]);

    useEffect(() => {
        const net = (Number(formData.basicSalary) || 0) +
            (Number(formData.allowances) || 0) +
            (Number(formData.overtime) || 0) -
            (Number(formData.deductions) || 0);
        setFormData(prev => ({ ...prev, netSalary: net }));
    }, [formData.basicSalary, formData.allowances, formData.deductions, formData.overtime]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mode === 'create' && !formData.employeeId) {
            toast.error('Please select an employee');
            return;
        }
        setIsSubmitting(true);
        try {
            const rawId = mode === 'edit' ? (payroll.id || payroll._raw?.id || payroll._id) : null;
            const id = rawId ? String(rawId).replace(/^payroll-/, '') : null;
            await onSave(id, formData);
            onClose();
        } catch (error) {
            console.error('Submit Error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        (emp.user?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.user?.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.employeeCode || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectEmployee = (emp) => {
        setFormData(prev => ({
            ...prev,
            employeeId: emp.id,
            basicSalary: emp.salary || 0
        }));
        setSearchTerm(`${emp.user?.firstName} ${emp.user?.lastName}`);
        setIsDropdownOpen(false);
    };

    if (!isOpen) return null;

    const employee = mode === 'edit' ? (payroll.employee || {}) : (employees.find(e => e.id === formData.employeeId) || {});
    const fullName = mode === 'edit' ? (`${employee.user?.firstName || ''} ${employee.user?.lastName || ''}`.trim()) : 'New Entry';

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-4 sm:px-8 py-4 sm:py-6 bg-white text-black border-b border-slate-200 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-600 text-white flex-shrink-0">
                                <Banknote size={24} />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-lg sm:text-xl font-bold text-black uppercase tracking-tight truncate">
                                    {mode === 'edit' ? 'Edit Payroll' : 'Manual Entry'}
                                </h2>
                                <p className="text-[9px] sm:text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1 truncate">
                                    {mode === 'edit' ? `${fullName} — ${employee.employeeCode || 'System'}` : 'New Disbursement'}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 flex-shrink-0">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 bg-white">
                    {/* Employee Selector */}
                    {mode === 'create' && (
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Select Employee</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by name or code..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    className="w-full bg-slate-50 border border-slate-200 p-3 sm:p-4 pl-12 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
                                />
                                {isDropdownOpen && filteredEmployees.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 z-50 max-h-60 overflow-y-auto shadow-xl">
                                        {filteredEmployees.map(emp => (
                                            <button
                                                key={emp.id}
                                                type="button"
                                                onClick={() => handleSelectEmployee(emp)}
                                                className="w-full text-left p-4 hover:bg-slate-50 flex items-center gap-4 border-b border-slate-100 last:border-0"
                                            >
                                                <div className="w-10 h-10 bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs flex-shrink-0">
                                                    {emp.user?.firstName?.[0]}{emp.user?.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{emp.user?.firstName} {emp.user?.lastName}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase">{emp.employeeCode}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Financial Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2">
                                <Wallet size={12} /> Basic Salary
                            </label>
                            <input
                                type="number"
                                name="basicSalary"
                                value={formData.basicSalary}
                                onChange={handleChange}
                                required
                                className="w-full bg-slate-50 border border-slate-200 p-3 sm:p-4 text-base font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2">
                                <TrendingUp size={12} className="text-emerald-600" /> Allowances
                            </label>
                            <input
                                type="number"
                                name="allowances"
                                value={formData.allowances}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 p-3 sm:p-4 text-base font-bold text-emerald-700 focus:bg-white focus:border-emerald-600 outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2">
                                <TrendingDown size={12} className="text-rose-600" /> Deductions
                            </label>
                            <input
                                type="number"
                                name="deductions"
                                value={formData.deductions}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 p-3 sm:p-4 text-base font-bold text-rose-700 focus:bg-white focus:border-rose-600 outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2">
                                <Clock size={12} /> Overtime
                            </label>
                            <input
                                type="number"
                                name="overtime"
                                value={formData.overtime}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 p-3 sm:p-4 text-base font-bold text-indigo-700 focus:bg-white focus:border-indigo-600 outline-none"
                            />
                        </div>
                    </div>

                    {/* Net Summary */}
                    <div className="p-4 sm:p-6 bg-slate-50 flex items-center justify-between border border-slate-100">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Net Payable</p>
                            <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-2xl sm:text-4xl font-bold text-black truncate">₹{formData.netSalary.toLocaleString('en-IN')}</span>
                                <span className="text-slate-500 font-bold text-xs">INR</span>
                            </div>
                        </div>
                        <ShieldCheck size={32} className="text-slate-700 flex-shrink-0" strokeWidth={1.5} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase">Payment Status</label>
                            <div className="relative">
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 p-3 sm:p-4 text-sm font-bold text-slate-900 appearance-none outline-none focus:border-blue-600"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="processing">Processing</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase">Cycle Period</label>
                            <div className="flex gap-2">
                                <select
                                    name="month"
                                    value={formData.month}
                                    onChange={handleChange}
                                    className="flex-1 bg-slate-50 border border-slate-200 p-3 sm:p-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-600"
                                >
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                                        <option key={m} value={i + 1}>{m}</option>
                                    ))}
                                </select>
                                <select
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    className="w-20 sm:w-24 bg-slate-50 border border-slate-200 p-3 sm:p-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-600"
                                >
                                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Admin Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="2"
                            placeholder="Internal remarks..."
                            className="w-full bg-slate-50 border border-slate-200 p-3 sm:p-4 text-sm font-medium text-slate-700 focus:bg-white focus:border-blue-600 outline-none resize-none"
                        ></textarea>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-4 sm:px-8 py-4 sm:py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 sm:px-6 py-3 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 sm:px-10 py-3 sm:py-4 bg-blue-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-blue-700 disabled:bg-slate-300 transition-all"
                    >
                        {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin"></div>
                        ) : <Save size={16} />}
                        <span className="truncate">{mode === 'edit' ? 'Update Entry' : 'Save Entry'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PayrollEditModal;