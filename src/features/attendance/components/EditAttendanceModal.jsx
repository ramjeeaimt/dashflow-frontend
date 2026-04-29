import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import Icon from '../../../components/AppIcon';

const EditAttendanceModal = ({ isOpen, onClose, onSave, attendance }) => {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const status = watch('status');

  useEffect(() => {
    if (isOpen && attendance) {
      // Ensure times are in HH:mm format for the time input
      const formatForInput = (timeStr) => {
        if (!timeStr || timeStr === '--') return '';
        return timeStr.split(':').slice(0, 2).join(':');
      };

      reset({
        checkInTime: attendance.checkInTime !== '--' ? formatForInput(attendance.checkInTime) : '09:00',
        checkOutTime: attendance.checkOutTime !== '--' ? formatForInput(attendance.checkOutTime) : '17:00',
        status: attendance.status || 'present',
        notes: '' // Clear notes so they enter a fresh reason
      });
    }
  }, [isOpen, attendance, reset]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    onSave(attendance.id, data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-lg rounded-none shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-50">
           <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-50 rounded-none flex items-center justify-center text-amber-600">
                <Icon name="Edit" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">Edit Attendance</h2>
                <p className="text-[11px] font-semibold text-slate-400">Modifying record for {attendance.employeeName}</p>
              </div>
           </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-none transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Check In Time</label>
              <input
                type="time"
                step="60"
                {...register('checkInTime', { required: status !== 'absent' ? 'Check-in time is required' : false })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-sm font-semibold rounded-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all disabled:opacity-50"
                disabled={status === 'absent'}
              />
              {errors.checkInTime && <span className="text-xs text-rose-500 font-bold ml-1">{errors.checkInTime.message}</span>}
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Check Out Time</label>
              <input
                type="time"
                step="60"
                {...register('checkOutTime')}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-sm font-semibold rounded-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Attendance Status</label>
            <select
              {...register('status')}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-sm font-semibold rounded-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all cursor-pointer"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half_day">Half Day</option>
              <option value="wfh">WFH</option>
            </select>
          </div>

          {attendance.notes && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Previous Notes History</label>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-none max-h-32 overflow-y-auto space-y-2">
                {attendance.notes.split('|').map((note, i) => (
                  <div key={i} className={`text-[11px] ${note.includes('[Edited on') ? 'text-blue-600 font-medium' : 'text-slate-500'}`}>
                    {note.trim()}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-rose-500 uppercase tracking-widest ml-1 flex items-center gap-2">
               Reason for Change *
            </label>
            <textarea
              {...register('notes', { required: 'You must provide a reason for editing this record' })}
              rows="3"
              placeholder="Explain why you are changing these times..."
              className={`w-full px-4 py-3 bg-slate-50 border ${errors.notes ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-200 focus:ring-blue-100'} text-sm font-medium rounded-none outline-none transition-all resize-none`}
            ></textarea>
            {errors.notes && <span className="text-[10px] text-rose-500 font-bold ml-1">{errors.notes.message}</span>}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-none hover:bg-slate-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-none hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
            >
              Update Attendance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAttendanceModal;
