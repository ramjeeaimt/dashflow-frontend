import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Loader2, Pencil, Trash2, Send, Clock, MessageSquare, Activity as ActivityIcon,
  CheckSquare, Plus, GitCommit, UserPlus, Flag, CheckCircle2, RotateCcw, Timer,
} from 'lucide-react';
import { taskService } from '../../../services/task.service';
import {
  STATUS_COLUMNS, statusMeta, priorityMeta, initials, timeAgo, formatDate, dueLabel,
} from '../taskConstants';

/**
 * Full task detail as a right-hand drawer: inline status/progress controls, a
 * subtask list, and three tabs — Comments, Activity (the full audit log) and
 * Time. All writes go through the API and refresh the task in place.
 */
const TABS = [
  { key: 'comments', label: 'Comments', icon: MessageSquare },
  { key: 'activity', label: 'Activity', icon: ActivityIcon },
  { key: 'time', label: 'Time', icon: Clock },
];

const ACTIVITY_ICON = {
  created: Plus,
  updated: GitCommit,
  status_changed: GitCommit,
  assigned: UserPlus,
  commented: MessageSquare,
  time_logged: Timer,
  completed: CheckCircle2,
  reopened: RotateCcw,
  subtask_added: CheckSquare,
};

const TaskDetailDrawer = ({ taskId, onClose, onChanged, onEdit, onOpenTask, canManage }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('comments');
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [timeForm, setTimeForm] = useState({ hours: '', note: '' });
  const [savingField, setSavingField] = useState(false);
  const [addingSub, setAddingSub] = useState(false);
  const [subDraft, setSubDraft] = useState('');

  const load = useCallback(async () => {
    if (!taskId) return;
    try {
      const data = await taskService.get(taskId);
      setTask(data);
    } catch (err) {
      console.error('Failed to load task:', err);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  // Persist a field, refresh locally and let the board know to re-fetch.
  const patch = async (payload) => {
    setSavingField(true);
    try {
      const updated = await taskService.update(taskId, payload);
      setTask(updated);
      onChanged?.();
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setSavingField(false);
    }
  };

  const submitComment = async () => {
    if (!comment.trim()) return;
    setPosting(true);
    try {
      await taskService.addComment(taskId, comment.trim());
      setComment('');
      await load();
      onChanged?.();
    } catch (err) {
      console.error('Comment failed:', err);
    } finally {
      setPosting(false);
    }
  };

  const submitTime = async () => {
    const hours = Number(timeForm.hours);
    if (!hours || hours <= 0) return;
    try {
      await taskService.logTime(taskId, { hours, note: timeForm.note });
      setTimeForm({ hours: '', note: '' });
      await load();
      onChanged?.();
    } catch (err) {
      console.error('Time log failed:', err);
    }
  };

  const submitSubtask = async () => {
    if (!subDraft.trim()) {
      setAddingSub(false);
      return;
    }
    try {
      await taskService.create({
        title: subDraft.trim(),
        parentTaskId: taskId,
        status: 'todo',
        projectId: task?.projectId || undefined,
      });
      setSubDraft('');
      await load();
      onChanged?.();
    } catch (err) {
      console.error('Subtask create failed:', err);
    }
  };

  const toggleSubtask = async (sub) => {
    try {
      await taskService.update(sub.id, { status: sub.status === 'done' ? 'todo' : 'done' });
      await load();
      onChanged?.();
    } catch (err) {
      console.error('Subtask toggle failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task? This also removes its comments, activity and time logs.')) return;
    try {
      await taskService.remove(taskId);
      onChanged?.();
      onClose();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const priority = task ? priorityMeta(task.priority) : null;
  const due = task ? dueLabel(task) : null;

  return (
    <div className="fixed inset-0 z-[115] flex justify-end bg-foreground/30" onClick={onClose}>
      <div
        className="bg-card w-full max-w-xl h-full shadow-xl border-l border-border flex flex-col animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {loading || !task ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={24} className="text-primary animate-spin" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${priority.badge}`}>
                    {priority.label}
                  </span>
                  {task.projectName && (
                    <span className="text-xs text-muted-foreground">{task.projectName}</span>
                  )}
                  {task.isOverdue && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-error/10 text-error">Overdue</span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {canManage && (
                    <>
                      <button onClick={() => onEdit(task)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" aria-label="Edit">
                        <Pencil size={16} />
                      </button>
                      <button onClick={handleDelete} className="p-1.5 text-muted-foreground hover:text-error hover:bg-error/10 rounded-lg transition-colors" aria-label="Delete">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                  <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" aria-label="Close">
                    <X size={18} />
                  </button>
                </div>
              </div>
              <h2 className="text-lg font-semibold text-foreground mt-2 leading-snug">{task.title}</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Quick controls */}
              <div className="px-5 py-4 space-y-4 border-b border-border">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
                    <select
                      value={task.status}
                      disabled={savingField}
                      onChange={(e) => patch({ status: e.target.value })}
                      className="w-full px-2.5 py-2 bg-card border border-border rounded-lg text-sm focus:border-primary outline-none"
                    >
                      {STATUS_COLUMNS.map((s) => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Progress · {task.progress}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      defaultValue={task.progress}
                      disabled={savingField}
                      onMouseUp={(e) => patch({ progress: Number(e.target.value) })}
                      onTouchEnd={(e) => patch({ progress: Number(e.target.value) })}
                      className="w-full accent-primary mt-2.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <Meta label="Assignee">
                    {task.assigneeName ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-medium">
                          {initials(task.assigneeName)}
                        </span>
                        {task.assigneeName}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </Meta>
                  <Meta label="Due">
                    {due ? <span className={due.tone}>{due.text}</span> : <span className="text-muted-foreground">No date</span>}
                  </Meta>
                  <Meta label="Estimate">
                    {task.estimatedHours != null ? `${task.estimatedHours}h` : <span className="text-muted-foreground">—</span>}
                  </Meta>
                  <Meta label="Logged">
                    <span className={task.estimatedHours && task.timeLogged > task.estimatedHours ? 'text-error' : ''}>
                      {task.timeLogged || 0}h
                    </span>
                  </Meta>
                </div>

                {task.description && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{task.description}</p>
                  </div>
                )}

                {task.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {task.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Subtasks */}
              <div className="px-5 py-4 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Subtasks{task.subtaskCount ? ` · ${task.subtaskDone}/${task.subtaskCount}` : ''}
                  </p>
                </div>

                {task.subtasks?.length > 0 && (
                  <div className="space-y-1 mb-1">
                    {task.subtasks.map((s) => (
                      <div
                        key={s.id}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors group/sub"
                      >
                        <button
                          onClick={() => toggleSubtask(s)}
                          className="shrink-0"
                          aria-label={s.status === 'done' ? 'Mark not done' : 'Mark done'}
                        >
                          <CheckSquare size={15} className={s.status === 'done' ? 'text-success' : 'text-muted-foreground hover:text-foreground'} />
                        </button>
                        <button
                          onClick={() => onOpenTask?.(s.id)}
                          className={`text-sm flex-1 truncate text-left ${s.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                        >
                          {s.title}
                        </button>
                        {s.assigneeName && (
                          <span title={s.assigneeName} className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-medium text-muted-foreground shrink-0">
                            {initials(s.assigneeName)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {canManage && (
                  addingSub ? (
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <CheckSquare size={15} className="text-muted-foreground shrink-0" />
                      <input
                        autoFocus
                        value={subDraft}
                        onChange={(e) => setSubDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') submitSubtask();
                          if (e.key === 'Escape') { setAddingSub(false); setSubDraft(''); }
                        }}
                        onBlur={submitSubtask}
                        placeholder="Subtask name, then Enter…"
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingSub(true)}
                      className="inline-flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus size={15} />
                      Add subtask
                    </button>
                  )
                )}
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border px-3">
                {TABS.map((t) => {
                  const count =
                    t.key === 'comments' ? task.comments?.length
                    : t.key === 'activity' ? task.activity?.length
                    : task.timeLogs?.length;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                        tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon size={14} />
                      {t.label}
                      {count > 0 && <span className="text-xs text-muted-foreground">({count})</span>}
                    </button>
                  );
                })}
              </div>

              <div className="px-5 py-4">
                {tab === 'comments' && (
                  <CommentsTab comments={task.comments} />
                )}
                {tab === 'activity' && (
                  <ActivityTab activity={task.activity} />
                )}
                {tab === 'time' && (
                  <TimeTab
                    logs={task.timeLogs}
                    total={task.timeLogged}
                    estimate={task.estimatedHours}
                    form={timeForm}
                    setForm={setTimeForm}
                    onSubmit={submitTime}
                  />
                )}
              </div>
            </div>

            {/* Comment composer pinned when on comments tab */}
            {tab === 'comments' && (
              <div className="px-5 py-3 border-t border-border">
                <div className="flex items-end gap-2">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitComment();
                    }}
                    rows={1}
                    placeholder="Write a comment…  (⌘↵ to send)"
                    className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-sm resize-none focus:border-primary focus:ring-1 focus:ring-ring outline-none"
                  />
                  <button
                    onClick={submitComment}
                    disabled={!comment.trim() || posting}
                    className="p-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    aria-label="Send comment"
                  >
                    {posting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const Meta = ({ label, children }) => (
  <div>
    <p className="text-xs font-medium text-muted-foreground mb-0.5">{label}</p>
    <div className="text-sm text-foreground">{children}</div>
  </div>
);

const CommentsTab = ({ comments = [] }) => {
  if (comments.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-6">No comments yet.</p>;
  }
  return (
    <div className="space-y-4">
      {comments.map((c) => (
        <div key={c.id} className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground shrink-0">
            {initials(c.authorName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-foreground">{c.authorName}</span>
              <span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap mt-0.5 leading-relaxed">{c.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const ActivityTab = ({ activity = [] }) => {
  if (activity.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-6">No activity yet.</p>;
  }
  return (
    <ol className="space-y-3">
      {activity.map((a) => {
        const Icon = ACTIVITY_ICON[a.type] || GitCommit;
        return (
          <li key={a.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                <Icon size={12} />
              </span>
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <p className="text-sm text-foreground leading-snug">
                <span className="font-medium">{a.actorName || 'Someone'}</span>{' '}
                <span className="text-muted-foreground">{a.message}</span>
              </p>
              <span className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

const TimeTab = ({ logs = [], total = 0, estimate, form, setForm, onSubmit }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
      <div>
        <p className="text-xs text-muted-foreground">Logged</p>
        <p className="text-lg font-semibold text-foreground">{total || 0}h</p>
      </div>
      {estimate != null && (
        <>
          <div className="flex-1 mx-4 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${total > estimate ? 'bg-error' : 'bg-success'}`}
              style={{ width: `${Math.min((total / estimate) * 100, 100)}%` }}
            />
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Estimate</p>
            <p className="text-lg font-semibold text-foreground">{estimate}h</p>
          </div>
        </>
      )}
    </div>

    <div className="flex items-end gap-2">
      <div className="w-24">
        <label className="block text-xs font-medium text-muted-foreground mb-1">Hours</label>
        <input
          type="number"
          min="0"
          step="0.25"
          value={form.hours}
          onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
          placeholder="0"
          className="w-full px-2.5 py-2 bg-card border border-border rounded-lg text-sm focus:border-primary outline-none"
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs font-medium text-muted-foreground mb-1">Note (optional)</label>
        <input
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          placeholder="What did you work on?"
          className="w-full px-2.5 py-2 bg-card border border-border rounded-lg text-sm focus:border-primary outline-none"
        />
      </div>
      <button
        onClick={onSubmit}
        disabled={!Number(form.hours)}
        className="px-3 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        Log
      </button>
    </div>

    {logs.length > 0 && (
      <div className="space-y-2 pt-1">
        {logs.map((l) => (
          <div key={l.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
            <div className="min-w-0">
              <span className="font-medium text-foreground">{l.userName}</span>
              {l.note && <span className="text-muted-foreground"> · {l.note}</span>}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-foreground font-medium tabular-nums">{l.hours}h</span>
              <span className="text-xs text-muted-foreground">{formatDate(l.workDate || l.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default TaskDetailDrawer;
