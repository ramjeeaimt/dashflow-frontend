import React from 'react';
import { X, IndianRupee, Tag, FileText, Calendar, User, CreditCard, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const ExpenseViewModal = ({ isOpen, onClose, expense }) => {
    if (!isOpen || !expense) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-500/10 text-green-600';
            case 'pending':
                return 'bg-yellow-500/10 text-yellow-600';
            case 'rejected':
                return 'bg-red-500/10 text-red-600';
            default:
                return 'bg-gray-500/10 text-gray-600';
        }
    };

    const getTypeColor = (type) => {
        return type === 'credit' ? 'text-green-500' : 'text-red-500';
    };

    const getTypeLabel = (type) => {
        return type === 'credit' ? 'Incoming (Credit)' : 'Outgoing (Debit)';
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                    <div>
                        <h2 className="text-2xl font-bold">Expense Details</h2>
                        <p className="text-xs text-muted-foreground mt-1">Complete information about this transaction</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Title and Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                                <FileText size={14} className="inline mr-1" /> Title
                            </label>
                            <p className="text-lg font-bold text-foreground">{expense.title}</p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                                Transaction Type
                            </label>
                            <div className={`inline-flex items-center px-3 py-1.5 rounded-lg font-semibold text-sm ${getTypeColor(expense.type)} bg-opacity-10`}>
                                <CreditCard size={14} className="mr-1.5" />
                                {getTypeLabel(expense.type)}
                            </div>
                        </div>
                    </div>

                    {/* Amount Section */}
                    <div className="bg-muted/30 border border-border rounded-xl p-4">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                            <IndianRupee size={14} className="inline mr-1" /> Amount
                        </label>
                        <p className={`text-4xl font-bold ${getTypeColor(expense.type)}`}>
                            {expense.type === 'credit' ? '+' : '-'}₹{Number(expense.amount).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">Currency: {expense.currency || 'INR'}</p>
                    </div>

                    {/* Category and Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                                <Tag size={14} className="inline mr-1" /> Category
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary" />
                                <span className="font-semibold text-foreground">{expense.category || 'Uncategorized'}</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                                <Calendar size={14} className="inline mr-1" /> Date
                            </label>
                            <p className="font-semibold text-foreground">
                                {format(new Date(expense.date), 'MMMM dd, yyyy')}
                                <span className="text-sm text-muted-foreground ml-2">
                                    ({format(new Date(expense.date), 'EEEE')})
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                            Status
                        </label>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${getStatusColor(expense.status)}`}>
                            {expense.status || 'Verified'}
                        </span>
                    </div>

                    {/* Description */}
                    {expense.description && (
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                                Description
                            </label>
                            <div className="bg-muted/20 border border-border rounded-lg p-4">
                                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                    {expense.description}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Employee Information */}
                    {expense.employee?.user && (
                        <div className="bg-muted/20 border border-border rounded-lg p-4">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
                                <User size={14} className="inline mr-1" /> Posted By
                            </label>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-sm font-bold text-primary">
                                        {expense.employee.user.firstName?.[0]}{expense.employee.user.lastName?.[0]}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">
                                        {expense.employee.user.firstName} {expense.employee.user.lastName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{expense.employee.user.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="bg-muted/10 border border-border rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                        <p><strong>Expense ID:</strong> {expense.id}</p>
                        <p><strong>Created:</strong> {format(new Date(expense.createdAt), 'PPpp')}</p>
                        {expense.updatedAt && (
                            <p><strong>Last Updated:</strong> {format(new Date(expense.updatedAt), 'PPpp')}</p>
                        )}
                    </div>

                    {/* Alert for pending status */}
                    {expense.status === 'pending' && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-yellow-700 text-sm">Pending Verification</p>
                                <p className="text-xs text-yellow-600 mt-1">This expense is awaiting approval. You can edit or delete it before it's verified.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 p-6 border-t border-border bg-muted/20">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExpenseViewModal;
