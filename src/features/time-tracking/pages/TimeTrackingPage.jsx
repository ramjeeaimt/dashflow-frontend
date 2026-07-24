import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Play, Clock, BarChart3, Users, Plus, Download, RefreshCw, Loader2, Trash2, Timer,
} from 'lucide-react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import TimerWidget from '../components/TimerWidget';
import ManualTimeEntry from '../components/ManualTimeEntry';
import timeTrackingService from '../../../services/time-tracking.service';
import taskService from '../../../services/task.service';
import { employeeService } from '../../../services/employee.service';
import useAuthStore from '../../../store/useAuthStore';

const TABS = [
  { id: 'timer', label: 'Timer', icon: Play },
  { id: 'timesheet', label: 'Timesheet', icon: Clock },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'team', label: 'Team', icon: Users },
];

const PRIVILEGED = ['admin', 'super admin', 'owner', 'manager', 'cto', 'hr', 'ceo', 'cfo'];

// Preset ranges resolve to [from, to] IST date strings.
const rangeToDates = (range) => {
  const today = new Date();
  const iso = (d) => d.toLocaleDateString('en-CA');
  if (range === 'today') return { from: iso(today), to: iso(today) };
  if (range === 'week') {
    const d = new Date(today);
    d.setDate(d.getDate() - 6);
    return { from: iso(d), to: iso(today) };
  }
  if (range === 'month') {
    const d = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: iso(d), to: iso(today) };
  }
  return {};
};

