import React, { useState, useEffect } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import api from '../../../api/client';
import Icon from '../../../components/AppIcon';

const FieldGroup = ({ label, hint, children }) => (
  <div className="py-5 border-b border-border last:border-0">
    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
      <div className="sm:w-64 flex-shrink-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {hint && <p className="text-xs text-muted-foreground/70 mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  </div>
);

const NumberInput = ({ value, onChange, min = 0, max, unit, disabled }) => (
  <div className="flex items-center gap-2 w-full max-w-xs">
    <input
      type="number"
      min={min}
      max={max}
      value={value ?? ''}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
      className="w-24 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted/60 disabled:text-muted-foreground/70"
    />
    {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
  </div>
);

const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <div
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-border'}`}
    >
      <span className={`absolute top-1 left-1 w-4 h-4 bg-card rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </div>
    <span className="text-sm font-medium text-foreground">{label}</span>
  </label>
);

const AttendancePolicySettings = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    lateThresholdMinutes: 0,
    earlyCheckInBuffer: 60,
    checkInCutoffMinutes: 240,
    halfDayMinHours: 4,
    halfDayPayPercent: 50,
    enableLateEmailAlert: true,
    attendanceAlertEmails: '',
    casualLeavesPerYear: 12,
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  });

  const [newEmailInput, setNewEmailInput] = useState('');
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const activeCompanyId = user?.company?.id || user?.companyId;
      if (!activeCompanyId) return;
      try {
        setLoading(true);
        const res = await api.get(`/system-company/id/${activeCompanyId}`);
        const c = res.data?.data || res.data;
        if (c) {
          setForm({
            lateThresholdMinutes: c.lateThresholdMinutes ?? 0,
            earlyCheckInBuffer: c.earlyCheckInBuffer ?? 60,
            checkInCutoffMinutes: c.checkInCutoffMinutes ?? 240,
            halfDayMinHours: c.halfDayMinHours ?? 4,
            halfDayPayPercent: c.halfDayPayPercent ?? 50,
            enableLateEmailAlert: c.enableLateEmailAlert ?? true,
            attendanceAlertEmails: c.attendanceAlertEmails || '',
            casualLeavesPerYear: c.casualLeavesPerYear ?? 12,
            workingDays: c.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          });
        }
      } catch (e) {
        console.error('Failed to load attendance policy', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    const activeCompanyId = user?.company?.id || user?.companyId;
    if (!activeCompanyId) return;
    try {
      setSaving(true);
      setSaved(false);
      await api.patch(`/system-company/${activeCompanyId}`, form);
      
      const updatedUser = {
        ...user,
        company: {
          ...user.company,
          ...form,
        }
      };
      useAuthStore.setState({ user: updatedUser });
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Failed to save attendance policy', e);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const emailList = form.attendanceAlertEmails ? form.attendanceAlertEmails.split(',').map(e => e.trim()).filter(Boolean) : [];

  const handleAddEmail = async (e) => {
    e?.preventDefault();
    const email = newEmailInput.trim().toLowerCase();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (emailList.includes(email)) {
      alert('This email is already in the list.');
      return;
    }

    const updatedList = [...emailList, email];
    const newEmailsString = updatedList.join(', ');
    set('attendanceAlertEmails', newEmailsString);
    setNewEmailInput('');

    const activeCompanyId = user?.company?.id || user?.companyId;
    if (!activeCompanyId) return;
    try {
      await api.patch(`/system-company/${activeCompanyId}`, { attendanceAlertEmails: newEmailsString });
      const updatedUser = { ...user, company: { ...user.company, attendanceAlertEmails: newEmailsString } };
      useAuthStore.setState({ user: updatedUser });
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Failed to save email automatically', err);
    }
  };

  const handleRemoveEmail = async (emailToRemove) => {
    const updatedList = emailList.filter((e) => e !== emailToRemove);
    const newEmailsString = updatedList.join(', ');
    set('attendanceAlertEmails', newEmailsString);

    const activeCompanyId = user?.company?.id || user?.companyId;
    if (!activeCompanyId) return;
    try {
      await api.patch(`/system-company/${activeCompanyId}`, { attendanceAlertEmails: newEmailsString });
      const updatedUser = { ...user, company: { ...user.company, attendanceAlertEmails: newEmailsString } };
      useAuthStore.setState({ user: updatedUser });
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Failed to remove email automatically', err);
    }
  };

  if (loading) return <div className="p-8 text-sm text-muted-foreground/70">Loading policy settings…</div>;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page title */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-foreground">Attendance Policy</h3>
        <p className="text-sm text-muted-foreground mt-1">Configure rules for late marking, check-in windows, and half-day handling. These settings affect payroll calculations.</p>
      </div>

      {/* Late Marking */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Icon name="Clock" size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Late Marking</p>
            <p className="text-xs text-muted-foreground/70">When is an employee considered late?</p>
          </div>
        </div>
        <div className="px-6">
          <FieldGroup
            label="Grace Period"
            hint="Minutes after the shift start time before an employee is marked as late. Set to 0 for no grace period."
          >
            <NumberInput
              value={form.lateThresholdMinutes}
              onChange={(v) => set('lateThresholdMinutes', v)}
              min={0}
              max={120}
              unit="minutes after shift start"
            />
          </FieldGroup>
          <FieldGroup
            label="Late Warning Email"
            hint="Automatically send a warning email to the employee when they check in late."
          >
            <Toggle
              checked={form.enableLateEmailAlert}
              onChange={(v) => set('enableLateEmailAlert', v)}
              label={form.enableLateEmailAlert ? 'Enabled — late arrivals receive an email warning' : 'Disabled'}
            />
          </FieldGroup>

          <FieldGroup
            label="Admin Alert Emails"
            hint="Administrators who will receive notifications for check-ins, check-outs, and late arrivals."
          >
            <div className="space-y-4 max-w-lg">
              <form onSubmit={handleAddEmail} className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground/70 pointer-events-none">
                    <Icon name="Mail" size={14} />
                  </span>
                  <input
                    type="text"
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    placeholder="Enter email to add..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring placeholder-slate-400 text-foreground"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sidebar text-white text-sm font-semibold rounded-lg hover:bg-sidebar transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Icon name="Plus" size={14} />
                  <span>Add</span>
                </button>
              </form>

              {emailList.length > 0 ? (
                <div className="flex flex-wrap gap-2 bg-muted/60 p-3 rounded-lg border border-border min-h-[46px] items-center">
                  {emailList.map((email) => (
                    <div
                      key={email}
                      className="flex items-center space-x-1.5 px-2.5 py-1 bg-card border border-border rounded-md text-xs font-semibold text-foreground hover:border-border transition-all group/chip shadow-sm"
                    >
                      <Icon name="Mail" size={12} className="text-muted-foreground/70" />
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(email)}
                        className="w-4 h-4 rounded flex items-center justify-center hover:bg-rose-50 text-muted-foreground/70 hover:text-rose-500 transition-all"
                        title={`Remove ${email}`}
                      >
                        <Icon name="X" size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 border border-dashed border-border rounded-lg bg-muted/60">
                  <p className="text-xs font-medium text-muted-foreground/70">No admin emails added yet.</p>
                </div>
              )}
            </div>
          </FieldGroup>
        </div>
      </div>

      {/* Work Schedule */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="Calendar" size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Work Schedule</p>
              <p className="text-xs text-muted-foreground/70">Define the standard operating days for your company</p>
            </div>
          </div>
          {!isEditingSchedule && (
            <button
              type="button"
              onClick={() => setIsEditingSchedule(true)}
              className="text-sm font-medium flex items-center gap-1.5 text-primary hover:text-primary transition-colors"
            >
              <Icon name="Edit2" size={16} />
              Edit Schedule
            </button>
          )}
        </div>
        <div className="px-6">
          <FieldGroup
            label="Working Days"
            hint="Select the days your company operates. This affects attendance tracking and payroll calculations."
          >
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'monday', label: 'Monday' },
                { id: 'tuesday', label: 'Tuesday' },
                { id: 'wednesday', label: 'Wednesday' },
                { id: 'thursday', label: 'Thursday' },
                { id: 'friday', label: 'Friday' },
                { id: 'saturday', label: 'Saturday' },
                { id: 'sunday', label: 'Sunday' }
              ].map(day => {
                const isSelected = (form.workingDays || []).includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    disabled={!isEditingSchedule}
                    onClick={() => {
                      if (!isEditingSchedule) return;
                      const currentDays = form.workingDays || [];
                      if (currentDays.includes(day.id)) {
                        set('workingDays', currentDays.filter(d => d !== day.id));
                      } else {
                        set('workingDays', [...currentDays, day.id]);
                      }
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
 isSelected
 ? 'bg-primary/10 border-border text-primary shadow-sm'
 : 'bg-card border-border text-muted-foreground hover:border-border hover:bg-muted/60'
 } ${!isEditingSchedule ? 'opacity-80 cursor-default hover:bg-card hover:border-border' : ''}`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
            {isEditingSchedule && (!form.workingDays || form.workingDays.length === 0) && (
              <p className="text-xs text-rose-500 mt-2">Please select at least one working day.</p>
            )}
            
            {isEditingSchedule && (
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    await handleSave();
                    setIsEditingSchedule(false);
                  }}
                  disabled={saving}
                  className="px-5 py-2 bg-sidebar text-white text-sm font-semibold rounded-lg hover:bg-sidebar transition-all shadow-sm flex items-center gap-2 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Update Schedule'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingSchedule(false)}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            )}
          </FieldGroup>
        </div>
      </div>

      {/* Check-in Window */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="LogIn" size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Check-in Window</p>
            <p className="text-xs text-muted-foreground/70">Control when employees are allowed to check in</p>
          </div>
        </div>
        <div className="px-6">
          <FieldGroup
            label="Earliest Check-in"
            hint="How many minutes before the shift start time employees are allowed to check in."
          >
            <NumberInput
              value={form.earlyCheckInBuffer}
              onChange={(v) => set('earlyCheckInBuffer', v)}
              min={0}
              max={240}
              unit="minutes before shift start"
            />
          </FieldGroup>
          <FieldGroup
            label="Check-in Cutoff"
            hint="Block check-ins after this many minutes past the shift start. Set to 0 to allow check-in any time."
          >
            <NumberInput
              value={form.checkInCutoffMinutes}
              onChange={(v) => set('checkInCutoffMinutes', v)}
              min={0}
              max={480}
              unit="minutes after shift start (0 = no cutoff)"
            />
          </FieldGroup>
        </div>
      </div>

      {/* Half-Day Policy */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="SunHalf" size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Half-Day Policy</p>
            <p className="text-xs text-muted-foreground/70">Defines what counts as a half-day and its payroll impact</p>
          </div>
        </div>
        <div className="px-6">
          <FieldGroup
            label="Half-Day Minimum Hours"
            hint="Employees who work at least this many hours are eligible to be marked as a half-day (instead of absent)."
          >
            <NumberInput
              value={form.halfDayMinHours}
              onChange={(v) => set('halfDayMinHours', v)}
              min={1}
              max={12}
              unit="hours"
            />
          </FieldGroup>
          <FieldGroup
            label="Half-Day Pay Percentage"
            hint="Percentage of the daily salary paid for a half-day. This affects payroll calculations."
          >
            <NumberInput
              value={form.halfDayPayPercent}
              onChange={(v) => set('halfDayPayPercent', v)}
              min={1}
              max={100}
              unit="% of daily salary"
            />
          </FieldGroup>
        </div>
      </div>

      {/* Leave Policy */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Icon name="Calendar" size={16} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Leave Policy</p>
            <p className="text-xs text-muted-foreground/70">Configure leave allowances</p>
          </div>
        </div>
        <div className="px-6">
          <FieldGroup
            label="Casual Leaves per Year"
            hint="The total number of paid casual leaves an employee receives per year."
          >
            <NumberInput
              value={form.casualLeavesPerYear}
              onChange={(v) => set('casualLeavesPerYear', v)}
              min={0}
              max={365}
              unit="days/year"
            />
          </FieldGroup>
        </div>
      </div>

      {/* Preview Box */}
      <div className="bg-muted/60 border border-border rounded-xl p-5 mb-8 text-xs text-muted-foreground space-y-1.5">
        <p className="font-semibold text-foreground mb-2 text-sm">Policy Preview</p>
        <p>• Company operates on <strong>{form.workingDays?.length || 0} days</strong> a week.</p>
        <p>• Employees can check in from <strong>{form.earlyCheckInBuffer} min before</strong> shift start.</p>
        <p>• Check-ins {form.checkInCutoffMinutes > 0 ? <>are blocked after <strong>{form.checkInCutoffMinutes} min</strong> past shift start.</> : <>have <strong>no time cutoff</strong>.</>}</p>
        <p>• An employee is marked <strong>Late</strong> if they check in more than <strong>{form.lateThresholdMinutes} min</strong> after shift start.</p>
        <p>• Working <strong>{form.halfDayMinHours}+ hours</strong> qualifies as a half-day, paid at <strong>{form.halfDayPayPercent}%</strong> of daily rate.</p>
        <p>• Employees receive <strong>{form.casualLeavesPerYear} casual leaves</strong> per year.</p>
        <p>• Late arrival email warnings are <strong>{form.enableLateEmailAlert ? 'enabled' : 'disabled'}</strong>.</p>
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
            <Icon name="CheckCircle" size={16} />
            Saved successfully
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-60"
        >
          <Icon name="Save" size={16} />
          {saving ? 'Saving…' : 'Save Policy'}
        </button>
      </div>
    </div>
  );
};

export default AttendancePolicySettings;
