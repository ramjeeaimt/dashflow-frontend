import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import api from '../../../api/client';

const LeaveModal = ({ isOpen, onClose, employeeId, onSave }) => {
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reason: '',
        type: 'sick'
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

            await api.post('/leaves', {
                employeeId,
                ...formData
            });
            alert('Leave request submitted successfully');
            onSave();
            onClose();
        } catch (error) {
            console.error('Failed to submit leave request:', error);
            alert('Failed to submit leave request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card w-full max-w-md p-6 rounded-lg shadow-lg border border-border">
                <h2 className="text-xl font-semibold mb-4">Request Leave</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Select
                        label="Leave Type"
                        options={[
                            { value: 'sick', label: 'Sick Leave' },
                            { value: 'casual', label: 'Casual Leave' },
                            { value: 'annual', label: 'Annual Leave' },
                            { value: 'unpaid', label: 'Unpaid Leave' }
                        ]}
                        value={formData.type}
                        onChange={(val) => handleChange('type', val)}
                    />
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
                    <Input
                        label="Reason"
                        value={formData.reason}
                        onChange={(e) => handleChange('reason', e.target.value)}
                        required
                    />
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button variant="ghost" onClick={onClose} type="button">
                            Cancel
                        </Button>
                        <Button type="submit" loading={loading}>
                            Submit Request
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LeaveModal;
