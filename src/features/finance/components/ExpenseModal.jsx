import React, { useState, useEffect } from 'react';
import { X, IndianRupee, Tag, FileText, Calendar, Loader2, Briefcase, Paperclip, Trash2 } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import financeService from '../../../services/finance.service';
import useAuthStore from '../../../store/useAuthStore';
import useProjectStore from '../../../store/useProjectStore';
import uploadService from '../../upload/uploadService';
import { toast } from 'react-hot-toast';

const ExpenseModal = ({ isOpen, onClose, onSuccess, expenseToEdit = null }) => {
    const { user } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        amount: '',
        category: 'Operating',
        date: new Date().toISOString().split('T')[0],
        type: 'debit',
        currency: 'INR',
        status: 'pending',
        projectId: '',
        attachmentUrl: ''
    });

    const categories = [
        'Operating',
        'Rent',
        'Project',
        'Salaries',
        'Marketing',
        'Infrastructure',
        'Maintenance',
        'Tax',
        'Misc',
        'Glocery',
        'Electricity',
        'Water',
        'Internet',
        'Travel',
        'Other'
    ];

    // Initialize form with expense data when editing
    const { projects, fetchProjects } = useProjectStore();

    // Fetch projects for dropdown selection
    useEffect(() => {
        if (isOpen && user?.company?.id) {
            fetchProjects(user.company.id);
        }
    }, [isOpen, user?.company?.id]);

    useEffect(() => {
        if (expenseToEdit) {
            setFormData({
                title: expenseToEdit.title || '',
                description: expenseToEdit.description || '',
                amount: expenseToEdit.amount || '',
                category: expenseToEdit.category || 'Operating',
                date: expenseToEdit.date ? expenseToEdit.date.split('T')[0] : new Date().toISOString().split('T')[0],
                type: expenseToEdit.type || 'debit',
                currency: expenseToEdit.currency || 'INR',
                status: expenseToEdit.status || 'approved',
                projectId: expenseToEdit.projectId || '',
                attachmentUrl: expenseToEdit.attachmentUrl || ''
            });
        } else {
            setFormData({
                title: '',
                description: '',
                amount: '',
                category: 'Operating',
                date: new Date().toISOString().split('T')[0],
                type: 'debit',
                currency: 'INR',
                status: 'pending',
                projectId: '',
                attachmentUrl: ''
            });
        }
    }, [expenseToEdit, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const res = await uploadService.uploadDocument(file);
            const url = res.url || res.data?.url || res;
            if (url) {
                setFormData(prev => ({ ...prev, attachmentUrl: url }));
                toast.success('Attachment uploaded successfully!');
            } else {
                toast.error('Failed to get attachment URL');
            }
        } catch (err) {
            console.error('File upload error:', err);
            toast.error('Failed to upload attachment');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?.company?.id) return;

        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                companyId: user.company.id,
                amount: parseFloat(formData.amount),
                projectId: formData.category === 'Project' ? (formData.projectId || null) : null
            };

            if (expenseToEdit?.id) {
                // Update existing expense
                await financeService.updateExpense(expenseToEdit.id, payload);
                toast.success('Expense updated successfully');
            } else {
                // Create new expense
                await financeService.createExpense(payload);
                toast.success('Expense recorded successfully');
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save expense:', error);
            toast.error(error.response?.data?.message || 'Failed to save expense');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const isEditing = !!expenseToEdit?.id;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-card border border-border rounded-lg shadow-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold">{isEditing ? 'Edit Expense' : 'Add New Expense'}</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {isEditing ? 'Update the expense details and correct any errors.' : 'Record a company outflow or credit.'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Row 1: Title and Amount */}
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-8 space-y-1.5">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <FileText size={14} className="text-primary" /> Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Monthly Rent, Office Snacks"
                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>
                        <div className="col-span-4 space-y-1.5">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <IndianRupee size={14} className="text-primary" /> Amount *
                            </label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                    <span className="text-sm font-bold">₹</span>
                                </div>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    required
                                    min="0.01"
                                    step="any"
                                    placeholder="0.00"
                                    className="w-full bg-background border border-border rounded-xl pl-8 pr-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Category and Date */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Category */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <Tag size={14} className="text-primary" /> Category
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none transition-all cursor-pointer"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <Calendar size={14} className="text-primary" /> Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Row 3: Link to Project (Conditional) */}
                    {formData.category === 'Project' && (
                        <div className="space-y-1.5 animate-in fade-in duration-200">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <Briefcase size={14} className="text-primary" /> Link to Project (Optional)
                            </label>
                            <select
                                name="projectId"
                                value={formData.projectId || ''}
                                onChange={handleChange}
                                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                            >
                                <option value="">No linked project</option>
                                {projects.map(proj => (
                                    <option key={proj.id} value={proj.id}>
                                        {proj.projectName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Row 4: Payment Type and Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold">Payment Type</label>
                            <div className="flex bg-muted p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, type: 'debit' }))}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${formData.type === 'debit' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
                                >
                                    DEBIT (Out)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, type: 'credit' }))}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${formData.type === 'credit' ? 'bg-card text-green-500 shadow-sm' : 'text-muted-foreground'}`}
                                >
                                    CREDIT (In)
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none cursor-pointer"
                            >
                                <option value="approved">Paid / Done</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 5: Description */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold">Description (Optional)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="2"
                            placeholder="Additional details..."
                            className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                    </div>

                    {/* Row 6: Sleek Compact Attachment Upload */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold flex items-center gap-2">
                            <Paperclip size={14} className="text-primary" /> Attachment (Receipt / Invoice)
                        </label>
                        <div className="flex items-center gap-3">
                            {formData.attachmentUrl ? (
                                <div className="flex-1 flex items-center justify-between border border-border rounded-xl px-4 py-2 bg-muted/30">
                                    <a
                                        href={formData.attachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-semibold text-primary hover:underline truncate max-w-[320px]"
                                    >
                                        {formData.attachmentUrl.split('/').pop() || 'View Attachment'}
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, attachmentUrl: '' }))}
                                        className="p-1.5 hover:bg-muted text-red-500 rounded-lg transition-colors"
                                        title="Remove attachment"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ) : (
                                <label className={`flex-1 flex items-center justify-between border border-dashed border-border rounded-xl px-4 py-2 bg-background hover:bg-muted/10 cursor-pointer transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="flex items-center gap-2">
                                        {isUploading ? (
                                            <>
                                                <Loader2 size={14} className="text-primary animate-spin" />
                                                <span className="text-xs text-muted-foreground">Uploading file...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Paperclip size={14} className="text-muted-foreground" />
                                                <span className="text-xs font-semibold text-foreground">Click to upload file</span>
                                            </>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">PDF, Image, Max 5MB</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                        disabled={isUploading}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 rounded-xl shadow-sm shadow-primary/20"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin" /> {isEditing ? 'Updating...' : 'Recording...'}
                                </span>
                            ) : (
                                isEditing ? 'Update Expense' : 'Record Expense'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseModal;
