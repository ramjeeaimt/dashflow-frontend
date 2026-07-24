import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LayoutGrid, List as ListIcon, Calendar as CalendarIcon, Plus, Search, Loader2, CheckSquare,
} from 'lucide-react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';
import useAuthStore from '../../../store/useAuthStore';
import { taskService } from '../../../services/task.service';
import { projectService } from '../../../services/project.service';
import { employeeService } from '../../../services/employee.service';
import TaskKanban from '../components/TaskKanban';
import TaskListView from '../components/TaskListView';
import TaskCalendar from '../components/TaskCalendar';
import TaskFormModal from '../components/TaskFormModal';
import TaskDetailDrawer from '../components/TaskDetailDrawer';

const VIEWS = [
  { key: 'board', label: 'Board', icon: LayoutGrid },
  { key: 'list', label: 'List', icon: ListIcon },
  { key: 'calendar', label: 'Calendar', icon: CalendarIcon },
];

const PRIVILEGED = ['admin', 'super admin', 'owner', 'manager', 'cto', 'hr'];

const TaskBoardPage = () => {
  const { user } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [view, setView] = useState('board');
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [mineOnly, setMineOnly] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('todo');
  const [openTaskId, setOpenTaskId] = useState(null);

  const canManage = useMemo(() => {
    const roles = (user?.roles || []).map((r) => String(r.name || r).toLowerCase());
    return roles.some((r) => PRIVILEGED.includes(r));
  }, [user]);

  const myEmployeeId = user?.employeeId || user?.employee?.id || null;

  const loadTasks = useCallback(async () => {
    try {
      const data = await taskService.list({ projectId: projectFilter || undefined });
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  }, [projectFilter]);

  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      if (!user?.company?.id) return;
      setLoading(true);
      const [taskList, projList, empList] = await Promise.allSettled([
        taskService.list(),
        projectService.getAll(user.company.id),
        employeeService.getAll(user.company.id),
      ]);
      if (cancelled) return;
      if (taskList.status === 'fulfilled') setTasks(taskList.value);
      if (projList.status === 'fulfilled') setProjects(projList.value);
      if (empList.status === 'fulfilled') {
        setEmployees(
          (empList.value || []).map((e) => ({
            id: e.id,
            name: `${e.user?.firstName || ''} ${e.user?.lastName || ''}`.trim() || 'Unnamed',
          })),
        );
      }
      setLoading(false);
    };
    boot();
    return () => {
      cancelled = true;
    };
  }, [user?.company?.id]);

  // Re-fetch when the project filter changes (server-side filter).
  useEffect(() => {
    if (!loading) loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectFilter]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (search && !`${t.title} ${t.description || ''}`.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (assigneeFilter && t.assigneeId !== assigneeFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      if (mineOnly && t.assigneeId !== myEmployeeId) return false;
      return true;
    });
  }, [tasks, search, assigneeFilter, priorityFilter, mineOnly, myEmployeeId]);

  const counts = useMemo(
    () => ({
      total: filtered.length,
      done: filtered.filter((t) => t.status === 'done').length,
      overdue: filtered.filter((t) => t.isOverdue).length,
    }),
    [filtered],
  );

  const handleMove = async (id, status, order) => {
    // Optimistic: reflect the column change immediately, then persist.
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status, order } : t)));
    try {
      await taskService.move(id, status, order);
      loadTasks();
    } catch (err) {
      console.error('Move failed:', err);
      loadTasks();
    }
  };

  const handleSubmit = async (payload) => {
    if (editingTask) {
      await taskService.update(editingTask.id, payload);
    } else {
      await taskService.create(payload);
    }
    setFormOpen(false);
    setEditingTask(null);
    await loadTasks();
  };

  // Inline quick-add from the list groups (and subtask rows). Title-only create;
  // inherits the group's status and carries the current project filter.
  const handleQuickAdd = async ({ title, status, parentTaskId }) => {
    await taskService.create({
      title,
      status: status || 'todo',
      parentTaskId: parentTaskId || undefined,
      projectId: projectFilter || undefined,
    });
    await loadTasks();
  };

  // Board and calendar show only top-level tasks; subtasks nest in the list.
  const topLevel = useMemo(() => filtered.filter((t) => !t.parentTaskId), [filtered]);

  const openCreate = (status = 'todo') => {
    setEditingTask(null);
    setDefaultStatus(status);
    setFormOpen(true);
  };

  const openEdit = (task) => {
    setOpenTaskId(null);
    setEditingTask(task);
    setFormOpen(true);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Work Management', path: '/task-management' },
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

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} pt-16 pb-8`}>
        <div className="p-4 sm:p-6 max-w-[1700px] mx-auto space-y-5">
          <BreadcrumbNavigation items={breadcrumbItems} />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">Tasks</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {counts.total} tasks · {counts.done} done
                {counts.overdue > 0 && <span className="text-error"> · {counts.overdue} overdue</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-muted rounded-lg p-1 gap-1">
                {VIEWS.map((v) => {
                  const Icon = v.icon;
                  return (
                    <button
                      key={v.key}
                      onClick={() => setView(v.key)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        view === v.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon size={15} />
                      <span className="hidden sm:inline">{v.label}</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => openCreate('todo')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">New task</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks…"
                className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-ring outline-none transition-colors"
              />
            </div>
            <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className={selectClass}>
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.projectName}</option>
              ))}
            </select>
            {canManage && (
              <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className={selectClass}>
                <option value="">Anyone</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            )}
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={`${selectClass} capitalize`}>
              <option value="">Any priority</option>
              {['urgent', 'high', 'medium', 'low'].map((p) => (
                <option key={p} value={p} className="capitalize">{p}</option>
              ))}
            </select>
            {myEmployeeId && (
              <label className="inline-flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground cursor-pointer select-none">
                <input type="checkbox" checked={mineOnly} onChange={(e) => setMineOnly(e.target.checked)} className="rounded border-border accent-primary" />
                My tasks
              </label>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 size={28} className="text-primary animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">Loading tasks…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                <CheckSquare size={22} className="text-muted-foreground" />
              </div>
              <h3 className="text-base font-medium text-foreground mb-1">
                {tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-5">
                {tasks.length === 0
                  ? 'Create a task and assign it to someone to start tracking work.'
                  : 'Try clearing a filter or widening your search.'}
              </p>
              {tasks.length === 0 && (
                <button
                  onClick={() => openCreate('todo')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus size={16} />
                  New task
                </button>
              )}
            </div>
          ) : view === 'board' ? (
            <TaskKanban tasks={topLevel} onTaskClick={(t) => setOpenTaskId(t.id)} onMove={handleMove} onCreateInColumn={openCreate} />
          ) : view === 'list' ? (
            <TaskListView
              tasks={filtered}
              onTaskClick={(t) => setOpenTaskId(t.id)}
              onQuickAdd={handleQuickAdd}
              canManage={canManage}
            />
          ) : (
            <TaskCalendar tasks={topLevel} onTaskClick={(t) => setOpenTaskId(t.id)} />
          )}
        </div>
      </main>

      <TaskFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSubmit}
        task={editingTask}
        projects={projects}
        employees={employees}
        defaultStatus={defaultStatus}
      />

      {openTaskId && (
        <TaskDetailDrawer
          taskId={openTaskId}
          canManage={canManage}
          onClose={() => setOpenTaskId(null)}
          onChanged={loadTasks}
          onEdit={openEdit}
          onOpenTask={(id) => setOpenTaskId(id)}
        />
      )}
    </div>
  );
};

export default TaskBoardPage;
