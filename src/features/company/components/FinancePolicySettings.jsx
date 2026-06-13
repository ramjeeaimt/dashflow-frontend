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

const FinancePolicySettings = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    payrollAlertEmails: '',
  });

  const [newEmailInput, setNewEmailInput] = useState('');

  useEffect(() => {
    const fetch = async () => {
      if (!user?.company?.id) return;
      try {
        setLoading(true);
        const res = await api.get(`/system-company/id/${user.company.id}`);
        const c = res.data?.data || res.data;
        if (c) {
          setForm({
            payrollAlertEmails: c.payrollAlertEmails || '',
          });
        }
      } catch (e) {
        console.error('Failed to load finance policy', e);
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
      console.error('Failed to save finance policy', e);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const emailList = form.payrollAlertEmails ? form.payrollAlertEmails.split(',').map(e => e.trim()).filter(Boolean) : [];

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
    set('payrollAlertEmails', newEmailsString);
    setNewEmailInput('');

    if (!user?.company?.id) return;
    try {
      await api.patch(`/system-company/${user.company.id}`, { payrollAlertEmails: newEmailsString });
      const updatedUser = { ...user, company: { ...user.company, payrollAlertEmails: newEmailsString } };
      useAuthStore.setState({ user: updatedUser });
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Failed to save email automatically', err);
    }
  };

  const handleRemoveEmail = async (emailToRemove) => {
    const updatedList = emailList.filter((e) => e !== emailToRemove);
    const newEmailsString = updatedList.join(', ');
    set('payrollAlertEmails', newEmailsString);

    if (!user?.company?.id) return;
    try {
      await api.patch(`/system-company/${user.company.id}`, { payrollAlertEmails: newEmailsString });
      const updatedUser = { ...user, company: { ...user.company, payrollAlertEmails: newEmailsString } };
      useAuthStore.setState({ user: updatedUser });
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Failed to remove email automatically', err);
    }
  };

  if (loading) return <div className="p-8 text-sm text-slate-400">Loading policy settings…</div>;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page title */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-900">Finance Policy</h3>
        <p className="text-sm text-slate-500 mt-1">Configure who should receive alerts regarding payroll generation and finance updates.</p>
      </div>

      {/* Payroll Alerts */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Icon name="DollarSign" size={16} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Payroll Notifications</p>
            <p className="text-xs text-slate-400">Manage who receives alerts when payroll is generated.</p>
          </div>
        </div>
        <div className="px-6">
          <FieldGroup
            label="Payroll Alert Emails"
            hint="Administrators (or finance staff) who will receive email notifications and push alerts when payroll is generated."
          >
            <div className="space-y-4 max-w-lg">
              <form onSubmit={handleAddEmail} className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Icon name="Mail" size={14} />
                  </span>
                  <input
                    type="text"
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    placeholder="Enter email to add..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 text-slate-800"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Icon name="Plus" size={14} />
                  <span>Add</span>
                </button>
              </form>

              {emailList.length > 0 ? (
                <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 min-h-[46px] items-center">
                  {emailList.map((email) => (
                    <div
                      key={email}
                      className="flex items-center space-x-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:border-slate-300 transition-all group/chip shadow-sm"
                    >
                      <Icon name="Mail" size={12} className="text-slate-400" />
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(email)}
                        className="w-4 h-4 rounded flex items-center justify-center hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all"
                        title={`Remove ${email}`}
                      >
                        <Icon name="X" size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                  <p className="text-xs font-medium text-slate-400">No admin emails added yet. Default admins will receive notifications.</p>
                </div>
              )}
            </div>
          </FieldGroup>
        </div>
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

export default FinancePolicySettings;
