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
    saturdayRule: 'second_saturday_half_day',
    holidays: [],
  });

  const [newEmailInput, setNewEmailInput] = useState('');
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayInput, setHolidayInput] = useState({
    name: '',
    date: '',
    type: 'full',
    description: '',
  });

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
            saturdayRule: c.saturdayRule || 'second_saturday_half_day',
            holidays: Array.isArray(c.holidays) ? c.holidays : [],
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

  const handleAddHoliday = async (e) => {
    e?.preventDefault();
    if (!holidayInput.name.trim() || !holidayInput.date) {
      alert('Please enter a holiday name and select a date.');
      return;
    }
    const newHoliday = {
      id: Date.now().toString(),
      name: holidayInput.name.trim(),
      date: holidayInput.date,
      type: holidayInput.type || 'full',
      description: holidayInput.description?.trim() || '',
    };
    const updated = [...(form.holidays || []), newHoliday].sort((a, b) => (a.date > b.date ? 1 : -1));
    set('holidays', updated);
    setHolidayInput({ name: '', date: '', type: 'full', description: '' });
    setShowHolidayModal(false);

    const activeCompanyId = user?.company?.id || user?.companyId;
    if (activeCompanyId) {
      try {
        await api.patch(`/system-company/${activeCompanyId}`, { holidays: updated });
        const updatedUser = { ...user, company: { ...user.company, holidays: updated } };
        useAuthStore.setState({ user: updatedUser });
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (err) {
        console.error('Failed to auto-save holiday', err);
      }
    }
  };

  const handleDeleteHoliday = async (holidayId) => {
    const updated = (form.holidays || []).filter((h) => (h.id || h.date) !== holidayId);
    set('holidays', updated);
    const activeCompanyId = user?.company?.id || user?.companyId;
    if (activeCompanyId) {
      try {
        await api.patch(`/system-company/${activeCompanyId}`, { holidays: updated });
        const updatedUser = { ...user, company: { ...user.company, holidays: updated } };
        useAuthStore.setState({ user: updatedUser });
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (err) {
        console.error('Failed to auto-save holiday deletion', err);
      }
    }
  };

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

      {/* Saturday & Weekend Policy */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Icon name="CalendarCheck" size={16} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Saturday Office Policy</p>
              <p className="text-xs text-muted-foreground/70">Configure recurring Saturday working schedules and office half-days</p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            {form.saturdayRule === 'second_saturday_half_day' ? '2nd Sat Half-Day Active' : 'Custom Saturday Rule'}
          </span>
        </div>
        <div className="p-6 space-y-3">
          {[
            {
              id: 'second_saturday_half_day',
              label: '2nd Saturday Half Day',
              badge: 'Recommended Office Policy',
              desc: 'Every 2nd Saturday of the month is treated as an official half day for the entire office. Attendance calendar highlights it automatically, and payroll generates full credit without missing day deductions.',
            },
            {
              id: 'second_fourth_saturday_off',
              label: '2nd & 4th Saturday Off',
              desc: '2nd and 4th Saturdays of each month are weekly off holidays. 1st, 3rd, and 5th Saturdays are regular working days.',
            },
            {
              id: 'second_saturday_off',
              label: '2nd Saturday Off',
              desc: 'Only the 2nd Saturday of each month is a full holiday off. Remaining Saturdays are standard working days.',
            },
            {
              id: 'all_half_day',
              label: 'All Saturdays Half Day',
              desc: 'All Saturdays throughout the month are designated as half working days.',
            },
            {
              id: 'all_working',
              label: 'All Saturdays Full Working Day',
              desc: 'Standard 6-day work week: every Saturday is treated as a full working day.',
            },
            {
              id: 'all_off',
              label: 'All Saturdays Off (5-Day Work Week)',
              desc: 'Standard 5-day work week: every Saturday is a non-working weekend holiday.',
            },
          ].map((rule) => {
            const isSelected = (form.saturdayRule || 'second_saturday_half_day') === rule.id;
            return (
              <div
                key={rule.id}
                onClick={() => set('saturdayRule', rule.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'border-primary bg-primary/[0.03] shadow-sm ring-1 ring-primary/30'
                    : 'border-border bg-card hover:bg-muted/40 hover:border-border'
                }`}
              >
                <input
                  type="radio"
                  name="saturdayRule"
                  checked={isSelected}
                  onChange={() => set('saturdayRule', rule.id)}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-border cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{rule.label}</span>
                    {rule.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {rule.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{rule.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Company Holidays & Festivals Manager */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Icon name="Sparkles" size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Company Holidays & Festivals</p>
              <p className="text-xs text-muted-foreground/70">Declare paid national holidays, festivals, and company off-days for accurate payslips</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowHolidayModal(true)}
            className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Icon name="Plus" size={14} />
            <span>Add Holiday</span>
          </button>
        </div>

        <div className="p-6">
          {(!form.holidays || form.holidays.length === 0) ? (
            <div className="text-center py-8 border border-dashed border-border rounded-xl bg-muted/30">
              <Icon name="Calendar" size={32} className="mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm font-semibold text-foreground">No declared holidays yet</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                Add festivals like Diwali, Eid, Christmas, or national holidays so employees receive paid holiday credit in payroll.
              </p>
              <button
                type="button"
                onClick={() => setShowHolidayModal(true)}
                className="mt-4 px-4 py-1.5 bg-card border border-border text-foreground hover:bg-muted/60 text-xs font-semibold rounded-lg transition-all"
              >
                + Add First Holiday
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground pb-2">
                <span>{form.holidays.length} Declared Holiday{form.holidays.length > 1 ? 's' : ''}</span>
                <span className="text-[11px] text-muted-foreground/70">Recognized as paid time-off in payroll</span>
              </div>
              <div className="divide-y divide-border/60 border border-border rounded-xl overflow-hidden bg-card">
                {form.holidays.map((h, idx) => {
                  const holidayDate = new Date(h.date);
                  const isValidDate = !isNaN(holidayDate.getTime());
                  const dateStr = isValidDate
                    ? holidayDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    : h.date;

                  return (
                    <div key={h.id || idx} className="p-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center text-amber-700">
                          <span className="text-[10px] font-bold uppercase leading-none">
                            {isValidDate ? holidayDate.toLocaleDateString('en-GB', { month: 'short' }) : 'DATE'}
                          </span>
                          <span className="text-base font-extrabold leading-none mt-0.5">
                            {isValidDate ? holidayDate.getDate() : '--'}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">{h.name}</span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              h.type === 'half'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}>
                              {h.type === 'half' ? 'Half-Day Festival' : 'Full Day Paid Holiday'}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {dateStr} {h.description ? `• ${h.description}` : ''}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteHoliday(h.id || h.date)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="Delete holiday"
                      >
                        <Icon name="Trash2" size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
        <p>• Saturday policy: <strong>
          {form.saturdayRule === 'second_saturday_half_day' && '2nd Saturday Half Day (Office Policy)'}
          {form.saturdayRule === 'second_fourth_saturday_off' && '2nd & 4th Saturday Off'}
          {form.saturdayRule === 'second_saturday_off' && '2nd Saturday Off'}
          {form.saturdayRule === 'all_half_day' && 'All Saturdays Half Day'}
          {form.saturdayRule === 'all_working' && 'All Saturdays Full Day'}
          {form.saturdayRule === 'all_off' && 'All Saturdays Off (5-Day Week)'}
          {!form.saturdayRule && '2nd Saturday Half Day (Office Policy)'}
        </strong>.</p>
        <p>• Declared holidays: <strong>{form.holidays?.length || 0} paid festival/company holiday(s)</strong> configured.</p>
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

      {/* Add Holiday Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <Icon name="Sparkles" size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Add Company Holiday / Festival</h4>
                  <p className="text-xs text-muted-foreground">Sets a paid holiday date for the entire office</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHolidayModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted"
              >
                <Icon name="X" size={16} />
              </button>
            </div>

            <form onSubmit={handleAddHoliday} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Holiday / Festival Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diwali, Eid al-Fitr, Independence Day"
                  value={holidayInput.name}
                  onChange={(e) => setHolidayInput({ ...holidayInput, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring placeholder-slate-400 bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  value={holidayInput.date}
                  onChange={(e) => setHolidayInput({ ...holidayInput, date: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Holiday Duration Type</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <label className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 text-xs font-semibold transition-all ${
                    holidayInput.type === 'full' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground'
                  }`}>
                    <input
                      type="radio"
                      name="holidayType"
                      checked={holidayInput.type === 'full'}
                      onChange={() => setHolidayInput({ ...holidayInput, type: 'full' })}
                      className="text-primary focus:ring-primary"
                    />
                    <span>Full Day (Paid)</span>
                  </label>
                  <label className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 text-xs font-semibold transition-all ${
                    holidayInput.type === 'half' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground'
                  }`}>
                    <input
                      type="radio"
                      name="holidayType"
                      checked={holidayInput.type === 'half'}
                      onChange={() => setHolidayInput({ ...holidayInput, type: 'half' })}
                      className="text-primary focus:ring-primary"
                    />
                    <span>Half Day Festival</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Description / Remarks (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Office closed for festival celebration"
                  value={holidayInput.description}
                  onChange={(e) => setHolidayInput({ ...holidayInput, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring placeholder-slate-400 bg-background text-foreground"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border mt-5">
                <button
                  type="button"
                  onClick={() => setShowHolidayModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Icon name="Plus" size={14} />
                  <span>Save Holiday</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePolicySettings;
