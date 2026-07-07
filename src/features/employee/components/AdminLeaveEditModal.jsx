import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, Info } from 'lucide-react';
import financeService from '../../../services/finance.service';
import { toast } from 'react-hot-toast';

const AdminLeaveEditModal = ({ isOpen, onClose, leave, onUpdate }) => {
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reason: '',
        leaveType: '',
        status: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (leave) {
            setFormData({
                startDate: leave.startDate || '',
                endDate: leave.endDate || '',
                reason: leave.reason || '',
                leaveType: leave.leaveType || leave.type || '',
                status: leave.status || 'PENDING'
            });
        }
    }, [leave]);

    if (!isOpen || !leave) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const id = leave._id || leave.id;
            await financeService.updateLeave(id, formData);
            toast.success('Leave record updated successfully');
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Failed to update leave:', error);
            toast.error('Failed to update leave record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-sidebar/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-xl rounded-lg shadow-sm overflow-hidden border border-border animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-muted/50">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2">
                            <span className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center text-sm">
                                <Calendar size={18} />
                            </span>
                            Edit Leave Record
                        </h2>
                        <p className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wide mt-1">
                            {leave.employee?.user?.firstName} {leave.employee?.user?.lastName} • {leave.employee?.employeeCode}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-border rounded-xl transition-colors text-muted-foreground/70 hover:text-foreground">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Leave Type */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wide ml-1">Leave Category</label>
                            <select
                                name="leaveType"
                                value={formData.leaveType}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-muted/60 border border-border rounded-lg text-sm font-bold focus:bg-card focus:border-primary outline-none transition-all"
                                required
                            >
                                <option value="sick">Sick Leave</option>
                                <option value="casual">Casual Leave</option>
                                <option value="annual">Annual Leave</option>
                                <option value="unpaid">Unpaid Leave</option>
                                <option value="maternity">Maternity Leave</option>
                                <option value="paternity">Paternity Leave</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wide ml-1">Current Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-muted/60 border border-border rounded-lg text-sm font-bold focus:bg-card focus:border-primary outline-none transition-all"
                                required
                            >
                                <option value="PENDING">Pending Approval</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>

                        {/* Dates */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wide ml-1">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-muted/60 border border-border rounded-lg text-sm font-bold focus:bg-card focus:border-primary outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wide ml-1">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-muted/60 border border-border rounded-lg text-sm font-bold focus:bg-card focus:border-primary outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wide ml-1">Reason for Leave</label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            rows="4"
                            className="w-full p-5 bg-muted/60 border border-border rounded-lg text-sm font-medium outline-none focus:bg-card focus:border-primary transition-all resize-none shadow-inner"
                            placeholder="Enter the reason for leave..."
                            required
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
                        >
                            Cancel Changes
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-primary text-white text-xs font-semibold uppercase tracking-wide rounded-lg hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Check size={14} />
                            )}
                            Update Record
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Check = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export default AdminLeaveEditModal;
