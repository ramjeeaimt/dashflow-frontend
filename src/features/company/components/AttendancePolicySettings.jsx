import React, { useState, useEffect } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import api from '../../../api/client';
import Icon from '../../../components/AppIcon';

const FieldGroup = ({ label, hint, children }) => (
  <div className="py-5 border-b border-slate-100 last:border-0">
    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
      <div className="sm:w-64 flex-shrink-0">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {hint && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{hint}</p>}
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
      className="w-24 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
    />
    {unit && <span className="text-sm text-slate-500">{unit}</span>}
  </div>
);

const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <div
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </div>
    <span className="text-sm font-medium text-slate-700">{label}</span>
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
  });

  useEffect(() => {
    const fetch = async () => {
      if (!user?.company?.id) return;
      try {
        setLoading(true);
        const res = await api.get(`/system-company/id/${user.company.id}`);
        const c = res.data?.data || res.data;
        if (c) {
          setForm({
            lateThresholdMinutes: c.lateThresholdMinutes ?? 0,
            earlyCheckInBuffer: c.earlyCheckInBuffer ?? 60,
            checkInCutoffMinutes: c.checkInCutoffMinutes ?? 240,
            halfDayMinHours: c.halfDayMinHours ?? 4,
            halfDayPayPercent: c.halfDayPayPercent ?? 50,
            enableLateEmailAlert: c.enableLateEmailAlert ?? true,
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
    if (!user?.company?.id) return;
    try {
      setSaving(true);
      setSaved(false);
      await api.patch(`/system-company/${user.company.id}`, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Failed to save attendance policy', e);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-sm text-slate-400">Loading policy settings…</div>;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page title */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-900">Attendance Policy</h3>
        <p className="text-sm text-slate-500 mt-1">Configure rules for late marking, check-in windows, and half-day handling. These settings affect payroll calculations.</p>
      </div>

      {/* Late Marking */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Icon name="Clock" size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Late Marking</p>
            <p className="text-xs text-slate-400">When is an employee considered late?</p>
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
        </div>
      </div>

      {/* Check-in Window */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Icon name="LogIn" size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Check-in Window</p>
            <p className="text-xs text-slate-400">Control when employees are allowed to check in</p>
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
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
            <Icon name="SunHalf" size={16} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Half-Day Policy</p>
            <p className="text-xs text-slate-400">Defines what counts as a half-day and its payroll impact</p>
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

      {/* Preview Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8 text-xs text-slate-500 space-y-1.5">
        <p className="font-semibold text-slate-700 mb-2 text-sm">Policy Preview</p>
        <p>• Employees can check in from <strong>{form.earlyCheckInBuffer} min before</strong> shift start.</p>
        <p>• Check-ins {form.checkInCutoffMinutes > 0 ? <>are blocked after <strong>{form.checkInCutoffMinutes} min</strong> past shift start.</> : <>have <strong>no time cutoff</strong>.</>}</p>
        <p>• An employee is marked <strong>Late</strong> if they check in more than <strong>{form.lateThresholdMinutes} min</strong> after shift start.</p>
        <p>• Working <strong>{form.halfDayMinHours}+ hours</strong> qualifies as a half-day, paid at <strong>{form.halfDayPayPercent}%</strong> of daily rate.</p>
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
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-60"
        >
          <Icon name="Save" size={16} />
          {saving ? 'Saving…' : 'Save Policy'}
        </button>
      </div>
    </div>
  );
};

export default AttendancePolicySettings;
