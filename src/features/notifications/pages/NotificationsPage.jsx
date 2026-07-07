import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Mail, Send, Search, Trash2, Users, Briefcase, Building2, Clock3, CircleAlert, X, Pencil } from 'lucide-react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import useAuthStore from '../../../store/useAuthStore';
import useNotificationStore from '../../../store/useNotificationStore';
import notificationService from '../../../services/notification.service';
import employeeService from '../../../services/employee.service';
import clientService from '../../../services/client.service';
import { Checkbox } from '../../../components/ui/Checkbox';
import { isAdminUser } from '../../../config/roles';

const getPreviewHtml = (title, message) => {
  const year = new Date().getFullYear();
  const bannerUrl = 'https://res.cloudinary.com/dxju8ikk4/image/upload/v1777468072/difmo_banner_final.png';

  // Retrieve global active template if any
  let activeTpl = {};
  const globalActiveId = localStorage.getItem('global_active_template_id');
  if (globalActiveId && globalActiveId !== 'default') {
    const savedTemplates = JSON.parse(localStorage.getItem('notification_templates') || '[]');
    const found = savedTemplates.find(t => t.id.toString() === globalActiveId.toString());
    if (found) {
      activeTpl = found;
    }
  }

  const sigTeam = activeTpl.signatureTeam || 'Team DIFMO';
  const sigDept = activeTpl.signatureDept || 'Corporate Support';
  const sigRole = activeTpl.signatureRole || 'Communications & Experience';
  const sigCompany = activeTpl.signatureCompany || 'DIFMO Pvt Ltd';
  const sigMeetText = activeTpl.signatureMeetText || "Let's meet";
  const sigMeetLink = activeTpl.signatureMeetLink || 'https://www.difmo.com/contact';
  const sigEmail = activeTpl.signatureEmail || 'info@difmo.com';
  const sigAddress = activeTpl.signatureAddress || '4/37 Vibhav Khand, Gomtinagr Lucknow, Uttar Pradesh 226016, India';
  const sigWebsite = activeTpl.signatureWebsite || 'difmo.com';
  const sigWebsiteLink = activeTpl.signatureWebsiteLink || 'https://www.difmo.com';

  return `
    <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background: #fff; color: #1e293b; margin: 0; padding: 20px; box-sizing: border-box; min-height: 100%;">
      <div style="max-width: 700px; margin: 0 auto; background: #fff; box-sizing: border-box;">

        <!-- Body -->
        <div style="font-size: 16px; line-height: 1.6; color: #334155;">
          ${message}
        </div>

        <!-- Signature -->
        <div style="margin-top: 48px; padding-top: 28px; border-top: 1px solid #f1f5f9;">
          <img src="https://res.cloudinary.com/dxju8ikk4/image/upload/v1777469595/difmo_vector_icon.png"
               width="100" height="100"
               style="border-radius: 50%; object-fit: cover; display: block; margin-bottom: 20px;">

          <div style="border-top: 1px solid #1e293b; padding-top: 22px; max-width: 650px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <!-- Left: Identity -->
                <td width="55%" valign="top">
                  <p style="margin: 0 0 2px; font-size: 20px; font-weight: 800; color: #000; letter-spacing: -0.4px;">${sigTeam}</p>
                  <p style="margin: 0 0 1px; font-size: 15px; color: #1e293b; font-weight: 500;">${sigDept}</p>
                  <p style="margin: 0 0 12px; font-size: 14px; color: #475569; font-style: italic;">${sigRole}</p>
                  <p style="margin: 0 0 14px; font-size: 15px; font-weight: 800; color: #000;">${sigCompany}</p>
                  <a href="${sigMeetLink}" style="color: #d03f13ff; font-size: 14px; font-weight: 700; text-decoration: none;">
                    ${sigMeetText}
                  </a>
                </td>

                <!-- Right: Contact -->
                <td width="45%" valign="top">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="32" valign="top" style="padding-bottom: 14px;">
                        <div style="width: 24px; height: 24px; background: #000; border-radius: 50%; text-align: center; line-height: 24px;">
                          <span style="color: #fff; font-size: 11px; font-weight: 800;">E</span>
                        </div>
                      </td>
                      <td style="padding-bottom: 14px; font-size: 14px; font-weight: 600; color: #000; line-height: 1.5;">
                        <a href="mailto:${sigEmail}" style="color: #000; text-decoration: none;">${sigEmail}</a>
                      </td>
                    </tr>
                    <tr>
                      <td width="32" valign="top" style="padding-bottom: 14px;">
                        <div style="width: 24px; height: 24px; background: #000; border-radius: 50%; text-align: center; line-height: 24px;">
                          <span style="color: #fff; font-size: 11px; font-weight: 800;">A</span>
                        </div>
                      </td>
                      <td style="padding-bottom: 14px; font-size: 14px; font-weight: 600; color: #000; line-height: 1.5;">
                        ${sigAddress}
                      </td>
                    </tr>
                    <tr>
                      <td width="32" valign="top" style="padding-bottom: 14px;">
                        <div style="width: 24px; height: 24px; background: #000; border-radius: 50%; text-align: center; line-height: 24px;">
                          <span style="color: #fff; font-size: 11px; font-weight: 800;">W</span>
                        </div>
                      </td>
                      <td style="padding-bottom: 14px; font-size: 14px; font-weight: 600; color: #000; line-height: 1.5;">
                        <a href="${sigWebsiteLink}" style="color: #d03f13ff; text-decoration: none;">${sigWebsite}</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>
          <div style="border-top: 1px solid #1e293b; margin-top: 22px; max-width: 650px;"></div>
        </div>

        <!-- Banner -->
        <div style="margin-top: 36px; border-radius: 10px; overflow: hidden; line-height: 0;">
          <img src="${bannerUrl}" alt="Our Services" style="width: 100%; height: auto; display: block;">
        </div>

        <!-- Social Links -->
        <div style="margin-top: 28px;">
          <a href="#" style="display: inline-block; margin-right: 14px;">
            <img src="https://cdn-icons-png.flaticon.com/512/145/145807.png" width="22" style="opacity: 0.75; vertical-align: middle;">
          </a>
          <a href="#" style="display: inline-block; margin-right: 14px;">
            <img src="https://cdn-icons-png.flaticon.com/512/145/145802.png" width="22" style="opacity: 0.75; vertical-align: middle;">
          </a>
          <a href="#" style="display: inline-block; margin-right: 14px;">
            <img src="https://cdn-icons-png.flaticon.com/512/145/145812.png" width="22" style="opacity: 0.75; vertical-align: middle;">
          </a>
        </div>

        <!-- Legal -->
        <div style="margin-top: 36px; font-size: 11px; color: #94a3b8; line-height: 1.5;">
          <p style="margin: 0;">
            This email, along with any attachments, documents, project files, source code, designs, business strategies, client information, and other transmitted materials, contains confidential and proprietary information belonging to <b>DIFMO</b>. It is intended solely for the use of the individual, organization, or entity to whom it is addressed.
            <br/><br/>
            Any unauthorized access, review, copying, disclosure, distribution, modification, or use of this information is strictly prohibited and may be unlawful.
            <br/><br/>
            If you have received this communication in error, please notify us immediately by replying to this email or contacting our support team at <b>info@difmo.com, mailto:info@difmo.com</b>, and permanently delete all copies of this message and its attachments from your system.
            <br/><br/>
            Difmo Private Limited is committed to protecting client data, intellectual property, and business confidentiality across all services including AI solutions, web development, mobile applications, cloud services, cybersecurity, and smart technology solutions.
            <br/><br/>
            <b>© ${year} Difmo Private Limited. All rights reserved.</b>
          </p>
          <p style="margin: 8px 0 0;">&copy; ${year} DIFMO PRIVATE LIMITED. ALL RIGHTS RESERVED.</p>
        </div>

      </div>
    </div>
  `;
};

