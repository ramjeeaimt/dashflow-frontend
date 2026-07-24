import React, { useState, useMemo } from 'react';
import {
  ChevronRight, ChevronDown, Circle, CircleDashed, CircleDot, CheckCircle2,
  Flag, Calendar, Plus, UserPlus,
} from 'lucide-react';
import { STATUS_COLUMNS, statusMeta, priorityMeta, initials, formatDate } from '../taskConstants';

/**
 * ClickUp-style grouped list: top-level tasks grouped by status, each expandable
 * to reveal its subtasks inline, with a quick-add row per group. Columns are
 * Name / Assignee / Due / Priority to match the reference layout.
 */

const StatusIcon = ({ status, className = '' }) => {
  const common = { size: 16, className };
  if (status === 'done') return <CheckCircle2 {...common} className={`text-success ${className}`} />;
  if (status === 'in-progress') return <CircleDot {...common} className={`text-primary ${className}`} />;
  if (status === 'review') return <CircleDot {...common} className={`text-warning ${className}`} />;
  return <CircleDashed {...common} className={`text-muted-foreground ${className}`} />;
};

const TaskListView = ({ tasks, onTaskClick, onQuickAdd, canManage }) => {
  // Build the parent → children map once; a row is "top level" when it has no
  // parent (or its parent isn't in view, so it isn't orphaned out of the list).
  const { topByStatus, childrenOf } = useMemo(() => {
    const ids = new Set(tasks.map((t) => t.id));
    const childrenOf = new Map();
    const top = [];
    for (const t of tasks) {
      if (t.parentTaskId && ids.has(t.parentTaskId)) {
        if (!childrenOf.has(t.parentTaskId)) childrenOf.set(t.parentTaskId, []);
        childrenOf.get(t.parentTaskId).push(t);
      } else {
        top.push(t);
      }
    }
    const topByStatus = {};
    for (const col of STATUS_COLUMNS) topByStatus[col.key] = [];
    for (const t of top) (topByStatus[t.status] || (topByStatus[t.status] = [])).push(t);
    return { topByStatus, childrenOf };
  }, [tasks]);

  return (
    <div className="space-y-6">
      {STATUS_COLUMNS.map((col) => {
        const items = topByStatus[col.key] || [];
        const meta = statusMeta(col.key);
        return (
          <StatusGroup
            key={col.key}
            status={col.key}
            label={col.label}
            meta={meta}
            items={items}
            childrenOf={childrenOf}
            onTaskClick={onTaskClick}
            onQuickAdd={onQuickAdd}
            canManage={canManage}
          />
        );
      })}
    </div>
  );
};

