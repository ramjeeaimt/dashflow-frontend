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

const getPreviewHtml = (title, message) => {
  const year = new Date().getFullYear();
  const footerImageUrl = 'https://res.cloudinary.com/dxju8ikk4/image/upload/v1777462000/difmo_footer_services.png';
  
  return `
    <div style="font-family: 'Inter', 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 20px 0; color: #1e293b; width: 100%;">
      <div style="width: 100%; max-width: 800px; margin: 0 auto; background-color: #ffffff; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="padding: 40px 20px; text-align: center; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff;">
          <div style="margin-bottom: 15px;">
            <span style="font-size: 20px; font-weight: 900; letter-spacing: 4px; color: #ffffff; text-transform: uppercase;">
              <span style="color: #f59e0b;">DIFMO</span>
            </span>
          </div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.2;">${title}</h1>
        </div>
        
        <div style="padding: 40px;">
          <div style="font-size: 16px; color: #334155; line-height: 1.8; margin-bottom: 30px;">
            ${message}
          </div>
          
          <div style="margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 30px; text-align: left;">
            <p style="margin: 0; font-weight: 700; color: #0f172a; font-size: 16px;">Team DIFMO</p>
          </div>
        </div>
        
        <div style="line-height: 0;">
          <img src="${footerImageUrl}" alt="DIFMO" style="width: 100%; height: auto; display: block;">
        </div>

        <div style="padding: 30px 20px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
            <tr>
              <td align="center">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 0 15px; text-align: center;">
                      <a href="mailto:info@difmo.com" style="text-decoration: none; color: #0f172a; font-size: 12px; font-weight: 700;">
                        <img src="https://cdn-icons-png.flaticon.com/512/732/732200.png" width="16" style="display: block; margin: 0 auto 5px auto;">
                        info@difmo.com
                      </a>
                    </td>
                    <td style="padding: 0 15px; text-align: center;">
                      <a href="https://www.difmo.com" style="text-decoration: none; color: #0f172a; font-size: 12px; font-weight: 700;">
                        <img src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" width="16" style="display: block; margin: 0 auto 5px auto;">
                        www.difmo.com
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          
          <div style="text-align: center;">
            <a href="#" style="display: inline-block; margin: 0 8px;">
              <img src="https://cdn-icons-png.flaticon.com/512/145/145807.png" width="20" height="20" alt="LinkedIn">
            </a>
            <a href="#" style="display: inline-block; margin: 0 8px;">
              <img src="https://cdn-icons-png.flaticon.com/512/145/145802.png" width="20" height="20" alt="Facebook">
            </a>
          </div>
        </div>
        
        <div style="padding: 30px; text-align: center; background-color: #f1f5f9; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 10px; color: #94a3b8; letter-spacing: 1px;">&copy; ${year} DIFMO PRIVATE LIMITED. ALL RIGHTS RESERVED.</p>
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
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({ name: '', title: '', message: '' });

  const isAdmin = user?.roles?.some((role) => ['Admin', 'Super Admin', 'Manager'].includes(role.name)) || user?.email === 'admin@difmo.com';
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
        sentFrom: 'notifications-page'
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
    <div className="min-h-screen bg-slate-50">
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                Communication Center
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                {isAdmin ? 'Notifications & Campaigns' : 'My Notifications'}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {isAdmin
                  ? 'Send email campaigns to employees, clients, or everyone and track delivery history.'
                  : 'Stay on top of alerts, payroll updates, and workflow activity.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                <CheckCheck size={16} />
                Mark all read
              </button>
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
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
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Compose Campaign</h2>
                      <p className="mt-1 text-sm text-slate-500">Use a standard broadcast flow to target the right audience.</p>
                    </div>
                    <button 
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Briefcase size={14} /> {showTemplates ? 'CLOSE TEMPLATES' : 'MY TEMPLATES'}
                    </button>
                  </div>

                  {showTemplates && (
                    <div className="mb-6 space-y-2 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between px-1 mb-2">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saved Templates</h3>
                        <button onClick={() => navigate('/notifications/templates/design')} className="text-[10px] font-bold text-blue-600 hover:underline">+ CREATE NEW</button>
                      </div>
                      {templates.length === 0 ? (
                        <p className="text-xs text-slate-400 italic p-2 text-center">No templates saved yet.</p>
                      ) : templates.map(tpl => (
                        <div key={tpl.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100 shadow-sm hover:border-blue-300 group">
                          <div className="cursor-pointer flex-1" onClick={() => handleLoadTemplate(tpl)}>
                            <p className="text-xs font-bold text-slate-800">{tpl.name || tpl.title}</p>
                            <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{tpl.title}</p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => navigate(`/notifications/templates/design/${tpl.id}`)} className="p-1.5 text-slate-400 hover:text-blue-600">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => handleDeleteTemplate(tpl.id)} className="p-1.5 text-slate-400 hover:text-rose-500">
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
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500"
                      />
                    </Field>

                    <Field label="Message">
                      <textarea
                        value={composeForm.message}
                        onChange={(event) => handleComposeChange('message', event.target.value)}
                        rows={6}
                        placeholder="Write the message content."
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500"
                      />
                    </Field>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Audience">
                        <select
                          value={composeForm.audience}
                          onChange={(event) => handleComposeChange('audience', event.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500"
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
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500"
                        >
                          <option value="email">Email only</option>
                          <option value="both">Email + in-app</option>
                          <option value="realtime">In-app only</option>
                        </select>
                      </Field>
                    </div>

                    {composeForm.audience !== 'all' && (
                      <Field label="Targeting">
                        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                          {[
                            { key: 'all', label: `All ${composeForm.audience}` },
                            { key: 'selected', label: 'Selected only' }
                          ].map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              onClick={() => handleComposeChange('selectionMode', option.key)}
                              className={`flex-1 rounded-md px-3 py-2 text-sm transition-colors ${composeForm.selectionMode === option.key
                                  ? 'bg-white font-semibold text-slate-900 shadow-sm'
                                  : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-slate-500">{audienceSummary}</p>
                      </Field>
                    )}

                    {composeForm.audience !== 'all' && composeForm.selectionMode === 'selected' && (
                      <div className="rounded-xl border border-slate-200">
                        <div className="border-b border-slate-200 p-3">
                          <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                            <input
                              value={recipientSearch}
                              onChange={(event) => setRecipientSearch(event.target.value)}
                              placeholder={`Search ${composeForm.audience}`}
                              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500"
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
                              <div key={recipientId} className="rounded-lg border border-transparent px-2 py-2 hover:border-slate-200 hover:bg-slate-50">
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
                            <div className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-400">
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
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Send size={16} />
                        {isSending ? 'Sending campaign...' : 'Send notification'}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/notifications/templates/design')}
                        className="px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                        title="Design new template"
                      >
                        <Briefcase size={16} />
                      </button>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Campaign History</h2>
                      <p className="mt-1 text-sm text-slate-500">Recent outbound communication history.</p>
                    </div>
                    <div className="relative w-full md:w-72">
                      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                      <input
                        value={historySearch}
                        onChange={(event) => setHistorySearch(event.target.value)}
                        placeholder="Search history"
                        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {isLoadingData && (
                      <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
                        Loading history...
                      </div>
                    )}

                    {!isLoadingData && filteredHistory.length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
                        No campaigns found.
                      </div>
                    )}

                    {!isLoadingData && filteredHistory.map((item) => (
                      <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                              <Badge>{item.type}</Badge>
                              <Badge variant={item.status === 'failed' ? 'danger' : 'neutral'}>{item.status}</Badge>
                            </div>
                            <p className="mt-2 text-sm text-slate-600">{item.message}</p>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-xs font-medium text-slate-500">{formatHistoryTime(item.createdAt)}</p>
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
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Inbox</h2>
                  <p className="mt-1 text-sm text-slate-500">Recent workspace notifications.</p>
                </div>
              </div>

              <div className="space-y-3">
                {inboxItems.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
                    No notifications.
                  </div>
                )}

                {inboxItems.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-lg bg-blue-50 p-2 text-blue-600">
                        <Bell size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                          {!item.read && <Badge variant="info">Unread</Badge>}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                        <p className="mt-2 text-xs text-slate-400">
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
    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
      {label}
    </label>
    {children}
  </div>
);

const StatCard = ({ icon, label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between text-slate-500">
      <span className="text-xs font-semibold uppercase tracking-[0.08em]">{label}</span>
      {icon}
    </div>
    <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
  </div>
);

const Badge = ({ children, variant = 'info' }) => {
  const styles = {
    info: 'bg-blue-50 text-blue-700',
    neutral: 'bg-slate-100 text-slate-600',
    danger: 'bg-rose-50 text-rose-700',
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${styles[variant] || styles.info}`}>
      {children}
    </span>
  );
};

export default NotificationsPage;
