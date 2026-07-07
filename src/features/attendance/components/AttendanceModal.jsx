import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';

const AttendanceModal = ({ isOpen, onClose, onSave, employees }) => {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const status = watch('status');

  useEffect(() => {
    if (isOpen) {
      reset({
        date: new Date().toISOString().split('T')[0],
        checkInTime: '09:00',
        checkOutTime: '17:00',
        status: 'present'
      });
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-sidebar/60 backdrop-blur-md p-4">
      <div className="bg-card w-full max-w-lg rounded-lg shadow-sm border border-border flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-50">
           <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Icon name="Calendar" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground tracking-tight leading-tight">Manual Entry</h2>
                <p className="text-[11px] font-semibold text-muted-foreground/70">Add attendance record manually</p>
              </div>
           </div>
          <button onClick={onClose} className="p-2 text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Employee</label>
            <select
              {...register('employeeId', { required: 'Employee is required' })}
              className="w-full px-4 py-2.5 bg-muted/60 border border-border text-sm font-semibold rounded-xl focus:ring-2 focus:ring-ring/20 focus:border-blue-400 outline-none transition-all cursor-pointer"
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employeeCode || emp.id})
                </option>
              ))}
            </select>
            {errors.employeeId && <span className="text-xs text-rose-500 font-bold ml-1">{errors.employeeId.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Record Date</label>
            <input
              type="date"
              {...register('date', { required: 'Date is required' })}
              className="w-full px-4 py-2.5 bg-muted/60 border border-border text-sm font-medium rounded-xl focus:ring-2 focus:ring-ring/20 focus:border-blue-400 outline-none transition-all"
            />
            {errors.date && <span className="text-xs text-rose-500 font-bold ml-1">{errors.date.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Time In</label>
              <input
                type="time"
                {...register('checkInTime', { required: status !== 'absent' ? 'Check-in time is required' : false })}
                className="w-full px-4 py-2.5 bg-muted/60 border border-border text-sm font-semibold rounded-xl focus:ring-2 focus:ring-ring/20 focus:border-blue-400 outline-none transition-all disabled:opacity-50"
                disabled={status === 'absent'}
              />
              {errors.checkInTime && <span className="text-xs text-rose-500 font-bold ml-1">{errors.checkInTime.message}</span>}
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Time Out</label>
              <input
                type="time"
                {...register('checkOutTime')}
                className="w-full px-4 py-2.5 bg-muted/60 border border-border text-sm font-semibold rounded-xl focus:ring-2 focus:ring-ring/20 focus:border-blue-400 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Status</label>
                <select
                  {...register('status')}
                  className="w-full px-4 py-2.5 bg-muted/60 border border-border text-sm font-semibold rounded-xl focus:ring-2 focus:ring-ring/20 focus:border-blue-400 outline-none transition-all cursor-pointer"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="half_day">Half Day</option>
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Location</label>
                <input
                  type="text"
                  {...register('location')}
                  placeholder="Office, Remote..."
                  className="w-full px-4 py-2.5 bg-muted/60 border border-border text-sm font-medium rounded-xl focus:ring-2 focus:ring-ring/20 focus:border-blue-400 outline-none transition-all"
                />
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Label / Tag</label>
            <input
              type="text"
              {...register('label')}
              placeholder="e.g. Late, Training, Site Visit..."
              className="w-full px-4 py-2.5 bg-muted/60 border border-border text-sm font-medium rounded-xl focus:ring-2 focus:ring-ring/20 focus:border-blue-400 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Internal Notes</label>
            <textarea
              {...register('notes')}
              rows="3"
              placeholder="Detailed reasons for manual entry..."
              className="w-full px-4 py-3 bg-muted/60 border border-border text-sm font-medium rounded-xl focus:ring-2 focus:ring-ring/20 focus:border-blue-400 outline-none transition-all resize-none"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-muted-foreground bg-card border border-border rounded-xl hover:bg-muted/60 transition-all "
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90 transition-all shadow-sm "
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceModal;