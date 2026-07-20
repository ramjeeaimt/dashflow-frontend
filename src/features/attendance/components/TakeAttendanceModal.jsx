import React, { useState, useEffect } from 'react';
import { X, Save, Check } from 'lucide-react';
import Icon from '../../../components/AppIcon';

const todayStr = () => new Date().toISOString().split('T')[0];

// Small inline avatar (the shared one is defined privately in table components)
const Avatar = ({ name }) => {
  const initials = (name || '?')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
      {initials}
    </div>
  );
};

const TakeAttendanceModal = ({ isOpen, onClose, onSave, employees, existingAttendance }) => {
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(false);
  // Admins may record attendance for a past day (e.g. a missed check-in).
  const [selectedDate, setSelectedDate] = useState(todayStr());

  useEffect(() => {
    if (isOpen && employees.length > 0) {
      const initialMap = {};
      employees.forEach((emp) => {
        const existing = existingAttendance.find(
          (record) =>
            record.employeeId === emp.id &&
            new Date(record.date).toISOString().split('T')[0] === selectedDate,
        );

        if (existing) {
          initialMap[emp.id] = {
            status: existing.status,
            checkInTime: existing.checkInTime,
            checkOutTime: existing.checkOutTime,
            isExisting: true,
          };
        } else {
          initialMap[emp.id] = {
            status: 'present',
            checkInTime: '09:00',
            checkOutTime: '',
            label: '',
            isExisting: false,
          };
        }
      });
      setAttendanceMap(initialMap);
    }
  }, [isOpen, employees, existingAttendance, selectedDate]);

  if (!isOpen) return null;

  const isPast = selectedDate < todayStr();

  const handleStatusChange = (employeeId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [employeeId]: { ...prev[employeeId], status },
    }));
  };

  const handleTimeChange = (employeeId, field, value) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [employeeId]: { ...prev[employeeId], [field]: value },
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const recordsToSave = Object.entries(attendanceMap)
      .filter(([_, data]) => !data.isExisting)
      .map(([employeeId, data]) => ({
        employeeId,
        status: data.status,
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        label: data.label,
        date: selectedDate,
        // A back-dated entry carries an audit note automatically
        ...(isPast ? { notes: `Back-dated entry for ${selectedDate} added by admin` } : {}),
      }));

    if (recordsToSave.length === 0) {
      alert('No new records to save for this date.');
      setLoading(false);
      onClose();
      return;
    }

    await onSave(recordsToSave);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-sidebar/60 backdrop-blur-md p-4">
      <div className="bg-card w-full max-w-5xl max-h-[90vh] flex flex-col rounded-lg modal-shadow border border-border animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <Icon name="Calendar" size={22} />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground tracking-tight">Record attendance</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
                {isPast && <span className="ml-2 text-warning font-medium">· back-dated</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              Date
              <input
                type="date"
                value={selectedDate}
                max={todayStr()}
                onChange={(e) => setSelectedDate(e.target.value || todayStr())}
                className="px-3 py-1.5 bg-muted/60 border border-border rounded-md text-sm text-foreground outline-none focus:border-ring transition-colors"
              />
            </label>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted/20">
          <div className="hidden sm:grid grid-cols-12 gap-4 text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-3 px-4">
            <div className="col-span-4">Employee</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-2">Time in</div>
            <div className="col-span-1">Out</div>
            <div className="col-span-2">Label</div>
          </div>

          <div className="space-y-2">
            {employees.map((emp) => {
              const data = attendanceMap[emp.id] || {};
              const isExisting = data.isExisting;
              const disabled = isExisting || data.status === 'absent' || data.status === 'leave';

              return (
                <div
                  key={emp.id}
                  className={`grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 sm:items-center p-4 rounded-lg border transition-colors ${
                    isExisting ? 'bg-muted/50 border-border opacity-70' : 'bg-card border-border hover:border-muted-foreground/40'
                  }`}
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <Avatar name={emp.name} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{emp.name}</div>
                      <div className="text-[11px] text-muted-foreground">{emp.employeeCode || emp.id}</div>
                    </div>
                  </div>

                  <div className="col-span-3">
                    {isExisting ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted text-muted-foreground rounded-md w-fit">
                        <Check size={12} className="text-primary" />
                        <span className="text-[10px] font-medium uppercase tracking-wide">{data.status}</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {['present', 'absent', 'late', 'leave'].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(emp.id, status)}
                            className={`px-2 py-1 text-[10px] font-medium uppercase tracking-wide rounded-md transition-colors border ${
                              data.status === status
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-card text-muted-foreground border-border hover:border-muted-foreground/40'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="col-span-2">
                    <input
                      type="time"
                      value={data.checkInTime || ''}
                      onChange={(e) => handleTimeChange(emp.id, 'checkInTime', e.target.value)}
                      disabled={disabled}
                      className="w-full px-3 py-1.5 text-xs bg-muted/60 border border-border rounded-md text-foreground outline-none focus:border-ring disabled:opacity-40 transition-colors"
                    />
                  </div>

                  <div className="col-span-1">
                    <input
                      type="time"
                      value={data.checkOutTime || ''}
                      onChange={(e) => handleTimeChange(emp.id, 'checkOutTime', e.target.value)}
                      disabled={disabled}
                      className="w-full px-3 py-1.5 text-xs bg-muted/60 border border-border rounded-md text-foreground outline-none focus:border-ring disabled:opacity-40 transition-colors"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="text"
                      value={data.label || ''}
                      onChange={(e) => handleTimeChange(emp.id, 'label', e.target.value)}
                      placeholder="Label…"
                      disabled={disabled}
                      className="w-full px-3 py-1.5 text-xs bg-muted/60 border border-border rounded-md text-foreground outline-none focus:border-ring disabled:opacity-40 transition-colors"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border bg-card flex justify-end gap-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save size={16} />
                Save records
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TakeAttendanceModal;
