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
                        label: '',
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
                label: data.label,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-slate-50">
                    <div className="flex items-center space-x-5">
                       <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                          <Icon name="Calendar" size={28} />
                       </div>
                       <div>
                          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Daily Attendance</h2>
                          <p className="text-sm font-semibold text-slate-400 mt-0.5">
                              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                       </div>
                    </div>
                    <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                        <X size={24} />
                    </button>
                </div>

                {/* Content - Scrollable List */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/20">
                    <div className="space-y-6">
                        <div className="grid grid-cols-12 gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">
                            <div className="col-span-4 flex items-center space-x-2">
                                <span>Employee</span>
                            </div>
                            <div className="col-span-3">Attendance Status</div>
                            <div className="col-span-2">Time In</div>
                            <div className="col-span-1">Time Out</div>
                            <div className="col-span-2">Label</div>
                        </div>

                        <div className="space-y-3">
                            {employees.map(emp => {
                                const data = attendanceMap[emp.id] || {};
                                const isExisting = data.isExisting;

                                return (
                                    <div key={emp.id} className={`grid grid-cols-12 gap-6 items-center p-5 rounded-2xl border transition-all ${isExisting ? 'bg-slate-50/50 border-slate-100 opacity-60' : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md'}`}>

                                        {/* Employee Info */}
                                        <div className="col-span-4 flex items-center space-x-4">
                                            <EmployeeAvatar employee={{ employeeName: emp.name, ...emp }} size="md" />
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 tracking-tight">{emp.name}</div>
                                                <div className="text-[11px] font-medium text-slate-400">{emp.employeeCode || emp.id}</div>
                                            </div>
                                        </div>

                                        {/* Status Selection */}
                                        <div className="col-span-3">
                                            {isExisting ? (
                                                <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg w-fit">
                                                    <Icon name="Check" size={12} className="text-blue-600" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">{data.status}</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {['present', 'absent', 'late', 'leave'].map(status => (
                                                        <button
                                                            key={status}
                                                            onClick={() => handleStatusChange(emp.id, status)}
                                                            className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all border active:scale-95 ${data.status === status
                                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                                                                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                                                                }`}
                                                        >
                                                            {status}
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
                                                className="w-full px-4 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none disabled:opacity-30 transition-all cursor-pointer"
                                            />
                                        </div>

                                        {/* Time Out */}
                                        <div className="col-span-1">
                                            <input
                                                type="time"
                                                value={data.checkOutTime || ''}
                                                onChange={(e) => handleTimeChange(emp.id, 'checkOutTime', e.target.value)}
                                                disabled={isExisting || data.status === 'absent' || data.status === 'leave'}
                                                className="w-full px-4 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none disabled:opacity-30 transition-all cursor-pointer"
                                            />
                                        </div>

                                        {/* Label */}
                                        <div className="col-span-2">
                                            <input
                                                type="text"
                                                value={data.label || ''}
                                                onChange={(e) => handleTimeChange(emp.id, 'label', e.target.value)}
                                                placeholder="Label..."
                                                disabled={isExisting || data.status === 'absent' || data.status === 'leave'}
                                                className="w-full px-4 py-2 text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none disabled:opacity-30 transition-all"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-50 bg-white flex justify-end space-x-3 rounded-b-3xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-900 transition-all active:scale-95"
                    >
                        Discard Changes
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center active:scale-95 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                                Saving...
                            </div>
                        ) : (
                            <>
                                <Icon name="Save" size={18} className="mr-2" />
                                Save Records
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TakeAttendanceModal;
