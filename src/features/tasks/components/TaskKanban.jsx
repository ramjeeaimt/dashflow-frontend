import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import { STATUS_COLUMNS, statusMeta } from '../taskConstants';

/**
 * Kanban board using native HTML5 drag-and-drop (no external DnD dependency,
 * which keeps the bundle lean and sidesteps the artifact CSP concerns).
 *
 * Dropping a card calls `onMove(taskId, status, order)`; the parent persists it
 * and refreshes. `order` is chosen so the card lands where it was dropped
 * relative to its new neighbours.
 */
const TaskKanban = ({ tasks, onTaskClick, onMove, onCreateInColumn }) => {
  const [dragId, setDragId] = useState(null);
  const [overCol, setOverCol] = useState(null);

  const byStatus = (status) => tasks.filter((t) => t.status === status);

  const handleDrop = (e, status) => {
    e.preventDefault();
    setOverCol(null);
    const id = e.dataTransfer.getData('text/plain') || dragId;
    if (!id) return;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    // Place above the current top card of the target column.
    const columnTasks = byStatus(status).filter((t) => t.id !== id);
    const topOrder = columnTasks.length ? Math.min(...columnTasks.map((t) => t.order ?? 0)) : 0;

    if (task.status === status) return; // same column, no-op (no reorder within column yet)
    onMove(id, status, topOrder - 1);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
      {STATUS_COLUMNS.map((col) => {
        const meta = statusMeta(col.key);
        const columnTasks = byStatus(col.key);
        const isOver = overCol === col.key;

        return (
          <div
            key={col.key}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(col.key);
            }}
            onDragLeave={() => setOverCol((c) => (c === col.key ? null : c))}
            onDrop={(e) => handleDrop(e, col.key)}
            className={`flex-shrink-0 w-[300px] rounded-xl border transition-colors ${
              isOver ? 'border-primary bg-primary/[0.03]' : 'border-transparent bg-muted/40'
            }`}
          >
            <div className="flex items-center justify-between px-3 py-3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                <span className="text-sm font-semibold text-foreground">{col.label}</span>
                <span className="text-xs text-muted-foreground bg-card border border-border rounded-full px-1.5">
                  {columnTasks.length}
                </span>
              </div>
              <button
                onClick={() => onCreateInColumn(col.key)}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-card rounded transition-colors"
                aria-label={`Add task to ${col.label}`}
              >
                <Plus size={15} />
              </button>
            </div>

            <div className="px-2 pb-2 space-y-2 min-h-[120px] max-h-[calc(100vh-320px)] overflow-y-auto">
              {columnTasks.length === 0 ? (
                <button
                  onClick={() => onCreateInColumn(col.key)}
                  className="w-full py-6 text-xs text-muted-foreground border border-dashed border-border rounded-lg hover:border-primary/40 hover:text-foreground transition-colors"
                >
                  + Add task
                </button>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', task.id);
                      e.dataTransfer.effectAllowed = 'move';
                      setDragId(task.id);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverCol(null);
                    }}
                    onClick={onTaskClick}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskKanban;
