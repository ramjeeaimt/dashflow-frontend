import React from 'react';
import { X, IndianRupee, Tag, FileText, Calendar, User, CreditCard, Wallet, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';

const safeParse = (dateStr) => {
    if (!dateStr) return null;
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    return isValid(d) ? d : null;
};

const ExpenseViewModal = ({ isOpen, onClose, expense }) => {
    if (!isOpen || !expense) return null;

    // Detect if this is a payroll row (built in FinanceDashboardPage)
    const isPayroll = expense._type === 'payroll' || expense.id?.toString?.().startsWith('payroll-');
    const rawExpense = expense._raw || expense;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-100', label: 'Approved / Done', Icon: CheckCircle2 };
            case 'pending':
                return { cls: 'bg-amber-50 text-amber-700 border border-amber-100', label: 'Pending Review', Icon: Clock };
            case 'rejected':
                return { cls: 'bg-rose-50 text-rose-700 border border-rose-100', label: 'Rejected', Icon: AlertCircle };
            default:
                return { cls: 'bg-muted/60 text-muted-foreground border border-border', label: status || 'N/A', Icon: CheckCircle2 };
        }
    };

    const isCredit = expense.rawType === 'credit' || rawExpense.type === 'credit';
    const title = expense.title || rawExpense.title || '—';
    const amount = Number(expense.amount || rawExpense.amount || rawExpense.netSalary || rawExpense.total || 0);
    const category = expense.category || rawExpense.category || 'Misc';
    const status = expense.status || rawExpense.status || 'approved';
    const description = expense.description || rawExpense.description || '';
    const currency = expense.currency || rawExpense.currency || 'INR';
    const dateValue = expense.date ? (expense.date instanceof Date ? expense.date : safeParse(expense.dateStr || expense.date)) : safeParse(rawExpense.date || rawExpense.createdAt);
    const createdAt = safeParse(rawExpense.createdAt);
    const updatedAt = safeParse(rawExpense.updatedAt);
    const employee = expense.employee || rawExpense.employee;

    const statusInfo = getStatusBadge(status);
    const StatusIcon = statusInfo.Icon;

    const formatAmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(v || 0);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-xl bg-card rounded-lg shadow-sm overflow-hidden z-10">
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-5 border-b border-border ${isCredit ? 'bg-emerald-50/60' : isPayroll ? 'bg-amber-50/60' : 'bg-rose-50/40'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isCredit ? 'bg-emerald-100 text-emerald-700' : isPayroll ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                            {isPayroll ? <Wallet size={20} /> : isCredit ? <IndianRupee size={20} /> : <CreditCard size={20} />}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">{isPayroll ? 'Payroll Details' : 'Transaction Details'}</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">{isCredit ? 'Incoming Credit' : isPayroll ? 'Payroll Disbursement' : 'Outgoing Debit'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground/70 hover:text-foreground">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                    {/* Amount - hero */}
                    <div className={`rounded-xl p-5 text-center ${isCredit ? 'bg-emerald-50 border border-emerald-100' : isPayroll ? 'bg-amber-50 border border-amber-100' : 'bg-rose-50 border border-rose-100'}`}>
                        <p className="text-[10px] font-bold uppercase tracking-wide mb-1 text-muted-foreground">Amount</p>
                        <p className={`text-4xl font-bold tracking-tight ${isCredit ? 'text-emerald-600' : isPayroll ? 'text-amber-600' : 'text-rose-600'}`}>
                            {isCredit ? '+' : '−'}{formatAmt(amount)}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">Currency: {currency}</p>
                    </div>

                    {/* Title & Type grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/60 rounded-xl p-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1.5 flex items-center gap-1">
                                <FileText size={11} /> Title
                            </p>
                            <p className="text-sm font-bold text-foreground">{title}</p>
                        </div>
                        <div className="bg-muted/60 rounded-xl p-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1.5 flex items-center gap-1">
                                <Tag size={11} /> Category
                            </p>
                            <span className="inline-block text-xs font-bold text-foreground bg-card border border-border px-2.5 py-1 rounded-full">
                                {category}
                            </span>
                        </div>
                    </div>

                    {/* Date & Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/60 rounded-xl p-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1.5 flex items-center gap-1">
                                <Calendar size={11} /> Date
                            </p>
                            <p className="text-sm font-bold text-foreground">
                                {dateValue ? format(dateValue, 'MMM dd, yyyy') : '—'}
                            </p>
                            {dateValue && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{format(dateValue, 'EEEE')}</p>}
                        </div>
                        <div className="bg-muted/60 rounded-xl p-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1.5">Status</p>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${statusInfo.cls}`}>
                                <StatusIcon size={13} /> {statusInfo.label}
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    {description && (
                        <div className="bg-muted/60 rounded-xl p-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">Description / Notes</p>
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{description}</p>
                        </div>
                    )}

                    {/* Employee Info */}
                    {employee?.user && (
                        <div className="bg-muted/60 rounded-xl p-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-3 flex items-center gap-1">
                                <User size={11} /> {isPayroll ? 'Employee' : 'Posted By'}
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                                    {(employee.user.firstName?.[0] || '') + (employee.user.lastName?.[0] || '')}
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground text-sm">{employee.user.firstName} {employee.user.lastName}</p>
                                    <p className="text-xs text-muted-foreground/70">{employee.user.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="bg-muted/60 rounded-xl p-4 text-xs text-muted-foreground/70 space-y-1.5 border border-border">
                        {rawExpense.id && (
                            <div className="flex justify-between">
                                <span className="font-semibold">ID</span>
                                <span className="font-mono text-muted-foreground">{rawExpense.id}</span>
                            </div>
                        )}
                        {createdAt && (
                            <div className="flex justify-between">
                                <span className="font-semibold">Created</span>
                                <span>{format(createdAt, 'MMM dd, yyyy — HH:mm')}</span>
                            </div>
                        )}
                        {updatedAt && createdAt && updatedAt.getTime() !== createdAt.getTime() && (
                            <div className="flex justify-between">
                                <span className="font-semibold">Last Updated</span>
                                <span>{format(updatedAt, 'MMM dd, yyyy — HH:mm')}</span>
                            </div>
                        )}
                    </div>

                    {/* Pending Alert */}
                    {status === 'pending' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
                            <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-amber-700">Awaiting Approval</p>
                                <p className="text-xs text-amber-600 mt-0.5">This transaction is pending verification. It can still be edited before approval.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-muted/50">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2.5 bg-sidebar text-white font-semibold rounded-xl hover:bg-sidebar transition-colors text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExpenseViewModal;