const fmtHours = (h) => `${(Number(h) || 0).toFixed(1)}h`;
const fmtDuration = (mins) => {
  const m = Math.max(0, Math.round(Number(mins) || 0));
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
};
const fmtTime = (d) => (d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—');
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—');

const TimeTrackingPage = () => {
  const { user } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('timer');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [currentTask, setCurrentTask] = useState('');

  const [dateRange, setDateRange] = useState('week');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');

  const [myEmployeeId, setMyEmployeeId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeTimer, setActiveTimer] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  const canViewOthers = useMemo(
    () => (user?.roles || []).some((r) => PRIVILEGED.includes(String(r.name || r).toLowerCase())),
    [user],
  );

  // The employee whose data we're viewing (undefined ⇒ whole company).
  const viewEmployeeId = selectedEmployee === 'all' ? undefined : selectedEmployee;

  const dates = useMemo(() => {
    if (customFrom || customTo) return { from: customFrom || undefined, to: customTo || undefined };
    return rangeToDates(dateRange);
  }, [dateRange, customFrom, customTo]);

  // Resolve who *I* am (needed to start/stop my own timer) + reference data.
  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      if (!user?.company?.id) return;
      const [me, emps, taskList] = await Promise.allSettled([
        employeeService.getAll({ userId: user.id }),
        employeeService.getAll(user.company.id),
        taskService.list(),
      ]);
      if (cancelled) return;
      if (me.status === 'fulfilled' && me.value?.[0]) setMyEmployeeId(me.value[0].id);
      if (emps.status === 'fulfilled') {
        setEmployees(
          (emps.value || []).map((e) => ({
            id: e.id,
            name: `${e.user?.firstName || e.firstName || ''} ${e.user?.lastName || e.lastName || ''}`.trim() || e.email,
          })),
        );
      }
      if (taskList.status === 'fulfilled') setTasks(taskList.value);
    };
    boot();
    return () => { cancelled = true; };
  }, [user?.company?.id, user?.id]);

  const loadData = useCallback(async () => {
    if (!user?.company?.id) return;
    setLoading(true);
    try {
      const [entryList, sum, active, teamData] = await Promise.allSettled([
        timeTrackingService.getAll(viewEmployeeId, dates),
        timeTrackingService.getSummary(viewEmployeeId),
        myEmployeeId ? timeTrackingService.getActive(myEmployeeId) : Promise.resolve(null),
        timeTrackingService.getTeamSummary(user.company.id),
      ]);
      if (entryList.status === 'fulfilled') setEntries(entryList.value);
      if (sum.status === 'fulfilled') setSummary(sum.value);
      if (active.status === 'fulfilled') setActiveTimer(active.value);
      if (teamData.status === 'fulfilled') setTeam(teamData.value || []);
    } finally {
      setLoading(false);
    }
  }, [user?.company?.id, viewEmployeeId, dates, myEmployeeId]);

  useEffect(() => { loadData(); }, [loadData]);

  // ---- timer actions ----
  const handleStartTimer = async () => {
    if (!myEmployeeId) {
      alert('Your account is not linked to an employee profile, so time cannot be tracked.');
      return null;
    }
    const taskObj = tasks.find((t) => t.id === currentTask);
    const created = await timeTrackingService.startTimer({
      employeeId: myEmployeeId,
      // Only send a real task id — never a placeholder that would break the FK.
      taskId: taskObj ? taskObj.id : null,
      description: taskObj ? taskObj.title : 'General work',
    });
    await loadData();
    return created;
  };

  const handleStopTimer = async (description) => {
    if (!activeTimer) return;
    await timeTrackingService.stopTimer(activeTimer.id, description || activeTimer.description);
    await loadData();
  };

  const handleAddManualEntry = async (entry) => {
    if (!myEmployeeId) {
      alert('Your account is not linked to an employee profile.');
      return;
    }
    const start = new Date(`${entry.date}T${entry.startTime}`);
    const end = new Date(`${entry.date}T${entry.endTime}`);
    if (!(end > start)) {
      alert('End time must be after start time.');
      return;
    }
    const taskObj = tasks.find((t) => t.id === entry.task);
    await timeTrackingService.startTimer({
      employeeId: myEmployeeId,
      taskId: entry.task || null,
      description: entry.description || (taskObj ? taskObj.title : 'General work'),
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    });
    setShowManualEntry(false);
    await loadData();
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Delete this time entry?')) return;
    await timeTrackingService.remove(id);
    await loadData();
  };

  const handleExport = () => {
    const rows = [['Date', 'Employee', 'Task/Description', 'Start', 'End', 'Duration (min)']];
    for (const e of entries) {
      rows.push([
        fmtDate(e.startTime),
        e.employee?.user ? `${e.employee.user.firstName || ''} ${e.employee.user.lastName || ''}`.trim() : '',
        (e.task?.title || e.description || '').replace(/[\n,]/g, ' '),
        fmtTime(e.startTime),
        fmtTime(e.endTime),
        e.durationMinutes ?? '',
      ]);
    }
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? '')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheet-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Time Tracking', path: '/time-tracking' },
  ];
  const selectClass =
    'px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-ring outline-none transition-colors';

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

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">Time Tracking</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Track work hours against tasks and review timesheets.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowManualEntry(true)} className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors">
                <Plus size={16} /> <span className="hidden sm:inline">Manual entry</span>
              </button>
              <button onClick={handleExport} disabled={!entries.length} className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50">
                <Download size={16} /> <span className="hidden sm:inline">Export</span>
              </button>
              <button onClick={loadData} className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors">
                <RefreshCw size={16} /> <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select value={dateRange} onChange={(e) => { setDateRange(e.target.value); setCustomFrom(''); setCustomTo(''); }} className={selectClass}>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="all">All time</option>
            </select>
            {canViewOthers && (
              <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className={selectClass}>
                <option value="all">All employees</option>
                {employees.map((e) => (<option key={e.id} value={e.id}>{e.name}</option>))}
              </select>
            )}
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className={selectClass} />
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className={selectClass} />
          </div>

          {/* Real stat tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile icon={<Clock size={18} />} label="Hours today" value={fmtHours(summary?.todayHours)} tone="primary" />
            <StatTile icon={<BarChart3 size={18} />} label="Hours this week" value={fmtHours(summary?.weekHours)} tone="success" />
            <StatTile icon={<Timer size={18} />} label="Entries logged" value={summary?.totalEntries ?? 0} tone="muted" />
            <StatTile icon={<Users size={18} />} label="Tasks tracked" value={summary?.tasksTracked ?? 0} tone="warning" />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    activeTab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}>
                  <Icon size={15} /> {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {activeTab === 'timer' && (
            <div className="space-y-5">
              {activeTimer && (
                <div className="flex items-center gap-2 text-sm text-success bg-success/10 border border-success/20 rounded-lg px-4 py-2.5">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  Timer running since {fmtTime(activeTimer.startTime)} — {activeTimer.task?.title || activeTimer.description || 'Working'}
                </div>
              )}
              <TimerWidget
                currentTask={currentTask}
                onTaskChange={setCurrentTask}
                tasks={tasks}
                activeTimer={activeTimer}
                onStartTimer={handleStartTimer}
                onStopTimer={handleStopTimer}
                onTimeUpdate={() => {}}
              />
              {showManualEntry && (
                <ManualTimeEntry onAddEntry={handleAddManualEntry} onClose={() => setShowManualEntry(false)} tasks={tasks} />
              )}
            </div>
          )}

          {activeTab === 'timesheet' && (
            <TimesheetView entries={entries} loading={loading} canViewOthers={canViewOthers} onDelete={handleDeleteEntry} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView summary={summary} entries={entries} tasks={tasks} loading={loading} />
          )}

          {activeTab === 'team' && (
            <TeamView team={team} employees={employees} loading={loading} />
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
    <div className="flex items-center gap-2.5 mb-3">
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${TONES[tone]}`}>{icon}</span>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
    <p className="text-2xl font-semibold text-foreground tracking-tight">{value}</p>
  </div>
);

const TimesheetView = ({ entries, loading, canViewOthers, onDelete }) => {
  if (loading) return <Loading />;
  if (!entries.length) return <Empty icon={<Clock size={22} />} title="No time entries" hint="Start a timer or add a manual entry to see it here." />;
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {['Date', ...(canViewOthers ? ['Employee'] : []), 'Task / description', 'Start', 'End', 'Duration', ''].map((h, i) => (
                <th key={i} className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((e) => (
              <tr key={e.id} className="hover:bg-muted/40 transition-colors">
                <td className="px-4 py-3 text-sm text-foreground">{fmtDate(e.startTime)}</td>
                {canViewOthers && (
                  <td className="px-4 py-3 text-sm text-foreground">
                    {e.employee?.user ? `${e.employee.user.firstName || ''} ${e.employee.user.lastName || ''}`.trim() : '—'}
                  </td>
                )}
                <td className="px-4 py-3 text-sm text-foreground max-w-[280px] truncate">{e.task?.title || e.description || '—'}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground tabular-nums">{fmtTime(e.startTime)}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground tabular-nums">
                  {e.endTime ? fmtTime(e.endTime) : <span className="text-success">running</span>}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-foreground tabular-nums">
                  {e.endTime ? fmtDuration(e.durationMinutes) : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => onDelete(e.id)} className="p-1.5 text-muted-foreground hover:text-error hover:bg-error/10 rounded-lg transition-colors" aria-label="Delete">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AnalyticsView = ({ summary, entries, loading }) => {
  const byTask = useMemo(() => {
    const map = new Map();
    for (const e of entries) {
      const key = e.task?.title || e.description || 'Untitled';
      map.set(key, (map.get(key) || 0) + (e.durationMinutes || 0));
    }
    return [...map.entries()].map(([name, mins]) => ({ name, hours: mins / 60 })).sort((a, b) => b.hours - a.hours).slice(0, 8);
  }, [entries]);

  if (loading) return <Loading />;
  const maxDay = Math.max(0.1, ...(summary?.byDay || []).map((d) => d.hours));
  const maxTask = Math.max(0.1, ...byTask.map((t) => t.hours));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Hours per day (last 7 days)</h3>
        <div className="flex items-end gap-2 h-44">
          {(summary?.byDay || []).map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex-1 flex items-end">
                <div className="w-full bg-primary/80 rounded-t transition-all" style={{ height: `${(d.hours / maxDay) * 100}%`, minHeight: d.hours > 0 ? '4px' : '0' }} title={`${d.hours}h`} />
              </div>
              <span className="text-[10px] text-muted-foreground">{new Date(`${d.date}T00:00`).toLocaleDateString('en-IN', { weekday: 'short' })}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">Total this week: <span className="font-medium text-foreground">{fmtHours(summary?.weekHours)}</span></p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Top tasks by time</h3>
        {byTask.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tracked time in this range.</p>
        ) : (
          <div className="space-y-3">
            {byTask.map((t) => (
              <div key={t.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-foreground truncate max-w-[70%]">{t.name}</span>
                  <span className="text-muted-foreground tabular-nums">{t.hours.toFixed(1)}h</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(t.hours / maxTask) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TeamView = ({ team, employees, loading }) => {
  if (loading) return <Loading />;
  // Merge every employee with their tracking row so people with no time still show.
  const rows = employees.map((emp) => {
    const t = team.find((x) => x.employeeId === emp.id);
    return { id: emp.id, name: emp.name, todayHours: t?.todayHours || 0, active: t?.active || false, currentTask: t?.currentTask || null, lastActivity: t?.lastActivity || null };
  }).sort((a, b) => (b.active - a.active) || (b.todayHours - a.todayHours));

  if (!rows.length) return <Empty icon={<Users size={22} />} title="No employees" hint="Add employees to see team tracking." />;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {['Employee', 'Status', 'Current task', 'Hours today', 'Last activity'].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-foreground">{r.name}</td>
                <td className="px-4 py-3">
                  {r.active ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success"><span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Tracking</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-2 h-2 rounded-full bg-muted-foreground/40" /> Idle</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground max-w-[240px] truncate">{r.currentTask || '—'}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground tabular-nums">{fmtHours(r.todayHours)}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{r.lastActivity ? fmtDate(r.lastActivity) + ' ' + fmtTime(r.lastActivity) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Loading = () => (
  <div className="flex items-center justify-center py-20"><Loader2 size={26} className="text-primary animate-spin" /></div>
);
const Empty = ({ icon, title, hint }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 text-muted-foreground">{icon}</div>
    <h3 className="text-base font-medium text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-sm">{hint}</p>
  </div>
);

export default TimeTrackingPage;