const StatusGroup = ({ status, label, meta, items, childrenOf, onTaskClick, onQuickAdd, canManage }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const submit = async () => {
    if (!draft.trim()) {
      setAdding(false);
      return;
    }
    await onQuickAdd({ title: draft.trim(), status });
    setDraft('');
  };

  return (
    <div>
      {/* Group header — colored status pill + count */}
      <div className="flex items-center gap-2 mb-1.5">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-0.5 text-muted-foreground hover:text-foreground rounded transition-colors"
          aria-label={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </button>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide ${meta.badge}`}>
          {label}
        </span>
        <span className="text-sm text-muted-foreground">{items.length}</span>
      </div>

      {!collapsed && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Column header */}
          <div className="hidden md:grid grid-cols-[1fr_130px_120px_110px] gap-2 px-4 py-2 border-b border-border bg-muted/30">
            <span className="text-xs font-medium text-muted-foreground">Name</span>
            <span className="text-xs font-medium text-muted-foreground">Assignee</span>
            <span className="text-xs font-medium text-muted-foreground">Due date</span>
            <span className="text-xs font-medium text-muted-foreground">Priority</span>
          </div>

          <div className="divide-y divide-border">
            {items.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                depth={0}
                childrenOf={childrenOf}
                onTaskClick={onTaskClick}
              />
            ))}

            {items.length === 0 && !adding && (
              <div className="px-4 py-3 text-sm text-muted-foreground">No tasks</div>
            )}

            {/* Inline quick add */}
            {canManage && (
              adding ? (
                <div className="px-4 py-2.5 flex items-center gap-2 bg-muted/20">
                  <StatusIcon status={status} />
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submit();
                      if (e.key === 'Escape') { setAdding(false); setDraft(''); }
                    }}
                    onBlur={submit}
                    placeholder="Task name, then Enter…"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setAdding(true)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                >
                  <Plus size={15} />
                  Add Task
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TaskRow = ({ task, depth, childrenOf, onTaskClick }) => {
  const [expanded, setExpanded] = useState(false);
  const children = childrenOf.get(task.id) || [];
  const hasChildren = children.length > 0;
  const priority = priorityMeta(task.priority);
  const doneChildren = children.filter((c) => c.status === 'done').length;

  return (
    <>
      <div
        onClick={() => onTaskClick(task)}
        className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_130px_120px_110px] gap-2 px-4 py-2.5 items-center hover:bg-muted/40 transition-colors cursor-pointer group"
        style={{ paddingLeft: depth ? `${16 + depth * 24}px` : undefined }}
      >
        {/* Name cell */}
        <div className="flex items-center gap-1.5 min-w-0">
          {hasChildren ? (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
              className="p-0.5 text-muted-foreground hover:text-foreground rounded shrink-0"
              aria-label={expanded ? 'Collapse subtasks' : 'Expand subtasks'}
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span className="w-[18px] shrink-0" />
          )}
          <StatusIcon status={task.status} className="shrink-0" />
          <span className={`text-sm truncate ${task.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
            {task.title}
          </span>
          {hasChildren && (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground shrink-0 ml-1" title="Subtasks">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><path d="M7 12h10M7 17h6" /></svg>
              {doneChildren}/{children.length}
            </span>
          )}
          {task.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="hidden lg:inline px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground shrink-0">{tag}</span>
          ))}
        </div>

        {/* Assignee */}
        <div className="hidden md:flex items-center">
          {task.assigneeName ? (
            <span
              title={task.assigneeName}
              className="w-7 h-7 rounded-full bg-muted overflow-hidden flex items-center justify-center text-[10px] font-medium text-muted-foreground"
            >
              {task.assigneeAvatar ? (
                <img src={task.assigneeAvatar} alt={task.assigneeName} className="w-full h-full object-cover" />
              ) : (
                initials(task.assigneeName)
              )}
            </span>
          ) : (
            <span className="w-7 h-7 rounded-full border border-dashed border-border flex items-center justify-center text-muted-foreground/50">
              <UserPlus size={13} />
            </span>
          )}
        </div>

        {/* Due date */}
        <div className="hidden md:flex items-center text-sm">
          {task.deadline ? (
            <span className={`inline-flex items-center gap-1 ${task.isOverdue ? 'text-error' : 'text-muted-foreground'}`}>
              <Calendar size={13} />
              {formatDate(task.deadline)}
            </span>
          ) : (
            <span className="text-muted-foreground/40"><Calendar size={15} /></span>
          )}
        </div>

        {/* Priority */}
        <div className="flex items-center justify-end md:justify-start">
          {task.priority && task.priority !== 'medium' ? (
            <span className={`inline-flex items-center gap-1 text-xs font-medium ${task.priority === 'urgent' || task.priority === 'high' ? 'text-error' : 'text-muted-foreground'}`}>
              <Flag size={13} className="fill-current" />
              <span className="hidden md:inline capitalize">{priority.label}</span>
            </span>
          ) : (
            <Flag size={15} className="text-muted-foreground/30" />
          )}
        </div>
      </div>

      {/* Nested subtasks */}
      {expanded && children.map((child) => (
        <TaskRow
          key={child.id}
          task={child}
          depth={depth + 1}
          childrenOf={childrenOf}
          onTaskClick={onTaskClick}
        />
      ))}
    </>
  );
};

export default TaskListView;
