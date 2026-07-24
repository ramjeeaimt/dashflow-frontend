import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users, Activity, Clock, Home, RefreshCw, Loader2, Camera, Video, BarChart3,
  LayoutGrid, TrendingUp, Info,
} from 'lucide-react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import { employeeService } from '../../../services/employee.service';
import timeTrackingService from '../../../services/time-tracking.service';
import useAuthStore from '../../../store/useAuthStore';
import WorkModeBadge, { policyFromEmployee } from '../../attendance/components/WorkModeBadge';
import { initials } from '../../tasks/taskConstants';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'activity', label: 'Activity', icon: BarChart3 },
  { id: 'benchmarks', label: 'Benchmarks', icon: TrendingUp },
  { id: 'screenshots', label: 'Screenshots', icon: Camera },
  { id: 'camera', label: 'Camera', icon: Video },
];

const fmtHours = (h) => `${(Number(h) || 0).toFixed(1)}h`;
const fmtTime = (d) => (d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null);

const MonitoringDashboard = () => {
  const { user } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [employees, setEmployees] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [deptFilter, setDeptFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');

  const load = useCallback(async () => {
    if (!user?.company?.id) return;
    setLoading(true);
    try {
      const [emps, teamData] = await Promise.allSettled([
        employeeService.getAll(user.company.id),
        timeTrackingService.getTeamSummary(user.company.id),
      ]);
      if (emps.status === 'fulfilled') setEmployees(emps.value || []);
      if (teamData.status === 'fulfilled') setTeam(teamData.value || []);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, [user?.company?.id]);

  useEffect(() => { load(); }, [load]);

  const teamById = useMemo(() => {
    const m = new Map();
    for (const t of team) m.set(t.employeeId, t);
    return m;
  }, [team]);

  // Merge each employee with their live tracking row + resolved work mode.
  const rows = useMemo(() => {
    return employees
      .map((emp) => {
        const t = teamById.get(emp.id);
        const policy = policyFromEmployee(emp);
        return {
          id: emp.id,
          name: `${emp.user?.firstName || ''} ${emp.user?.lastName || ''}`.trim() || emp.email || 'Unknown',
          department: emp.department?.name || '—',
          avatar: emp.avatar || null,
          policy,
          isWfh: policy?.mode === 'permanent' || policy?.mode === 'hybrid',
          active: t?.active || false,
          hoursToday: t?.todayHours || 0,
          currentTask: t?.currentTask || null,
          lastActivity: t?.lastActivity || null,
        };
      })
      .filter((r) => (!deptFilter || r.department === deptFilter))
      .filter((r) => (!modeFilter || (modeFilter === 'wfh' ? r.isWfh : !r.isWfh)));
  }, [employees, teamById, deptFilter, modeFilter]);

  const stats = useMemo(() => ({
    total: employees.length,
    active: rows.filter((r) => r.active).length,
    hoursToday: Math.round(rows.reduce((s, r) => s + r.hoursToday, 0) * 10) / 10,
    wfh: employees.filter((e) => { const p = policyFromEmployee(e); return p?.mode === 'permanent' || p?.mode === 'hybrid'; }).length,
  }), [employees, rows]);

  const departments = useMemo(
    () => [...new Set(employees.map((e) => e.department?.name).filter(Boolean))],
    [employees],
  );

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Monitoring', path: '/monitoring-dashboard' },
  ];
  const selectClass = 'px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-ring outline-none transition-colors';

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={() => setIsMobileSidebarOpen((v) => !v)} />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <main className={`pt-16 pb-10 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        <div className="p-4 sm:p-6 max-w-[1500px] mx-auto space-y-5">
          <BreadcrumbNavigation items={breadcrumbItems} />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">Monitoring</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Live team status from attendance, work mode and time tracking.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock size={13} /> Updated {fmtTime(lastUpdated)}
                </span>
              )}
              <button onClick={load} className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors">
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className={selectClass}>
              <option value="">All departments</option>
              {departments.map((d) => (<option key={d} value={d}>{d}</option>))}
            </select>
            <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)} className={selectClass}>
              <option value="">All work modes</option>
              <option value="wfh">Work from home</option>
              <option value="office">Office</option>
            </select>
          </div>

          {/* Stat tiles — all real */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile icon={<Users size={18} />} label="Total employees" value={stats.total} tone="primary" />
            <StatTile icon={<Activity size={18} />} label="Tracking now" value={stats.active} tone="success" />
            <StatTile icon={<Clock size={18} />} label="Hours tracked today" value={fmtHours(stats.hoursToday)} tone="warning" />
            <StatTile icon={<Home size={18} />} label="WFH employees" value={stats.wfh} tone="muted" />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border overflow-x-auto">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
                    activeTab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}>
                  <Icon size={15} /> {t.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 size={26} className="text-primary animate-spin" /></div>
          ) : activeTab === 'overview' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {rows.map((r) => <EmployeeCard key={r.id} row={r} />)}
              {rows.length === 0 && <p className="text-sm text-muted-foreground col-span-full py-10 text-center">No employees match these filters.</p>}
            </div>
          ) : activeTab === 'activity' ? (
            <ActivityView rows={rows} />
          ) : activeTab === 'benchmarks' ? (
            <BenchmarkView rows={rows} />
          ) : (
            <AgentRequired kind={activeTab} />
          )}
        </div>
      </main>
    </div>
  );
};

const TONES = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  muted: 'bg-muted text-muted-foreground',
};
const StatTile = ({ icon, label, value, tone }) => (
  <div className="bg-card border border-border rounded-xl p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-2xl font-semibold text-foreground tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${TONES[tone]}`}>{icon}</span>
    </div>
  </div>
);

const EmployeeCard = ({ row }) => (
  <div className="bg-card border border-border rounded-xl p-4">
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex items-center justify-center text-xs font-medium text-muted-foreground">
            {row.avatar ? <img src={row.avatar} alt={row.name} className="w-full h-full object-cover" /> : initials(row.name)}
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-card ${row.active ? 'bg-success' : 'bg-muted-foreground/40'}`} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{row.name}</p>
          <p className="text-xs text-muted-foreground truncate">{row.department}</p>
        </div>
      </div>
      <WorkModeBadge policy={row.policy} hideOffice />
    </div>

    <div className="grid grid-cols-2 gap-3 mt-4">
      <div>
        <p className="text-lg font-semibold text-foreground tabular-nums">{fmtHours(row.hoursToday)}</p>
        <p className="text-xs text-muted-foreground">Tracked today</p>
      </div>
      <div>
        <p className={`text-sm font-medium ${row.active ? 'text-success' : 'text-muted-foreground'}`}>
          {row.active ? 'Tracking' : 'Idle'}
        </p>
        <p className="text-xs text-muted-foreground">
          {row.lastActivity ? `Last ${fmtTime(row.lastActivity)}` : 'No activity'}
        </p>
      </div>
    </div>

    <div className="mt-3 pt-3 border-t border-border">
      <p className="text-xs text-muted-foreground">Current task</p>
      <p className="text-sm text-foreground truncate">{row.currentTask || '—'}</p>
    </div>
  </div>
);

const ActivityView = ({ rows }) => {
  const sorted = [...rows].sort((a, b) => b.hoursToday - a.hoursToday);
  const max = Math.max(0.1, ...sorted.map((r) => r.hoursToday));
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Hours tracked today by employee</h3>
      {sorted.every((r) => r.hoursToday === 0) ? (
        <p className="text-sm text-muted-foreground">No time tracked yet today.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((r) => (
            <div key={r.id} className="flex items-center gap-3">
              <span className="w-32 shrink-0 text-sm text-foreground truncate">{r.name}</span>
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${r.active ? 'bg-success' : 'bg-primary'}`} style={{ width: `${(r.hoursToday / max) * 100}%` }} />
              </div>
              <span className="w-12 text-right text-sm text-muted-foreground tabular-nums">{fmtHours(r.hoursToday)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BenchmarkView = ({ rows }) => {
  const ranked = [...rows].sort((a, b) => b.hoursToday - a.hoursToday);
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {['#', 'Employee', 'Department', 'Work mode', 'Status', 'Hours today'].map((h) => (
              <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {ranked.map((r, i) => (
            <tr key={r.id} className="hover:bg-muted/40 transition-colors">
              <td className="px-4 py-3 text-sm text-muted-foreground tabular-nums">{i + 1}</td>
              <td className="px-4 py-3 text-sm font-medium text-foreground">{r.name}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{r.department}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{r.policy?.label || 'Office'}</td>
              <td className="px-4 py-3 text-sm">
                {r.active ? <span className="text-success">Tracking</span> : <span className="text-muted-foreground">Idle</span>}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-foreground tabular-nums">{fmtHours(r.hoursToday)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Screenshot and webcam capture require a desktop agent running on each
 * employee's machine — there's no honest way to synthesise that from server
 * data, so we say so plainly instead of showing fabricated feeds.
 */
const AgentRequired = ({ kind }) => (
  <div className="bg-card border border-border rounded-xl p-10 flex flex-col items-center text-center">
    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 text-muted-foreground">
      {kind === 'camera' ? <Video size={22} /> : <Camera size={22} />}
    </div>
    <h3 className="text-base font-medium text-foreground mb-1">
      {kind === 'camera' ? 'Camera monitoring' : 'Screenshot capture'} needs a desktop agent
    </h3>
    <p className="text-sm text-muted-foreground max-w-md mb-4">
      {kind === 'camera'
        ? 'Live webcam feeds can only come from a monitoring agent installed on each employee device, with their consent.'
        : 'Periodic screenshots require a monitoring agent installed on each employee device. The server has no such data to show.'}
    </p>
    <div className="inline-flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 max-w-md text-left">
      <Info size={14} className="mt-0.5 shrink-0" />
      <span>
        The Overview, Activity and Benchmarks tabs are fully live — they run on real attendance,
        work-mode and time-tracking data. This tab is intentionally left inert rather than showing fake feeds.
      </span>
    </div>
  </div>
);

export default MonitoringDashboard;
