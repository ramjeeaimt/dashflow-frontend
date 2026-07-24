// Shared vocabulary for the task board so the columns, badges and calendar all
// agree on labels, order and colour. Keys match the values the API stores.

export const STATUS_COLUMNS = [
  { key: 'todo', label: 'To do' },
  { key: 'in-progress', label: 'In progress' },
  { key: 'review', label: 'In review' },
  { key: 'done', label: 'Done' },
];

export const STATUS_META = {
  todo: { label: 'To do', dot: 'bg-muted-foreground', badge: 'bg-muted text-muted-foreground', accent: 'border-t-muted-foreground/40' },
  'in-progress': { label: 'In progress', dot: 'bg-primary', badge: 'bg-primary/10 text-primary', accent: 'border-t-primary' },
  review: { label: 'In review', dot: 'bg-warning', badge: 'bg-warning/10 text-warning', accent: 'border-t-warning' },
  done: { label: 'Done', dot: 'bg-success', badge: 'bg-success/10 text-success', accent: 'border-t-success' },
};

export const PRIORITY_META = {
  urgent: { label: 'Urgent', badge: 'bg-error/10 text-error border-error/20', dot: 'bg-error', rank: 0 },
  high: { label: 'High', badge: 'bg-error/10 text-error border-error/20', dot: 'bg-error', rank: 1 },
  medium: { label: 'Medium', badge: 'bg-warning/10 text-warning border-warning/20', dot: 'bg-warning', rank: 2 },
  low: { label: 'Low', badge: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground', rank: 3 },
};

export const statusMeta = (s) => STATUS_META[s] || STATUS_META.todo;
export const priorityMeta = (p) => PRIORITY_META[p] || PRIORITY_META.medium;

export const initials = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
};

export const formatDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

export const dueLabel = (task) => {
  if (task.status === 'done') return { text: 'Done', tone: 'text-success' };
  if (task.daysRemaining == null) return null;
  if (task.daysRemaining < 0)
    return { text: `${Math.abs(task.daysRemaining)}d overdue`, tone: 'text-error' };
  if (task.daysRemaining === 0) return { text: 'Due today', tone: 'text-warning' };
  if (task.daysRemaining === 1) return { text: 'Due tomorrow', tone: 'text-warning' };
  return { text: `${task.daysRemaining}d left`, tone: 'text-muted-foreground' };
};

/** Relative time for activity/comment feeds, e.g. "3h ago". */
export const timeAgo = (value) => {
  if (!value) return '';
  const then = new Date(value).getTime();
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};
