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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] flex flex-col rounded-none shadow-[24px_24px_0px_rgba(15,23,42,0.1)] border-4 border-slate-900 animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-8 bg-slate-900 text-white border-b-4 border-slate-700">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                            <span className="w-8 h-px bg-slate-700"></span>
                            <span>ATTENDANCE_PROTOCOL: ENGAGE_DAILY</span>
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter">Take Daily Attendance</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 border-2 border-white/10 text-white hover:bg-white/10 hover:border-white transition-all active:translate-y-0.5">
                        <X size={24} strokeWidth={3} />
                    </button>
                </div>

                {/* Content - Scrollable List */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
                    <div className="space-y-6">
                        <div className="grid grid-cols-12 gap-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-6">
                            <div className="col-span-4 flex items-center space-x-2">
                                <span className="w-1.5 h-1.5 bg-slate-300"></span>
                                <span>Unit_Identity</span>
                            </div>
                            <div className="col-span-4">Status_Vector</div>
                            <div className="col-span-2">Time_In</div>
                            <div className="col-span-2">Time_Out</div>
                        </div>

                        <div className="space-y-3">
                            {employees.map(emp => {
                                const data = attendanceMap[emp.id] || {};
                                const isExisting = data.isExisting;

                                return (
                                    <div key={emp.id} className={`grid grid-cols-12 gap-6 items-center p-6 border-2 transition-all group ${isExisting ? 'bg-slate-100/50 border-slate-100 grayscale' : 'bg-white border-slate-200 hover:border-slate-900 shadow-sm hover:shadow-md'}`}>

                                        {/* Employee Info */}
                                        <div className="col-span-4 flex items-center space-x-4">
                                            <div className="w-10 h-10 border-2 border-slate-900 bg-slate-50 flex items-center justify-center text-slate-900 font-black text-xs">
                                                {emp.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900 uppercase tracking-tight">{emp.name}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 font-mono">{emp.employeeCode || emp.id}</div>
                                            </div>
                                        </div>

                                        {/* Status Selection */}
                                        <div className="col-span-4">
                                            {isExisting ? (
                                                <div className="flex items-center space-x-2 px-3 py-1.5 border-2 border-slate-200 bg-slate-100 w-fit">
                                                    <div className="w-2 h-2 bg-slate-400"></div>
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{data.status}</span>
                                                    <Check size={12} className="text-slate-400" />
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {['present', 'absent', 'late', 'leave'].map(status => (
                                                        <button
                                                            key={status}
                                                            onClick={() => handleStatusChange(emp.id, status)}
                                                            className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all border-2 active:translate-y-0.5 ${data.status === status
                                                                ? 'bg-slate-900 text-white border-slate-900 shadow-[4px_4px_0px_rgba(15,23,42,0.1)]'
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
                                                className="w-full px-3 py-2 text-xs font-black font-mono bg-white border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 disabled:opacity-30 disabled:border-slate-100 transition-colors"
                                            />
                                        </div>

                                        {/* Time Out */}
                                        <div className="col-span-2">
                                            <input
                                                type="time"
                                                value={data.checkOutTime || ''}
                                                onChange={(e) => handleTimeChange(emp.id, 'checkOutTime', e.target.value)}
                                                disabled={isExisting || data.status === 'absent' || data.status === 'leave'}
                                                className="w-full px-3 py-2 text-xs font-black font-mono bg-white border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 disabled:opacity-30 disabled:border-slate-100 transition-colors"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t-4 border-slate-100 bg-white flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 border-2 border-transparent hover:border-slate-900 transition-all"
                    >
                        Abort_Process
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-[8px_8px_0px_rgba(15,23,42,0.15)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center"
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin mr-3"></div>
                                Transmitting...
                            </div>
                        ) : (
                            <>
                                <Save size={16} className="mr-3" strokeWidth={3} />
                                Commit Attendance Records
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TakeAttendanceModal;
