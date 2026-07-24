import React from 'react';
import { MessageSquare, Clock, GitBranch, CheckSquare } from 'lucide-react';
import { priorityMeta, dueLabel, initials, formatDate } from '../taskConstants';

/** A single task card — the unit shared by the board and list views. */
const TaskCard = ({ task, onClick, draggable, onDragStart, onDragEnd, compact }) => {
  const priority = priorityMeta(task.priority);
  const due = dueLabel(task);

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => onClick?.(task)}
      className={`group bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all ${
        draggable ? 'active:cursor-grabbing' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${priority.badge}`}
        >
          {priority.label}
        </span>
        {task.projectName && !compact && (
          <span className="text-[10px] text-muted-foreground truncate max-w-[45%]" title={task.projectName}>
            {task.projectName}
          </span>
        )}
      </div>

      <p className="text-sm font-medium text-foreground leading-snug mb-2 line-clamp-2">
        {task.title}
      </p>

      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      )}

      {task.status !== 'done' && task.progress > 0 && (
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden mb-2.5">
          <div className="h-full bg-primary rounded-full" style={{ width: `${task.progress}%` }} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-muted-foreground">
          {due && (
            <span className={`inline-flex items-center gap-1 text-[11px] ${due.tone}`}>
              <Clock size={11} />
              {due.text}
            </span>
          )}
          {task.subtaskCount > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[11px]" title="Subtasks">
              <CheckSquare size={11} />
              {task.subtaskDone}/{task.subtaskCount}
            </span>
          )}
          {task.commentCount > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[11px]">
              <MessageSquare size={11} />
              {task.commentCount}
            </span>
          )}
        </div>

        {task.assigneeName ? (
          <div
            title={task.assigneeName}
            className="w-6 h-6 rounded-full bg-muted overflow-hidden flex items-center justify-center text-[10px] font-medium text-muted-foreground shrink-0"
          >
            {task.assigneeAvatar ? (
              <img src={task.assigneeAvatar} alt={task.assigneeName} className="w-full h-full object-cover" />
            ) : (
              initials(task.assigneeName)
            )}
          </div>
        ) : (
          <span className="text-[10px] text-muted-foreground">Unassigned</span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
