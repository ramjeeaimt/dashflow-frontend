import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, User, DollarSign, Calendar, FileText, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Mail, Loader2 } from 'lucide-react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PayrollDetailsModal = ({ isOpen, onClose, payroll, onSendEmail }) => {
    const [localNotes, setLocalNotes] = useState('');
    const [isSending, setIsSending] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (payroll && payroll.notes) {
            setLocalNotes(payroll.notes);
        } else {
            setLocalNotes('');
        }
    }, [payroll, isOpen]);

    const handleSendClick = async () => {
        if (!onSendEmail) return;
        setIsSending(true);
        try {
            await onSendEmail(payroll.id, localNotes);
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen || !payroll) return null;

    const employee = payroll.employee || {};
    const user = employee.user || {};
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`;
    const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthLabel = monthNames[payroll.month - 1] || '---';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-sidebar/60 backdrop-blur-sm transition-all duration-300">
            <div className="bg-card w-full max-w-2xl h-[95vh] rounded-[24px] shadow-sm overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
                {/* Header Section */}
                <div className="relative px-8 pt-8 pb-6 border-b border-slate-50">
                    <button 
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 bg-muted/60 text-muted-foreground/70 hover:text-foreground hover:bg-muted rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>
                    
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-primary rounded-[20px] flex items-center justify-center text-white text-2xl font-semibold shadow-sm">
                            {initials}
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-foreground tracking-tight">{fullName}</h2>
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider">{employee.employeeCode}</span>
                                <span className="w-1 h-1 bg-border rounded-full"></span>
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-tight py-0.5 px-2 rounded-lg ${
 payroll.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
 }`}>
                                    {payroll.status === 'paid' ? <CheckCircle size={10} strokeWidth={3} /> : <AlertCircle size={10} strokeWidth={3} />}
                                    {payroll.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {/* Month/Year Summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-muted/60 rounded-lg border border-border flex items-center gap-4">
                            <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center text-primary shadow-sm">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wide leading-none mb-1">Cycle Period</p>
                                <p className="text-sm font-bold text-foreground uppercase tracking-tighter">{monthLabel} {payroll.year}</p>
                            </div>
                        </div>
                        <div className="p-5 bg-primary rounded-lg shadow-sm flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                                <DollarSign size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-primary-foreground/80 uppercase tracking-wide leading-none mb-1">Net Payable</p>
                                <p className="text-sm font-bold text-white tracking-tighter">{formatCurrency(payroll.netSalary)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                                <FileText size={16} className="text-muted-foreground/70" />
                                Salary Breakdown
                            </h3>
                            <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide">Values in INR</span>
                        </div>

                        <div className="space-y-3">
                            {/* Basic */}
                            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-border transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground">
                                        <Icon name="Activity" size={14} />
                                    </div>
                                    <span className="text-sm font-bold text-foreground">Basic Monthly Component</span>
                                </div>
                                <span className="text-sm font-bold text-foreground">{formatCurrency(payroll.basicSalary)}</span>
                            </div>

                            {/* Allowances */}
                            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-border transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 font-bold">
                                        <TrendingUp size={14} />
                                    </div>
                                    <span className="text-sm font-bold text-foreground">Additional Allowances</span>
                                </div>
                                <span className="text-sm font-bold text-emerald-600">+{formatCurrency(payroll.allowances)}</span>
                            </div>

                            {/* Overtime */}
                            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-border transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 font-bold">
                                        <TrendingUp size={14} />
                                    </div>
                                    <span className="text-sm font-bold text-foreground">Overtime Pay</span>
                                </div>
                                <span className="text-sm font-bold text-emerald-600">+{formatCurrency(payroll.overtime || 0)}</span>
                            </div>

                            {/* Deductions */}
                            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-border transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 font-bold">
                                        <TrendingDown size={14} />
                                    </div>
                                    <span className="text-sm font-bold text-foreground">Total Deductions</span>
                                </div>
                                <span className="text-sm font-bold text-rose-600">-{formatCurrency(payroll.deductions)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="pt-6 border-t border-slate-50 flex-1 flex flex-col">
                        <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wide leading-none mb-3">Manager Reminders & Notes</p>
                        <div 
                            className="flex-1 bg-muted/60 rounded-xl border-2 border-dashed border-border p-2 min-h-[150px] cursor-text"
                            onClick={() => textareaRef.current && textareaRef.current.focus()}
                        >
                            <textarea 
                                ref={textareaRef}
                                value={localNotes}
                                onChange={(e) => setLocalNotes(e.target.value)}
                                placeholder="Type your administrative notes here. These will be included in the salary slip email."
                                className="w-full h-full bg-transparent border-none resize-none text-sm text-foreground placeholder:text-muted-foreground/70 focus:ring-0 p-2 custom-scrollbar"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="px-8 py-6 bg-muted/60 border-t border-border flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide">Generated On</span>
                        <span className="text-xs font-bold text-foreground uppercase tracking-tighter">
                            {new Date(payroll.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={onClose} className="rounded-xl font-bold">Close Details</Button>
                        <Button 
                            onClick={handleSendClick}
                            disabled={isSending}
                            className={`rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-sm flex items-center gap-2 ${isSending ? 'opacity-80 cursor-not-allowed' : ''}`}
                        >
                            {isSending ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                            {isSending ? 'Sending...' : 'Send Email'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayrollDetailsModal;
