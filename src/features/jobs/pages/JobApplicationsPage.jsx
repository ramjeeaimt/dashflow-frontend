import React, { useState, useEffect } from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Icon from '../../../components/AppIcon';
import apiClient from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';

// applications will be loaded from backend

const ALL_STATUSES = ['ALL', 'PENDING', 'REVIEWED', 'SHORTLISTED', 'CALL DONE', 'INTERVIEW DONE', 'GOOGLE MEET DONE', 'SELECTED', 'REJECTED'];

const STATUS_CONFIG = {
  PENDING:          { cls: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', icon: 'Clock' },
  REVIEWED:         { cls: 'bg-blue-50 text-blue-600 border-blue-200',   dot: 'bg-blue-500',   icon: 'Eye' },
  SHORTLISTED:      { cls: 'bg-violet-50 text-violet-600 border-violet-200', dot: 'bg-violet-500', icon: 'Star' },
  'CALL DONE':      { cls: 'bg-cyan-50 text-cyan-600 border-cyan-200',   dot: 'bg-cyan-500',   icon: 'Phone' },
  'INTERVIEW DONE': { cls: 'bg-amber-50 text-amber-600 border-amber-200', dot: 'bg-amber-500', icon: 'Users' },
  'GOOGLE MEET DONE':{ cls: 'bg-indigo-50 text-indigo-600 border-indigo-200', dot: 'bg-indigo-500', icon: 'Video' },
  SELECTED:         { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: 'CheckCircle' },
  REJECTED:         { cls: 'bg-red-50 text-red-600 border-red-200',      dot: 'bg-red-400',    icon: 'XCircle' },
};

const AVATAR_COLORS = ['bg-primary', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500', 'bg-rose-500'];

const EMPTY_CANDIDATE = { job: '', name: '', email: '', phone: '', experience: '', location: '' };

export default function JobApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filter, setFilter] = useState({ status: 'ALL', query: '' });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [candidate, setCandidate] = useState(EMPTY_CANDIDATE);
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('table'); // 'table' | 'kanban'
  const [jobs, setJobs] = useState([]);

  useEffect(() => { fetchApps(); fetchJobs(); }, []);

  async function fetchJobs() {
    try {
      const res = await apiClient.get(API_ENDPOINTS.JOBS.BASE);
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error('Fetch jobs failed', err); }
  }

  async function fetchApps() {
    try {
      const res = await apiClient.get(API_ENDPOINTS.JOBS.APPLICATIONS);
      setApps(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error('Fetch applications failed', err); }
  }

  const filtered = apps.filter(a => {
    const q = filter.query.toLowerCase();
    const role = a.job?.title || a.jobTitle || '';
    const name = a.fullName || a.name || '';
    const matchQ = !q || name.toLowerCase().includes(q) || role.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
    const matchS = filter.status === 'ALL' || a.status === filter.status;
    return matchQ && matchS;
  });

  async function addCandidate(e) {
    e.preventDefault();
    try {
      // If candidate.job is a job title, try to find jobId from jobs list
      let jobId = candidate.job;
      if (jobs.length > 0) {
        const found = jobs.find(j => j.title === candidate.job || j.id === candidate.job);
        if (found) jobId = found.id;
      }
      const payload = {
        fullName: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        experience: candidate.experience,
        location: candidate.location,
      };
      if (jobId) {
        await apiClient.post(API_ENDPOINTS.JOBS.CREATE_APPLICATION(jobId), payload);
      } else {
        // fallback to generic endpoint if available (not implemented)
        await apiClient.post(API_ENDPOINTS.JOBS.APPLICATIONS, { ...payload, jobTitle: candidate.job });
      }
      await fetchApps();
      setIsAddOpen(false);
      setCandidate(EMPTY_CANDIDATE);
    } catch (err) {
      console.error('Failed to add candidate', err);
    }
  }

  async function changeStatus(id, newStatus) {
    try {
      await apiClient.patch(API_ENDPOINTS.JOBS.BASE + `/applications/${id}/status`, { status: newStatus });
      await fetchApps();
      if (selected?.id === id) {
        setSelected(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  }

  const stats = [
    { label: 'Total Applications', value: apps.length, color: 'bg-primary/10 text-primary', icon: 'ClipboardList' },
    { label: 'Shortlisted', value: apps.filter(a => a.status === 'SHORTLISTED').length, color: 'bg-violet-100 text-violet-600', icon: 'Star' },
    { label: 'Selected', value: apps.filter(a => a.status === 'SELECTED').length, color: 'bg-emerald-100 text-emerald-600', icon: 'CheckCircle' },
    { label: 'Rejected', value: apps.filter(a => a.status === 'REJECTED').length, color: 'bg-red-100 text-red-600', icon: 'XCircle' },
  ];

  // Kanban columns
  const KANBAN_COLS = ['PENDING', 'REVIEWED', 'SHORTLISTED', 'CALL DONE', 'INTERVIEW DONE', 'GOOGLE MEET DONE', 'SELECTED', 'REJECTED'];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(s => !s)} />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-20 lg:pb-8`}>
        <div className="p-6 max-w-7xl mx-auto">

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Icon name="LayoutDashboard" size={14} />
                <span>Dashboard</span>
                <Icon name="ChevronRight" size={14} />
                <span className="text-foreground font-medium">Applications</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Job Applications</h1>
              <p className="text-muted-foreground mt-1">Review and manage all candidate applications</p>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-md shadow-primary/20"
            >
              <Icon name="UserPlus" size={18} />
              Add Candidate
            </button>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {stats.map((s, i) => (
              <div key={i} className="bg-card border border-border/50 rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon name={s.icon} size={22} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Toolbar ── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-in fade-in duration-700">
            <div className="relative flex-1">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, role, or email..."
                value={filter.query}
                onChange={e => setFilter(f => ({ ...f, query: e.target.value }))}
                className="w-full pl-9 pr-4 py-2.5 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <select
              value={filter.status}
              onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
              className="px-4 py-2.5 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
            >
              {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            {/* View toggle */}
            <div className="flex items-center bg-card border border-border/60 rounded-xl overflow-hidden">
              {[['table', 'LayoutList'], ['kanban', 'Columns']].map(([v, icon]) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all ${view === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
                >
                  <Icon name={icon} size={15} />
                  <span className="capitalize">{v}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Table View ── */}
          {view === 'table' && (
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-500">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/30">
                      {['Candidate', 'Applied For', 'Contact', 'Status', 'Date', 'Actions'].map(h => (
                        <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filtered.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-16 text-muted-foreground">No applications found</td></tr>
                    ) : filtered.map((app, idx) => {
                      const sc = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING;
                      const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                      return (
                        <tr key={app.id} className="hover:bg-muted/20 transition-colors group">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                {app.avatar}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{app.fullName || app.name}</p>
                                <p className="text-xs text-muted-foreground">{app.experience} exp · {app.location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm font-medium text-foreground">{app.job?.title || app.jobTitle || 'N/A'}</span>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-xs text-muted-foreground">{app.email}</p>
                            <p className="text-xs text-muted-foreground">{app.phone}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.cls}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                              {app.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs text-muted-foreground">{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : (app.date || 'N/A')}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelected(app)}
                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                title="View Details"
                              >
                                <Icon name="Eye" size={15} />
                              </button>
                              <select
                                value={app.status}
                                onChange={e => changeStatus(app.id, e.target.value)}
                                className="text-xs px-2 py-1 border border-border/60 rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
                              >
                                {ALL_STATUSES.filter(s => s !== 'ALL').map(s => <option key={s}>{s}</option>)}
                              </select>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Kanban View ── */}
          {view === 'kanban' && (
            <div className="overflow-x-auto pb-4 animate-in fade-in duration-500">
              <div className="flex gap-4 min-w-max">
                {KANBAN_COLS.map(col => {
                  const colApps = filtered.filter(a => a.status === col);
                  const sc = STATUS_CONFIG[col] || STATUS_CONFIG.PENDING;
                  return (
                    <div key={col} className="w-64 flex-shrink-0">
                      <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-xl border ${sc.cls}`}>
                        <Icon name={sc.icon} size={13} />
                        <span className="text-xs font-bold uppercase tracking-wide">{col}</span>
                        <span className="ml-auto text-xs font-bold">{colApps.length}</span>
                      </div>
                      <div className="space-y-3">
                        {colApps.length === 0 ? (
                          <div className="bg-card border border-dashed border-border/50 rounded-xl p-4 text-center text-xs text-muted-foreground">Empty</div>
                        ) : colApps.map((app, idx) => {
                          const avatarColor = AVATAR_COLORS[apps.indexOf(app) % AVATAR_COLORS.length];
                          return (
                            <div key={app.id} className="bg-card border border-border/50 rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" onClick={() => setSelected(app)}>
                              <div className="flex items-center gap-2.5 mb-2">
                                <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold`}>{app.avatar}</div>
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{app.fullName || app.name}</p>
                                  <p className="text-xs text-muted-foreground">{app.experience}</p>
                                </div>
                              </div>
                              <p className="text-xs font-medium text-primary mb-1">{app.job?.title || app.jobTitle || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground">{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : (app.date || 'N/A')}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Candidate Detail Drawer ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-card w-full max-w-md h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right-full duration-300">
            <div className="p-6 border-b border-border/40 flex items-center justify-between sticky top-0 bg-card z-10">
              <h3 className="font-bold text-lg text-foreground">Candidate Profile</h3>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <Icon name="X" size={18} className="text-muted-foreground" />
              </button>
            </div>
            <div className="p-6">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl ${AVATAR_COLORS[apps.indexOf(selected) % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xl font-bold`}>
                  {selected.avatar}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-foreground">{selected.name}</h4>
                  <p className="text-sm text-muted-foreground">{selected.job}</p>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 mt-1 rounded-full border ${(STATUS_CONFIG[selected.status] || STATUS_CONFIG.PENDING).cls}`}>
                    {selected.status}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6">
                {[
                  { icon: 'Mail', label: 'Email', value: selected.email },
                  { icon: 'Phone', label: 'Phone', value: selected.phone || 'N/A' },
                  { icon: 'MapPin', label: 'Location', value: selected.location || 'N/A' },
                  { icon: 'Briefcase', label: 'Experience', value: selected.experience || 'N/A' },
                  { icon: 'CalendarDays', label: 'Applied On', value: selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : (selected.date || 'N/A') },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name={item.icon} size={15} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                      <p className="text-sm font-semibold text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Update Status */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Update Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_STATUSES.filter(s => s !== 'ALL').map(s => {
                    const sc = STATUS_CONFIG[s] || STATUS_CONFIG.PENDING;
                    const isActive = selected.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => changeStatus(selected.id, s)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${isActive ? sc.cls + ' ring-2 ring-offset-1 ring-current' : 'bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/50'}`}
                      >
                        <Icon name={sc.icon} size={12} />
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Candidate Modal ── */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border/60 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border/40">
              <div>
                <h3 className="text-xl font-bold text-foreground">Add Candidate</h3>
                <p className="text-sm text-muted-foreground">Manually add a new application</p>
              </div>
              <button onClick={() => { setIsAddOpen(false); setCandidate(EMPTY_CANDIDATE); }} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <Icon name="X" size={20} className="text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={addCandidate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Job Role *</label>
                  <select
                    required
                    value={candidate.job}
                    onChange={e => setCandidate(c => ({ ...c, job: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="">Select a Job Posting</option>
                    {jobs.map(j => (
                      <option key={j.id || j._id} value={j.id || j._id}>{j.title} ({j.department || j.dept})</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Candidate Full Name *</label>
                  <input
                    required
                    placeholder="e.g. Alice Smith"
                    value={candidate.name}
                    onChange={e => setCandidate(c => ({ ...c, name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Email *</label>
                  <input
                    required
                    type="email"
                    placeholder="candidate@email.com"
                    value={candidate.email}
                    onChange={e => setCandidate(c => ({ ...c, email: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Phone Number</label>
                  <input
                    placeholder="+91 98765 43210"
                    value={candidate.phone}
                    onChange={e => setCandidate(c => ({ ...c, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Experience</label>
                  <input
                    placeholder="e.g. 2.5 years"
                    value={candidate.experience}
                    onChange={e => setCandidate(c => ({ ...c, experience: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Current Location</label>
                  <input
                    placeholder="e.g. Pune, Remote"
                    value={candidate.location}
                    onChange={e => setCandidate(c => ({ ...c, location: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setIsAddOpen(false); setCandidate(EMPTY_CANDIDATE); }} className="px-5 py-2.5 border border-border/60 rounded-xl text-sm font-semibold hover:bg-muted/50 transition-all">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20">Add Candidate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
