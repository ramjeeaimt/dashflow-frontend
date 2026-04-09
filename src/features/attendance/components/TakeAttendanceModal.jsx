import React, { useState, useEffect } from 'react';
import { X, Save, Check, Clock } from 'lucide-react';

const TakeAttendanceModal = ({ isOpen, onClose, onSave, employees, existingAttendance }) => {
    const [attendanceMap, setAttendanceMap] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && employees.length > 0) {
            const initialMap = {};
            employees.forEach(emp => {
                // Check if employee already has attendance for today
                const existing = existingAttendance.find(
                    record => record.employeeId === emp.id &&
                        new Date(record.date).toDateString() === new Date().toDateString()
                );

                if (existing) {
                    initialMap[emp.id] = {
                        status: existing.status,
                        checkInTime: existing.checkInTime,
                        checkOutTime: existing.checkOutTime,
                        isExisting: true
                    };
                } else {
                    initialMap[emp.id] = {
                        status: 'present', // Default to present
                        checkInTime: '09:00',
                        checkOutTime: '',
                        isExisting: false
                    };
                }
            });
            setAttendanceMap(initialMap);
        }
    }, [isOpen, employees, existingAttendance]);

    if (!isOpen) return null;

    const handleStatusChange = (employeeId, status) => {
        setAttendanceMap(prev => ({
            ...prev,
            [employeeId]: { ...prev[employeeId], status }
        }));
    };

    const handleTimeChange = (employeeId, field, value) => {
        setAttendanceMap(prev => ({
            ...prev,
            [employeeId]: { ...prev[employeeId], [field]: value }
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        const recordsToSave = Object.entries(attendanceMap)
            .filter(([_, data]) => !data.isExisting) // Only save new records
            .map(([employeeId, data]) => ({
                employeeId,
                status: data.status,
                checkInTime: data.checkInTime,
                checkOutTime: data.checkOutTime,
                date: new Date().toISOString().split('T')[0]
            }));

        if (recordsToSave.length === 0) {
            alert('No new records to save.');
            setLoading(false);
            onClose();
            return;
        }

        await onSave(recordsToSave);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full max-w-4xl max-h-[90vh] flex flex-col rounded-lg shadow-lg border border-border animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Take Daily Attendance</h2>
                        <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X size={20} />
                    </button>
                </div>

                {/* Content - Scrollable List */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground mb-2 px-4">
                            <div className="col-span-4">Employee</div>
                            <div className="col-span-4">Status</div>
                            <div className="col-span-2">Time In</div>
                            <div className="col-span-2">Time Out</div>
                        </div>

                        {employees.map(emp => {
                            const data = attendanceMap[emp.id] || {};
                            const isExisting = data.isExisting;

                            return (
                                <div key={emp.id} className={`grid grid-cols-12 gap-4 items-center p-4 rounded-lg border ${isExisting ? 'bg-muted/50 border-transparent' : 'bg-card border-border'}`}>

                                    {/* Employee Info */}
                                    <div className="col-span-4 flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-foreground">{emp.name}</div>
                                            <div className="text-xs text-muted-foreground">{emp.employeeCode || emp.id}</div>
                                        </div>
                                    </div>

                                    {/* Status Selection */}
                                    <div className="col-span-4">
                                        {isExisting ? (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${data.status === 'present' ? 'bg-green-100 text-green-800' :
                                                    data.status === 'absent' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {data.status}
                                            </span>
                                        ) : (
                                            <div className="flex space-x-2">
                                                {['present', 'absent', 'late', 'early_checkin', 'leave'].map(status => (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleStatusChange(emp.id, status)}
                                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${data.status === status
                                                            ? 'bg-primary text-primary-foreground border-primary'
                                                            : 'bg-background text-muted-foreground border-border hover:bg-muted'
                                                            }`}
                                                    >
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Time In */}
                                    <div className="col-span-2">
                                        <input
                                            type="time"
                                            value={data.checkInTime || ''}
                                            onChange={(e) => handleTimeChange(emp.id, 'checkInTime', e.target.value)}
                                            disabled={isExisting || data.status === 'absent' || data.status === 'leave'}
                                            className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                                        />
                                    </div>

                                    {/* Time Out */}
                                    <div className="col-span-2">
                                        <input
                                            type="time"
                                            value={data.checkOutTime || ''}
                                            onChange={(e) => handleTimeChange(emp.id, 'checkOutTime', e.target.value)}
                                            disabled={isExisting || data.status === 'absent' || data.status === 'leave'}
                                            className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-muted/10 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-md"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md flex items-center"
                    >
                        {loading ? (
                            <>Saving...</>
                        ) : (
                            <>
                                <Save size={16} className="mr-2" />
                                Save Attendance
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TakeAttendanceModal;
