import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { STATUS_COLUMNS } from '../taskConstants';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

/**
 * Create / edit a task. Controlled form; the parent owns persistence and passes
 * `task` when editing. Kept intentionally flat — one screen, no wizard.
 */
const TaskFormModal = ({ open, onClose, onSubmit, task, projects, employees, defaultStatus }) => {
  const empty = {
    title: '',
    description: '',
    status: defaultStatus || 'todo',
    priority: 'medium',
    projectId: '',
    assigneeId: '',
    startDate: '',
    deadline: '',
    estimatedHours: '',
    progress: 0,
    tags: '',
  };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        projectId: task.projectId || '',
        assigneeId: task.assigneeId || '',
        startDate: task.startDate ? String(task.startDate).slice(0, 10) : '',
        deadline: task.deadline ? String(task.deadline).slice(0, 10) : '',
        estimatedHours: task.estimatedHours ?? '',
        progress: task.progress ?? 0,
        tags: Array.isArray(task.tags) ? task.tags.join(', ') : '',
      });
    } else {
      setForm({ ...empty, status: defaultStatus || 'todo' });
    }
    setError('');
  }, [open, task, defaultStatus]);

  if (!open) return null;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError('A title is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        ...form,
        estimatedHours: form.estimatedHours === '' ? null : Number(form.estimatedHours),
        progress: Number(form.progress) || 0,
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save the task.');
      setSaving(false);
    }
  };

  const field = 'w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-ring outline-none transition-colors';
  const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-foreground/40" onClick={onClose}>
      <div
        className="bg-card w-full max-w-2xl max-h-[92vh] rounded-xl border border-border shadow-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">{task ? 'Edit task' : 'New task'}</h2>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className={labelClass}>Title</label>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="What needs to be done?"
              className={field}
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="Add detail, acceptance criteria, links…"
              className={`${field} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className={field}>
                {STATUS_COLUMNS.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Priority</label>
              <select value={form.priority} onChange={(e) => set('priority', e.target.value)} className={`${field} capitalize`}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p} className="capitalize">{p}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Progress · {form.progress}%</label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={form.progress}
                onChange={(e) => set('progress', e.target.value)}
                className="w-full accent-primary mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Project</label>
              <select value={form.projectId} onChange={(e) => set('projectId', e.target.value)} className={field}>
                <option value="">No project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.projectName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Assignee</label>
              <select value={form.assigneeId} onChange={(e) => set('assigneeId', e.target.value)} className={field}>
                <option value="">Unassigned</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Start date</label>
              <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} className={field} />
            </div>
            <div>
              <label className={labelClass}>Due date</label>
              <input type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} className={field} />
            </div>
            <div>
              <label className={labelClass}>Estimate (h)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.estimatedHours}
                onChange={(e) => set('estimatedHours', e.target.value)}
                placeholder="0"
                className={field}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Tags (comma separated)</label>
            <input
              value={form.tags}
              onChange={(e) => set('tags', e.target.value)}
              placeholder="backend, urgent, client-x"
              className={field}
            />
          </div>

          {error && <p className="text-sm text-error">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            {task ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskFormModal;
