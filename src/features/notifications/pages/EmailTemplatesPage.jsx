import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Search, Plus, Pencil, Trash2, Layout, Calendar,
  Clock, ChevronRight, Filter, Crown, CheckCircle2, Sparkles
} from 'lucide-react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import useAuthStore from '../../../store/useAuthStore';
import api from '../../../api/client';
import toast from 'react-hot-toast';

const EmailTemplatesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [globalActiveTemplateId, setGlobalActiveTemplateId] = useState(
    user?.company?.activeEmailTemplateId || 'default'
  );

  // Sync global active template when user data changes
  useEffect(() => {
    setGlobalActiveTemplateId(user?.company?.activeEmailTemplateId || 'default');
  }, [user]);

  const handleSetGlobal = async (id) => {
    const companyId = user?.company?.id || user?.companyId;
    if (!companyId) return;

    try {
      setGlobalActiveTemplateId(id);
      await api.patch(`/system-company/${companyId}`, {
        activeEmailTemplateId: id === 'default' ? null : id,
      });

      if (id === 'default') {
        localStorage.removeItem('global_active_template_id');
      } else {
        localStorage.setItem('global_active_template_id', id);
      }

      const updatedUser = {
        ...user,
        company: { ...user.company, activeEmailTemplateId: id === 'default' ? null : id },
      };
      useAuthStore.setState({ user: updatedUser });
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success(id === 'default' ? 'Reset to Default System Layout' : 'Global active layout updated');
    } catch (err) {
      console.error('Failed to set global template', err);
      toast.error('Failed to set global template');
    }
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await api.get('/email-templates');
        let fetchedTemplates = res.data;
        if (fetchedTemplates && fetchedTemplates.data && Array.isArray(fetchedTemplates.data)) {
          fetchedTemplates = fetchedTemplates.data;
        } else if (fetchedTemplates && fetchedTemplates.templates && Array.isArray(fetchedTemplates.templates)) {
          fetchedTemplates = fetchedTemplates.templates;
        }
        setTemplates(Array.isArray(fetchedTemplates) ? fetchedTemplates : []);
      } catch (err) {
        console.error('Failed to load templates', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await api.delete(`/email-templates/${id}`);
      const updated = templates.filter((t) => t.id !== id);
      setTemplates(updated);

      if (globalActiveTemplateId === id.toString()) {
        handleSetGlobal('default');
      }
      toast.success('Template deleted');
    } catch (err) {
      console.error('Failed to delete template', err);
      toast.error('Failed to delete template');
    }
  };

  const filteredTemplates = templates.filter((t) =>
    `${t?.name || ''} ${t?.title || ''}`.toLowerCase().includes((search || '').toLowerCase())
  );

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Notifications', path: '/notifications' },
    { label: 'Email Templates', path: '/notifications/templates' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={() => setIsMobileSidebarOpen(true)} />
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className="transition-all duration-300 lg:ml-60 pt-16 pb-12">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Breadcrumb & Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <BreadcrumbNavigation items={breadcrumbs} />
              <div className="flex items-center gap-2.5 mt-1">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-display font-semibold tracking-tight text-foreground">
                    Email Templates
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Manage branded layouts, payroll notification formats, and automated messages
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/notifications/templates/design')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-xs hover:bg-primary/90 transition-all flex items-center gap-1.5 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Design New Template</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card rounded-2xl border border-border p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Templates</p>
                <p className="text-2xl font-bold font-data text-foreground mt-1">{templates.length}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Custom created layouts</p>
              </div>
              <div className="w-11 h-11 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <Layout className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Email Channel</p>
                <p className="text-2xl font-bold font-data text-emerald-600 dark:text-emerald-400 mt-1">
                  {templates.filter((t) => t?.type === 'email' || !t?.type).length}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Active automated channels</p>
              </div>
              <div className="w-11 h-11 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Recently Updated</p>
                <p className="text-base font-bold text-foreground mt-1 truncate">
                  {templates.length > 0 && templates[0]?.createdAt
                    ? new Date(templates[0].createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Default active'}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Latest template modification</p>
              </div>
              <div className="w-11 h-11 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Global Active Layout Configurator Card */}
          <div className="p-5 sm:p-6 bg-card rounded-2xl border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-300 dark:border-amber-700/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    Global Email Branding Layout
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                    System Default
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
                  Choose which layout format is used by default for all system notifications, attendance alerts, and salary slip email dispatches.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
              <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                Active Layout:
              </span>
              <select
                value={globalActiveTemplateId}
                onChange={(e) => handleSetGlobal(e.target.value)}
                className="bg-background border border-border text-foreground rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer min-w-[240px] shadow-2xs"
              >
                <option value="default">Default System Layout (Standard)</option>
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id.toString()}>
                    {tpl.name || tpl.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates by title, subject, or keywords..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="text-xs text-muted-foreground font-medium self-end sm:self-center">
              Showing {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-card border border-border rounded-2xl animate-pulse" />
              ))
            ) : filteredTemplates.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-card rounded-2xl border border-dashed border-border shadow-xs">
                <div className="mx-auto w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mb-3 text-muted-foreground">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-foreground">No templates found</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  {search
                    ? 'No templates match your search keyword. Try clearing the filter.'
                    : 'Start by creating your first corporate email template.'}
                </p>
                <button
                  onClick={() => navigate('/notifications/templates/design')}
                  className="mt-4 px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-xl shadow-xs hover:bg-primary/90 transition-all inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Design Template</span>
                </button>
              </div>
            ) : (
              filteredTemplates.map((tpl) => {
                const isActive = globalActiveTemplateId === tpl?.id?.toString();
                if (!tpl) return null;

                return (
                  <div
                    key={tpl.id}
                    className={`group bg-card rounded-2xl border ${
                      isActive ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-sm' : 'border-border'
                    } shadow-xs hover:shadow-sm hover:border-primary/40 transition-all overflow-hidden flex flex-col justify-between`}
                  >
                    {isActive && (
                      <div className="bg-amber-500/15 border-b border-amber-300 dark:border-amber-700/60 px-4 py-1.5 text-center text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
                        <Crown className="w-3.5 h-3.5" />
                        <span>Global Active Layout</span>
                      </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
                            {tpl.type || 'Email'}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSetGlobal(isActive ? 'default' : tpl.id.toString())}
                              className={`p-1.5 rounded-lg transition-all ${
                                isActive
                                  ? 'text-amber-600 bg-amber-500/15'
                                  : 'text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10'
                              }`}
                              title={isActive ? 'Deactivate Global Layout' : 'Set as Global Active Layout'}
                            >
                              <Crown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate(`/notifications/templates/design/${tpl.id}`)}
                              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                              title="Edit Template"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(tpl.id)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                              title="Delete Template"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {tpl?.name || 'Unnamed Template'}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 italic">
                          "{tpl?.title || 'No Subject Line'}"
                        </p>

                        <div
                          className="text-xs text-muted-foreground/80 line-clamp-3 mt-3 min-h-[48px] bg-muted/30 p-2.5 rounded-xl border border-border/50 text-ellipsis overflow-hidden"
                          dangerouslySetInnerHTML={{ __html: tpl?.message || '<i>No preview content available</i>' }}
                        />
                      </div>

                      <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(tpl.createdAt).toLocaleDateString()}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigate(`/notifications/templates/design/${tpl.id}`)}
                          className="font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          <span>Edit</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailTemplatesPage;
