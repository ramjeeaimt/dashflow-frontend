import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Search, Plus, Pencil, Trash2, Layout, Calendar, Clock, ChevronRight, Filter, Crown } from 'lucide-react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import useAuthStore from '../../../store/useAuthStore';
import api from '../../../api/client';
import { isAdminUser } from '../../../config/roles';

const EmailTemplatesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [globalActiveTemplateId, setGlobalActiveTemplateId] = useState(user?.company?.activeEmailTemplateId || 'default');

  // Sync global active template when user data changes
  useEffect(() => {
    setGlobalActiveTemplateId(user?.company?.activeEmailTemplateId || 'default');
  }, [user]);

  const handleSetGlobal = async (id) => {
    try {
      setGlobalActiveTemplateId(id);
      await api.patch(`/system-company/${user.company.id}`, { activeEmailTemplateId: id === 'default' ? null : id });

      // Sync to localStorage for other components (e.g., PayrollPage)
      if (id === 'default') {
        localStorage.removeItem('global_active_template_id');
      } else {
        localStorage.setItem('global_active_template_id', id);
      }

      const updatedUser = { ...user, company: { ...user.company, activeEmailTemplateId: id === 'default' ? null : id } };
      useAuthStore.setState({ user: updatedUser });
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Failed to set global template', err);
    }
  };

  const isAdmin = isAdminUser(user);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await api.get('/email-templates');
        let fetchedTemplates = res.data;
        // Unwrap nested data if backend or interceptor wrapped it unexpectedly
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
      const updated = templates.filter(t => t.id !== id);
      setTemplates(updated);

      if (globalActiveTemplateId === id.toString()) {
        handleSetGlobal('default');
      }
    } catch (err) {
      console.error('Failed to delete template', err);
    }
  };

  const filteredTemplates = templates.filter(t =>
    `${t?.name || ''} ${t?.title || ''}`.toLowerCase().includes((search || '').toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/60">
      <Header onToggleSidebar={() => setIsMobileSidebarOpen(true)} />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-8`}>
        <div className="mx-auto max-w-7xl p-4 sm:p-6">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
                Marketing & Communications
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-foreground">
                Email Templates
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your branded email templates for campaigns and automated alerts.
              </p>
            </div>

            <button
              onClick={() => navigate('/notifications/templates/design')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-sm hover:bg-primary/90 transition-all "
            >
              <Plus size={18} /> Design New Template
            </button>
          </div>

          {/* Stats / Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Layout size={20} />
                </div>
                <h3 className="text-sm font-bold text-foreground">Total Templates</h3>
              </div>
              <p className="text-3xl font-bold text-foreground">{templates.length}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Mail size={20} />
                </div>
                <h3 className="text-sm font-bold text-foreground">Email Channel</h3>
              </div>
              <p className="text-3xl font-bold text-foreground">{templates.filter(t => t?.type === 'email').length}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Clock size={20} />
                </div>
                <h3 className="text-sm font-bold text-foreground">Recently Updated</h3>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {templates.length > 0 && templates[0]?.createdAt ? new Date(templates[0].createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          {/* ========== NEW: Global Active Layout Configurator ========== */}
          <div className="mb-8 p-6 bg-sidebar rounded-lg border border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                <Crown size={28} className="fill-amber-400/20 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Global Email Branding Layout
                </h2>
                <p className="text-xs text-muted-foreground/70 mt-1 max-w-[500px]">
                  Choose which layout format is used by default for all system notifications, alerts, and salary payroll releases.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground/70 whitespace-nowrap">Active Layout:</span>
              <select
                value={globalActiveTemplateId}
                onChange={(e) => handleSetGlobal(e.target.value)}
                className="bg-sidebar border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer min-w-[240px]"
              >
                <option value="default">Default System Layout (Standard)</option>
                {templates.map(tpl => (
                  <option key={tpl.id} value={tpl.id.toString()}>
                    Created Format: {tpl.name || tpl.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70" size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or subject..."
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:border-primary focus:ring-4 focus:ring-ring transition-all outline-none"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/60 transition-colors">
              <Filter size={18} /> Filter
            </button>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-border rounded-lg animate-pulse" />
              ))
            ) : filteredTemplates.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-card rounded-lg border border-dashed border-border">
                <div className="mx-auto w-16 h-16 bg-muted/60 rounded-full flex items-center justify-center mb-4">
                  <Mail size={32} className="text-muted-foreground/70" />
                </div>
                <h3 className="text-lg font-bold text-foreground">No templates found</h3>
                <p className="text-muted-foreground mt-2">Start by designing your first corporate email template.</p>
                <button
                  onClick={() => navigate('/notifications/templates/design')}
                  className="mt-6 text-primary font-bold hover:underline"
                >
                  Create one now &rarr;
                </button>
              </div>
            ) : (
              filteredTemplates.map(tpl => {
                const isActive = globalActiveTemplateId === tpl?.id?.toString();
                if (!tpl) return null;
                return (
                  <div key={tpl.id || Math.random()} className={`group bg-card rounded-lg border ${isActive ? 'border-amber-400 shadow-sm ring-2 ring-amber-500/10' : 'border-border'} shadow-sm hover:shadow-sm hover:border-border transition-all overflow-hidden flex flex-col`}>
                    {isActive && (
                      <div className="bg-amber-500 px-4 py-1.5 text-center text-[10px] font-semibold text-foreground uppercase tracking-wide flex items-center justify-center gap-1">
                        <Crown size={10} className="fill-slate-900" /> Global Active Layout
                      </div>
                    )}
                    <div className="p-6 flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
                          {tpl.type || 'Email'}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleSetGlobal(isActive ? 'default' : tpl.id.toString())}
                            className={`p-2 rounded-lg transition-all ${isActive ? 'text-amber-500 hover:text-amber-600 bg-amber-50' : 'text-muted-foreground/70 hover:text-amber-500 hover:bg-muted/60'}`}
                            title={isActive ? "Deactivate Global Layout" : "Set as Global Active Layout"}
                          >
                            <Crown size={16} />
                          </button>
                          <button
                            onClick={() => navigate(`/notifications/templates/design/${tpl.id}`)}
                            className="p-2 text-muted-foreground/70 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(tpl.id)}
                            className="p-2 text-muted-foreground/70 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">{tpl?.name || 'Unnamed Template'}</h3>
                      <p className="text-xs font-medium text-muted-foreground mb-4 line-clamp-1 italic">"{tpl?.title || 'No Title'}"</p>
                      <div className="text-sm text-muted-foreground line-clamp-3 mb-6 min-h-[60px]" dangerouslySetInnerHTML={{ __html: tpl?.message || '' }} />
                    </div>
                    <div className="px-6 py-4 bg-muted/60 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                        <Calendar size={14} />
                        {new Date(tpl.createdAt).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => navigate(`/notifications/templates/design/${tpl.id}`)}
                        className="text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all"
                      >
                        EDIT TEMPLATE <ChevronRight size={14} />
                      </button>
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
