import React, { useState, useEffect } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import api from '../../../api/client';
import uploadService from '../../../features/upload/uploadService';
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

const FinancePolicySettings = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    payrollAlertEmails: '',
    allowanceAmount: 0,
    overtimePolicy: 'fixed',
    overtimeRatePerHour: 0,
    overtimeMultiplier: 100.0,
  });

  const [newEmailInput, setNewEmailInput] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [emailTemplate, setEmailTemplate] = useState(`<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 20px; }
        .footer { margin-top: 30px; font-size: 14px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
        .logo { max-width: 150px; }
        .signature { max-width: 150px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <!-- Add Logo Link Below -->
            <img src="" alt="Company Logo" class="logo" />
        </div>
        
        <div class="content">
            <h2>Payslip for [Month]</h2>
            <p>Dear [Employee Name],</p>
            <p>Please find attached your payslip for the month. You can customize the HTML here to match your brand's voice and design.</p>
            <p>Make sure to copy the image links generated above and paste them into the <code>src</code> attributes of the images.</p>
        </div>
        
        <div class="footer">
            <p>Best regards,</p>
            <!-- Add Signature Link Below -->
            <img src="" alt="Company Signature" class="signature" />
            <p><strong>Company Owner</strong></p>
        </div>
    </div>
        </div>
    </div>
</body>
</html>`);
  const [showPreview, setShowPreview] = useState(false);

  const [salaryEmailBodyTemplate, setSalaryEmailBodyTemplate] = useState(`<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    </style>
</head>
<body>
    <p>Dear [Employee Name],</p>
    <p>Please find attached your salary slip for the month of [Month].</p>
    <br/>
    <p>Best regards,</p>
    <p><strong>Company Owner</strong></p>
</body>
</html>`);
  const [showBodyPreview, setShowBodyPreview] = useState(false);
  const [isEmailTemplateEditable, setIsEmailTemplateEditable] = useState(false);
  const [isBodyTemplateEditable, setIsBodyTemplateEditable] = useState(false);

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
            allowanceAmount: c.allowanceAmount ?? 0,
            overtimePolicy: c.overtimePolicy || 'fixed',
            overtimeRatePerHour: c.overtimeRatePerHour ?? 0,
            overtimeMultiplier: c.overtimeMultiplier ?? 100.0,
          });
          setLogoUrl(c.logo || '');
          setSignatureUrl(c.payslipSignature || '');
          if (c.payslipEmailTemplate) setEmailTemplate(c.payslipEmailTemplate);
          if (c.salaryEmailBodyTemplate) setSalaryEmailBodyTemplate(c.salaryEmailBodyTemplate);
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
      const payload = {
        ...form,
        overtimeMultiplier: form.overtimeMultiplier === '' ? 0 : form.overtimeMultiplier,
        allowanceAmount: form.allowanceAmount === '' ? 0 : form.allowanceAmount,
        overtimeRatePerHour: form.overtimeRatePerHour === '' ? 0 : form.overtimeRatePerHour,
        logo: logoUrl,
        payslipSignature: signatureUrl,
        payslipEmailTemplate: emailTemplate,
        salaryEmailBodyTemplate: salaryEmailBodyTemplate,
      };
      await api.patch(`/system-company/${user.company.id}`, payload);
      
      const updatedUser = {
        ...user,
        company: {
          ...user.company,
          ...payload,
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

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setSaving(true);
        const response = await uploadService.uploadImage(file);
        const url = response?.data?.url || response?.url;
        
        if (url) {
          if (type === 'logo') setLogoUrl(url);
          if (type === 'signature') setSignatureUrl(url);
        } else {
          console.error("Upload response missing URL", response);
          alert('Upload failed: Did not receive image URL from server.');
        }
      } catch (err) {
        console.error('Failed to upload image:', err);
        alert('Failed to upload image. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert('Image link copied to clipboard!');
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

  if (loading) return <div className="p-8 text-sm text-muted-foreground/70">Loading policy settings…</div>;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page title */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-foreground">Finance Policy</h3>
        <p className="text-sm text-muted-foreground mt-1">Configure who should receive alerts regarding payroll generation and finance updates.</p>
      </div>

      {/* Payroll Alerts */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Icon name="DollarSign" size={16} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Payroll Notifications</p>
            <p className="text-xs text-muted-foreground/70">Manage who receives alerts when payroll is generated.</p>
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
                  <p className="text-xs font-medium text-muted-foreground/70">No admin emails added yet. Default admins will receive notifications.</p>
                </div>
              )}
            </div>
          </FieldGroup>
        </div>
      </div>

      {/* Payroll Policies */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="Settings" size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Payroll Policies</p>
            <p className="text-xs text-muted-foreground/70">Configure global allowances and overtime calculations.</p>
          </div>
        </div>
        <div className="px-6">
          <FieldGroup
            label="Allowance Amount"
            hint="Standard monthly allowance added to every generated payslip (positive integer)."
          >
            <div className="relative max-w-sm">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground/70 pointer-events-none">
                <Icon name="IndianRupee" size={14} />
              </span>
              <input
                type="number"
                min="0"
                value={form.allowanceAmount === 0 && form.allowanceAmount !== '' ? 0 : form.allowanceAmount}
                onChange={(e) => {
                  const valStr = e.target.value;
                  set('allowanceAmount', valStr === '' ? '' : (parseInt(valStr) || 0));
                }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              />
            </div>
          </FieldGroup>

          <FieldGroup
            label="Overtime Policy"
            hint="Choose how overtime pay is calculated."
          >
            <div className="max-w-sm">
              <select
                value={form.overtimePolicy}
                onChange={(e) => set('overtimePolicy', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground bg-card"
              >
                <option value="fixed">Fixed Rate</option>
                <option value="variable">Variable Rate (Based on exact working days & hours)</option>
              </select>
            </div>
          </FieldGroup>

          {form.overtimePolicy === 'fixed' && (
            <FieldGroup
              label="Overtime Rate Per Hour"
              hint="The fixed amount paid for every hour of overtime."
            >
              <div className="relative max-w-sm">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground/70 pointer-events-none">
                  <Icon name="IndianRupee" size={14} />
                </span>
                <input
                  type="number"
                  min="0"
                  value={form.overtimeRatePerHour === 0 && form.overtimeRatePerHour !== '' ? 0 : form.overtimeRatePerHour}
                  onChange={(e) => {
                    const valStr = e.target.value;
                    set('overtimeRatePerHour', valStr === '' ? '' : (parseInt(valStr) || 0));
                  }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                />
              </div>
            </FieldGroup>
          )}

          {form.overtimePolicy === 'variable' && (
            <FieldGroup
              label="Overtime Rate Percentage"
              hint="Percentage of the base hourly rate applied for overtime hours (e.g., 100% = normal rate, 200% = double time)."
            >
              <div className="relative max-w-sm">
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={form.overtimeMultiplier === 0 && form.overtimeMultiplier !== '' ? 0 : form.overtimeMultiplier}
                  onChange={(e) => {
                    const valStr = e.target.value;
                    if (valStr === '') {
                      set('overtimeMultiplier', '');
                    } else {
                      set('overtimeMultiplier', parseFloat(valStr));
                    }
                  }}
                  className="w-full pl-3 pr-9 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground/70 pointer-events-none">
                  <span className="font-bold text-xs">%</span>
                </span>
              </div>
            </FieldGroup>
          )}
        </div>
      </div>

      {/* Payslip Email Template */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="Mail" size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Payslip Attachment Template</p>
              <p className="text-xs text-muted-foreground/70">Configure branding and HTML format for the generated payslip PDF attachment.</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div className="bg-muted/60 p-5 rounded-lg border border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Icon name="Image" size={16} /> Company Logo
                    </h3>
                    <div className="space-y-4">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'logo')}
                            className="block w-full text-sm text-muted-foreground
 file:mr-4 file:py-2 file:px-4
 file:rounded-full file:border-0
 file:text-sm file:font-semibold
 file:bg-primary/10 file:text-primary
 hover:file:bg-primary/10 transition-all cursor-pointer"
                        />
                        {logoUrl && (
                            <div className="mt-3">
                                <p className="text-xs text-muted-foreground mb-1">Generated Image Link:</p>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={logoUrl} 
                                        className="text-xs bg-card border border-border rounded px-2 py-1 w-full"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => copyToClipboard(logoUrl)}
                                        className="bg-border hover:bg-slate-300 px-3 rounded text-xs font-medium transition-colors"
                                    >
                                        Copy
                                    </button>
                                </div>
                                <div className="mt-4 p-3 bg-card border border-border rounded flex justify-center">
                                    <img src={logoUrl} alt="Logo Preview" className="max-h-20 object-contain" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Signature Upload */}
                <div className="bg-muted/60 p-5 rounded-lg border border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Icon name="Edit3" size={16} /> Owner Signature
                    </h3>
                    <div className="space-y-4">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'signature')}
                            className="block w-full text-sm text-muted-foreground
 file:mr-4 file:py-2 file:px-4
 file:rounded-full file:border-0
 file:text-sm file:font-semibold
 file:bg-primary/10 file:text-primary
 hover:file:bg-primary/10 transition-all cursor-pointer"
                        />
                        {signatureUrl && (
                            <div className="mt-3">
                                <p className="text-xs text-muted-foreground mb-1">Generated Image Link:</p>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={signatureUrl} 
                                        className="text-xs bg-card border border-border rounded px-2 py-1 w-full"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => copyToClipboard(signatureUrl)}
                                        className="bg-border hover:bg-slate-300 px-3 rounded text-xs font-medium transition-colors"
                                    >
                                        Copy
                                    </button>
                                </div>
                                <div className="mt-4 p-3 bg-card border border-border rounded flex justify-center">
                                    <img src={signatureUrl} alt="Signature Preview" className="max-h-20 object-contain" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Email Template Editor */}
            <div className="border border-border rounded-lg overflow-hidden mt-6">
                <div className="bg-muted/60 border-b border-border px-5 py-3 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Icon name="Code" size={16} /> HTML Format
                    </h3>
                    <div className="flex gap-4 items-center">
                        {!showPreview && (
                            <button
                                type="button"
                                onClick={() => setIsEmailTemplateEditable(!isEmailTemplateEditable)}
                                className={`text-sm font-medium flex items-center gap-1 ${isEmailTemplateEditable ? 'text-green-600' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <Icon name="Edit2" size={16} />
                                {isEmailTemplateEditable ? 'Editing...' : 'Edit Code'}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setShowPreview(!showPreview)}
                            className="text-sm font-medium text-primary hover:text-primary flex items-center gap-1"
                        >
                            <Icon name={showPreview ? 'Code' : 'Eye'} size={16} />
                            {showPreview ? 'Edit HTML' : 'Show Preview'}
                        </button>
                    </div>
                </div>

                <div className="p-0">
                    {showPreview ? (
                        <div className="bg-card p-8 overflow-auto max-h-[500px]">
                            <div className="border border-dashed border-border rounded-lg p-4 bg-background">
                                <p className="text-xs text-muted-foreground mb-4 text-center uppercase tracking-wider font-semibold">Email Preview</p>
                                <div 
                                    className="bg-card shadow-sm mx-auto"
                                    dangerouslySetInnerHTML={{ __html: emailTemplate }} 
                                />
                            </div>
                        </div>
                    ) : (
                        <textarea
                            value={emailTemplate}
                            onChange={(e) => setEmailTemplate(e.target.value)}
                            readOnly={!isEmailTemplateEditable}
                            className={`w-full h-[400px] p-5 font-mono text-sm text-foreground bg-sidebar !text-green-400 focus:outline-none ${!isEmailTemplateEditable ? 'opacity-80 cursor-not-allowed' : ''}`}
                            spellCheck="false"
                        />
                    )}
                </div>
            </div>
        </div>
      </div>
      {/* Salary Email Body Template */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="Mail" size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Salary Email Body Template</p>
              <p className="text-xs text-muted-foreground/70">Configure the actual HTML body of the email that the employee will receive along with the payslip attachment.</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-6 space-y-8">
            <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/60 border-b border-border px-5 py-3 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Icon name="Code" size={16} /> Email Body HTML Format
                    </h3>
                    <div className="flex gap-4 items-center">
                        {!showBodyPreview && (
                            <button
                                type="button"
                                onClick={() => setIsBodyTemplateEditable(!isBodyTemplateEditable)}
                                className={`text-sm font-medium flex items-center gap-1 ${isBodyTemplateEditable ? 'text-green-600' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <Icon name="Edit2" size={16} />
                                {isBodyTemplateEditable ? 'Editing...' : 'Edit Code'}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setShowBodyPreview(!showBodyPreview)}
                            className="text-sm font-medium text-primary hover:text-primary flex items-center gap-1"
                        >
                            <Icon name={showBodyPreview ? 'Code' : 'Eye'} size={16} />
                            {showBodyPreview ? 'Edit HTML' : 'Show Preview'}
                        </button>
                    </div>
                </div>

                <div className="p-0">
                    {showBodyPreview ? (
                        <div className="bg-card p-8 overflow-auto max-h-[500px]">
                            <div className="border border-dashed border-border rounded-lg p-4 bg-background">
                                <p className="text-xs text-muted-foreground mb-4 text-center uppercase tracking-wider font-semibold">Email Preview</p>
                                <div 
                                    className="bg-card shadow-sm mx-auto"
                                    dangerouslySetInnerHTML={{ __html: salaryEmailBodyTemplate }} 
                                />
                            </div>
                        </div>
                    ) : (
                        <textarea
                            value={salaryEmailBodyTemplate}
                            onChange={(e) => setSalaryEmailBodyTemplate(e.target.value)}
                            readOnly={!isBodyTemplateEditable}
                            className={`w-full h-[400px] p-5 font-mono text-sm text-foreground bg-sidebar !text-green-400 focus:outline-none ${!isBodyTemplateEditable ? 'opacity-80 cursor-not-allowed' : ''}`}
                            spellCheck="false"
                        />
                    )}
                </div>
            </div>
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
          className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-60"
        >
          <Icon name="Save" size={16} />
          {saving ? 'Saving…' : 'Save Policy'}
        </button>
      </div>
    </div>
  );
};

export default FinancePolicySettings;
