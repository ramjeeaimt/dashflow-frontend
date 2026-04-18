import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import api from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import { toast } from 'react-hot-toast';

const WFHRequestModal = ({ isOpen, onClose, employeeId, onSave }) => {
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(API_ENDPOINTS.WFH_REQUESTS.BASE, {
                employeeId,
                ...formData
            });
            toast.success('Work From Home request submitted successfully');
            if (onSave) onSave();
            onClose();
        } catch (error) {
            console.error('Failed to submit Work From Home request:', error);
            toast.error(error.response?.data?.message || 'Failed to submit Work From Home request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                <div className="mb-6">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Request Work From Home</h2>
                    <p className="text-slate-500 text-sm mt-1">Submit a temporary work from home request.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Start Date"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleChange('startDate', e.target.value)}
                            required
                        />
                        <Input
                            label="End Date"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => handleChange('endDate', e.target.value)}
                            required
                        />
                    </div>
                    <Input
                        label="Reason for Work From Home"
                        value={formData.reason}
                        onChange={(e) => handleChange('reason', e.target.value)}
                        placeholder="e.g. Personal emergency, sudden travel..."
                        required
                    />
                    
                    <div className="flex justify-end space-x-3 mt-8">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <Button 
                            type="submit" 
                            loading={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-2xl font-black shadow-xl shadow-indigo-100 dark:shadow-none"
                        >
                            Submit Request
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WFHRequestModal;
