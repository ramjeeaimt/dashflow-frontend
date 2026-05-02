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

const NumberInput = ({ value, onChange, min = 0, unit, disabled }) => (
  <div className="flex items-center gap-2 w-full max-w-xs">
    <input
      type="number"
      min={min}
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

const RewardSystemSettings = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    enableRewardSystem: false,
    rewardPointsPerDay: 10,
    rewardPointsLateDeduction: 5,
    rewardRedemptionThreshold: 100,
    rewardDescription: '',
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
            enableRewardSystem: c.enableRewardSystem ?? false,
            rewardPointsPerDay: c.rewardPointsPerDay ?? 10,
            rewardPointsLateDeduction: c.rewardPointsLateDeduction ?? 5,
            rewardRedemptionThreshold: c.rewardRedemptionThreshold ?? 100,
            rewardDescription: c.rewardDescription ?? '',
          });
        }
      } catch (e) {
        console.error('Failed to load reward settings', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!user?.company?.id) return;
    if (form.rewardPointsLateDeduction > form.rewardPointsPerDay) {
      alert('Late deduction points cannot exceed points earned per day.');
      return;
    }
    try {
      setSaving(true);
      setSaved(false);
      await api.patch(`/system-company/${user.company.id}`, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Failed to save reward settings', e);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-sm text-slate-400">Loading reward settings…</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-900">Employee Reward System</h3>
        <p className="text-sm text-slate-500 mt-1">Motivate employees with a points-based reward system. Employees earn points for on-time attendance and lose points for late arrivals.</p>
      </div>

      {/* Master Toggle */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
              <Icon name="Star" size={20} className="text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Enable Reward System</p>
              <p className="text-xs text-slate-400 mt-0.5">Turn the employee reward system on or off for this company</p>
            </div>
          </div>
          <Toggle
            checked={form.enableRewardSystem}
            onChange={(v) => set('enableRewardSystem', v)}
            label=""
          />
        </div>
      </div>

      {/* Points Configuration */}
      <div className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6 transition-opacity ${!form.enableRewardSystem ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Icon name="TrendingUp" size={16} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Points Configuration</p>
            <p className="text-xs text-slate-400">Set how points are earned and deducted</p>
          </div>
        </div>
        <div className="px-6">
          <FieldGroup
            label="Points Per On-Time Day"
            hint="Points awarded to an employee for each day they check in on time or early."
          >
            <NumberInput
              value={form.rewardPointsPerDay}
              onChange={(v) => set('rewardPointsPerDay', v)}
              min={1}
              unit="points / day"
              disabled={!form.enableRewardSystem}
            />
          </FieldGroup>
          <FieldGroup
            label="Points Deducted (Late)"
            hint="Points deducted from an employee's balance for each late check-in. Must be ≤ points earned per day."
          >
            <div>
              <NumberInput
                value={form.rewardPointsLateDeduction}
                onChange={(v) => set('rewardPointsLateDeduction', v)}
                min={0}
                unit="points deducted"
                disabled={!form.enableRewardSystem}
              />
              {form.rewardPointsLateDeduction > form.rewardPointsPerDay && (
                <p className="text-xs text-red-500 mt-1.5">⚠️ Deduction cannot exceed points earned per day ({form.rewardPointsPerDay}).</p>
              )}
            </div>
          </FieldGroup>
          <FieldGroup
            label="Redemption Threshold"
            hint="Total points an employee must accumulate to claim a reward."
          >
            <NumberInput
              value={form.rewardRedemptionThreshold}
              onChange={(v) => set('rewardRedemptionThreshold', v)}
              min={1}
              unit="points to redeem"
              disabled={!form.enableRewardSystem}
            />
          </FieldGroup>
        </div>
      </div>

      {/* Reward Description */}
      <div className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6 transition-opacity ${!form.enableRewardSystem ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
            <Icon name="Gift" size={16} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Reward Description</p>
            <p className="text-xs text-slate-400">Tell employees what they can earn</p>
          </div>
        </div>
        <div className="px-6 py-5">
          <textarea
            value={form.rewardDescription}
            onChange={(e) => set('rewardDescription', e.target.value)}
            disabled={!form.enableRewardSystem}
            rows={3}
            placeholder="e.g. Gift voucher worth ₹500, Extra leave day, Recognition certificate…"
            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400 resize-none"
          />
          <p className="text-xs text-slate-400 mt-2">This message is shown to employees when they view their reward points balance.</p>
        </div>
      </div>

      {/* Preview */}
      {form.enableRewardSystem && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-5 mb-8">
          <p className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
            <Icon name="Star" size={16} className="text-yellow-500" />
            Reward System Preview
          </p>
          <div className="space-y-1.5 text-xs text-slate-600">
            <p>• On-time attendance: <strong>+{form.rewardPointsPerDay} points</strong> per day</p>
            <p>• Late check-in: <strong>−{form.rewardPointsLateDeduction} points</strong> per occurrence</p>
            <p>• Reward unlocks at: <strong>{form.rewardRedemptionThreshold} points</strong></p>
            {form.rewardDescription && (
              <p>• Reward: <strong>{form.rewardDescription}</strong></p>
            )}
            <p className="mt-2 text-slate-400">
              At this rate, an employee with perfect attendance earns {form.rewardRedemptionThreshold} points
              in ~<strong>{Math.ceil(form.rewardRedemptionThreshold / form.rewardPointsPerDay)} working days</strong>.
            </p>
          </div>
        </div>
      )}

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
          disabled={saving || (form.enableRewardSystem && form.rewardPointsLateDeduction > form.rewardPointsPerDay)}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-60"
        >
          <Icon name="Save" size={16} />
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default RewardSystemSettings;