const defaultComposeForm = {
  title: '',
  message: '',
  audience: 'employees',
  selectionMode: 'all',
  channel: 'email'
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { notifications } = useNotificationStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [composeForm, setComposeForm] = useState(defaultComposeForm);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0, emailOnly: 0, multiChannel: 0 });
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [useCustomLayout, setUseCustomLayout] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({ name: '', title: '', message: '' });

  const isAdmin = isAdminUser(user);
  const companyId = user?.company?.id;

  const recipientDataset = composeForm.audience === 'clients' ? clients : employees;

  const filteredRecipients = useMemo(() => {
    const search = recipientSearch.trim().toLowerCase();
    if (!search) return recipientDataset;

    return recipientDataset.filter((item) => {
      const name = composeForm.audience === 'clients'
        ? item.name
        : item.user?.name || `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.trim();
      const email = composeForm.audience === 'clients' ? item.email : item.user?.email;
      return `${name || ''} ${email || ''}`.toLowerCase().includes(search);
    });
  }, [recipientDataset, recipientSearch, composeForm.audience]);

  const filteredHistory = useMemo(() => {
    const search = historySearch.trim().toLowerCase();
    if (!search) return history;
    return history.filter((item) =>
      `${item.title || ''} ${item.message || ''} ${item.recipientFilter || ''}`.toLowerCase().includes(search)
    );
  }, [history, historySearch]);

  const inboxItems = useMemo(() => {
    return (notifications || []).filter(Boolean);
  }, [notifications]);

  useEffect(() => {
    if (!isAdmin || !companyId) return;

    const loadAdminData = async () => {
      setIsLoadingData(true);
      try {
        const [employeeList, clientList, historyResponse, statsResponse] = await Promise.all([
          employeeService.getAll({ companyId }),
          clientService.getAll(),
          notificationService.getHistory(companyId),
          notificationService.getStats(companyId)
        ]);

        const historyData = historyResponse?.data || historyResponse || [];
        const statsData = statsResponse?.data || statsResponse || {};

        setEmployees(Array.isArray(employeeList) ? employeeList : []);
        setClients(Array.isArray(clientList) ? clientList.filter((client) => {
          if (!companyId) return true;
          return client.companyId === companyId || client.company_id === companyId || !client.companyId;
        }) : []);
        setHistory(Array.isArray(historyData) ? historyData : []);
        setStats({
          total: statsData.total || 0,
          sent: statsData.sent || 0,
          failed: statsData.failed || 0,
          emailOnly: statsData.emailOnly || 0,
          multiChannel: statsData.multiChannel || 0,
        });
      } catch (error) {
        console.error('Failed to load notification admin data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadAdminData();

    const savedTemplates = localStorage.getItem('notification_templates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, [isAdmin, companyId]);

  useEffect(() => {
    setSelectedRecipientIds([]);
    setRecipientSearch('');
    setFeedback(null);
  }, [composeForm.audience, composeForm.selectionMode]);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all notifications from your inbox?')) return;
    try {
      await notificationService.clearAll();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const handleRecipientToggle = (recipientId) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(recipientId) ? prev.filter((id) => id !== recipientId) : [...prev, recipientId]
    );
  };

  const handleComposeChange = (field, value) => {
    setComposeForm((prev) => ({ ...prev, [field]: value }));
  };

  const refreshHistory = async () => {
    if (!companyId) return;
    try {
      const [historyResponse, statsResponse] = await Promise.all([
        notificationService.getHistory(companyId),
        notificationService.getStats(companyId)
      ]);
      setHistory(historyResponse?.data || historyResponse || []);
      const statsData = statsResponse?.data || statsResponse || {};
      setStats({
        total: statsData.total || 0,
        sent: statsData.sent || 0,
        failed: statsData.failed || 0,
        emailOnly: statsData.emailOnly || 0,
        multiChannel: statsData.multiChannel || 0,
      });
    } catch (error) {
      console.error('Failed to refresh notification history:', error);
    }
  };

  const handleSendNotification = async () => {
    if (!companyId) return;
    if (!composeForm.title.trim() || !composeForm.message.trim()) {
      setFeedback({ type: 'error', message: 'Title and message are required.' });
      return;
    }

    if (composeForm.selectionMode === 'selected' && selectedRecipientIds.length === 0 && composeForm.audience !== 'all') {
      setFeedback({ type: 'error', message: 'Select at least one recipient before sending.' });
      return;
    }

    const payload = {
      title: composeForm.title.trim(),
      message: composeForm.message.trim(),
      type: composeForm.channel,
      recipientFilter: composeForm.audience === 'all' ? 'all' : composeForm.audience,
      companyId,
      metadata: {
        type: 'ADMIN_BROADCAST',
        audience: composeForm.audience,
        sentFrom: 'notifications-page',
        useCustomHtml: composeForm.channel === 'email' || composeForm.channel === 'both',
        customHtml: (composeForm.channel === 'email' || composeForm.channel === 'both')
          ? getPreviewHtml(composeForm.title.trim(), composeForm.message.trim())
          : undefined
      }
    };

    if (composeForm.audience === 'employees' && composeForm.selectionMode === 'selected') {
      payload.recipientIds = selectedRecipientIds;
    }

    if (composeForm.audience === 'clients' && composeForm.selectionMode === 'selected') {
      payload.recipientClientIds = selectedRecipientIds;
    }

    setIsSending(true);
    setFeedback(null);
    try {
      await notificationService.send(payload);
      setFeedback({ type: 'success', message: 'Notification campaign sent successfully.' });
      setComposeForm(defaultComposeForm);
      setUseCustomLayout(false);
      setSelectedRecipientIds([]);
      await refreshHistory();
    } catch (error) {
      console.error('Failed to send notification:', error);
      setFeedback({
        type: 'error',
        message: error?.response?.data?.message || 'Failed to send notification campaign.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteTemplate = (id) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    localStorage.setItem('notification_templates', JSON.stringify(updated));
  };

  const handleLoadTemplate = (tpl) => {
    setComposeForm({
      ...defaultComposeForm,
      title: tpl.title,
      message: tpl.message,
      audience: tpl.audience || 'employees',
      channel: tpl.channel || 'email'
    });
    setUseCustomLayout(true);
    setShowTemplates(false);
    setFeedback({ type: 'success', message: `Loaded template: ${tpl.title}` });
  };

  const formatHistoryTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const audienceSummary = composeForm.audience === 'all'
    ? 'Employees and clients across the company'
    : composeForm.audience === 'clients'
      ? 'Client contacts'
      : 'Employees and internal users';

  return (
    <div className="min-h-screen bg-muted/60">
      <Header onToggleSidebar={toggleMobileSidebar} />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-8`}>
        <div className="mx-auto max-w-7xl p-4 sm:p-6">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
                Communication Center
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-foreground">
                {isAdmin ? 'Notifications & Campaigns' : 'My Notifications'}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isAdmin
                  ? 'Send email campaigns to employees, clients, or everyone and track delivery history.'
                  : 'Stay on top of alerts, payroll updates, and workflow activity.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60"
              >
                <CheckCheck size={16} />
                Mark all read
              </button>
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-card px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
              >
                <Trash2 size={16} />
                Clear inbox
              </button>
            </div>
          </div>

          {isAdmin && (
            <>
              <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
                <StatCard icon={<Bell size={16} />} label="Total Campaigns" value={stats.total} />
                <StatCard icon={<Send size={16} />} label="Sent" value={stats.sent} />
                <StatCard icon={<CircleAlert size={16} />} label="Failed" value={stats.failed} />
                <StatCard icon={<Mail size={16} />} label="Email Only" value={stats.emailOnly} />
                <StatCard icon={<Building2 size={16} />} label="Multi-Channel" value={stats.multiChannel} />
              </div>

              <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
                <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Compose Campaign</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Use a standard broadcast flow to target the right audience.</p>
                    </div>
                    <button
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <Briefcase size={14} /> {showTemplates ? 'CLOSE TEMPLATES' : 'MY TEMPLATES'}
                    </button>
                  </div>

                  {showTemplates && (
                    <div className="mb-6 space-y-2 max-h-60 overflow-y-auto p-2 bg-muted/60 rounded-xl border border-border">
                      <div className="flex items-center justify-between px-1 mb-2">
                        <h3 className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide">Saved Templates</h3>
                        <button onClick={() => navigate('/notifications/templates/design')} className="text-[10px] font-bold text-primary hover:underline">+ CREATE NEW</button>
                      </div>
                      {templates.length === 0 ? (
                        <p className="text-xs text-muted-foreground/70 italic p-2 text-center">No templates saved yet.</p>
                      ) : templates.map(tpl => (
                        <div key={tpl.id} className="flex items-center justify-between p-2 bg-card rounded-lg border border-border shadow-sm hover:border-blue-300 group">
                          <div className="cursor-pointer flex-1" onClick={() => handleLoadTemplate(tpl)}>
                            <p className="text-xs font-bold text-foreground">{tpl.name || tpl.title}</p>
                            <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{tpl.title}</p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => navigate(`/notifications/templates/design/${tpl.id}`)} className="p-1.5 text-muted-foreground/70 hover:text-primary">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => handleDeleteTemplate(tpl.id)} className="p-1.5 text-muted-foreground/70 hover:text-rose-500">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4">
                    <Field label="Title">
                      <input
                        value={composeForm.title}
                        onChange={(event) => handleComposeChange('title', event.target.value)}
                        placeholder="Monthly update, policy reminder..."
                        className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                      />
                    </Field>

                    <Field label="Message">
                      <textarea
                        value={composeForm.message}
                        onChange={(event) => handleComposeChange('message', event.target.value)}
                        rows={6}
                        placeholder="Write the message content."
                        className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                      />
                    </Field>

                    {/* Toggle Option for Custom Designed Template */}
                    {(composeForm.channel === 'email' || composeForm.channel === 'both') && (
                      <div className="flex items-start gap-3 p-3.5 bg-muted/60 border border-border/80 rounded-xl transition-all shadow-sm">
                        <Checkbox
                          id="useCustomLayout"
                          checked={useCustomLayout}
                          onChange={() => setUseCustomLayout(!useCustomLayout)}
                          label="Use Admin Panel Custom Designed Layout"
                          description="Sends using the premium header/footer email layout."
                        />
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Audience">
                        <select
                          value={composeForm.audience}
                          onChange={(event) => handleComposeChange('audience', event.target.value)}
                          className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                        >
                          <option value="employees">Employees</option>
                          <option value="clients">Clients</option>
                          <option value="all">Everyone</option>
                        </select>
                      </Field>

                      <Field label="Delivery">
                        <select
                          value={composeForm.channel}
                          onChange={(event) => handleComposeChange('channel', event.target.value)}
                          className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                        >
                          <option value="email">Email only</option>
                          <option value="both">Email + in-app</option>
                          <option value="realtime">In-app only</option>
                        </select>
                      </Field>
                    </div>

                    {composeForm.audience !== 'all' && (
                      <Field label="Targeting">
                        <div className="flex rounded-lg border border-border bg-muted/60 p-1">
                          {[
                            { key: 'all', label: `All ${composeForm.audience}` },
                            { key: 'selected', label: 'Selected only' }
                          ].map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              onClick={() => handleComposeChange('selectionMode', option.key)}
                              className={`flex-1 rounded-md px-3 py-2 text-sm transition-colors ${composeForm.selectionMode === option.key
 ? 'bg-card font-semibold text-foreground shadow-sm'
 : 'text-muted-foreground hover:text-foreground'
 }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">{audienceSummary}</p>
                      </Field>
                    )}

                    {composeForm.audience !== 'all' && composeForm.selectionMode === 'selected' && (
                      <div className="rounded-xl border border-border">
                        <div className="border-b border-border p-3">
                          <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" size={15} />
                            <input
                              value={recipientSearch}
                              onChange={(event) => setRecipientSearch(event.target.value)}
                              placeholder={`Search ${composeForm.audience}`}
                              className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
                            />
                          </div>
                        </div>
                        <div className="max-h-72 space-y-1 overflow-y-auto p-3">
                          {filteredRecipients.map((recipient) => {
                            const recipientId = composeForm.audience === 'clients' ? recipient.id : recipient.userId || recipient.user?.id || recipient.id;
                            const name = composeForm.audience === 'clients'
                              ? recipient.name
                              : recipient.user?.name || `${recipient.user?.firstName || ''} ${recipient.user?.lastName || ''}`.trim();
                            const email = composeForm.audience === 'clients' ? recipient.email : recipient.user?.email;

                            return (
                              <div key={recipientId} className="rounded-lg border border-transparent px-2 py-2 hover:border-border hover:bg-muted/60">
                                <Checkbox
                                  checked={selectedRecipientIds.includes(recipientId)}
                                  onChange={() => handleRecipientToggle(recipientId)}
                                  label={name || 'Unnamed'}
                                  description={email || 'No email'}
                                  className="items-start"
                                />
                              </div>
                            );
                          })}

                          {filteredRecipients.length === 0 && (
                            <div className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground/70">
                              No matching recipients found.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {feedback && (
                      <div className={`rounded-lg border px-3 py-2 text-sm ${feedback.type === 'success'
 ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
 : 'border-rose-200 bg-rose-50 text-rose-700'
 }`}>
                        {feedback.message}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleSendNotification}
                        disabled={isSending}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Send size={16} />
                        {isSending ? 'Sending campaign...' : 'Send notification'}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/notifications/templates/design')}
                        className="px-4 py-3 bg-card border border-border text-muted-foreground rounded-lg text-sm font-semibold hover:bg-muted/60 transition-colors"
                        title="Design new template"
                      >
                        <Briefcase size={16} />
                      </button>
                    </div>
                  </div>
                </section>

                <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Campaign History</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Recent outbound communication history.</p>
                    </div>
                    <div className="relative w-full md:w-72">
                      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" size={15} />
                      <input
                        value={historySearch}
                        onChange={(event) => setHistorySearch(event.target.value)}
                        placeholder="Search history"
                        className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {isLoadingData && (
                      <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground/70">
                        Loading history...
                      </div>
                    )}

                    {!isLoadingData && filteredHistory.length === 0 && (
                      <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground/70">
                        No campaigns found.
                      </div>
                    )}

                    {!isLoadingData && filteredHistory.map((item) => (
                      <div key={item.id} className="rounded-xl border border-border p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                              <Badge>{item.type}</Badge>
                              <Badge variant={item.status === 'failed' ? 'danger' : 'neutral'}>{item.status}</Badge>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{item.message}</p>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-xs font-medium text-muted-foreground">{formatHistoryTime(item.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}

          {!isAdmin && (
            <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Inbox</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Recent workspace notifications.</p>
                </div>
              </div>

              <div className="space-y-3">
                {inboxItems.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground/70">
                    No notifications.
                  </div>
                )}

                {inboxItems.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                        <Bell size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                          {!item.read && <Badge variant="info">Unread</Badge>}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                        <p className="mt-2 text-xs text-muted-foreground/70">
                          {formatHistoryTime(item.timestamp || item.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
      {label}
    </label>
    {children}
  </div>
);

const StatCard = ({ icon, label, value }) => (
  <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
    <div className="flex items-center justify-between text-muted-foreground">
      <span className="text-xs font-semibold uppercase tracking-[0.08em]">{label}</span>
      {icon}
    </div>
    <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
  </div>
);

const Badge = ({ children, variant = 'info' }) => {
  const styles = {
    info: 'bg-primary/10 text-primary',
    neutral: 'bg-muted text-muted-foreground',
    danger: 'bg-rose-50 text-rose-700',
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${styles[variant] || styles.info}`}>
      {children}
    </span>
  );
};

export default NotificationsPage;
