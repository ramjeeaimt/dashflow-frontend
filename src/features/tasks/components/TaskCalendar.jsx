import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { priorityMeta, statusMeta } from '../taskConstants';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const toKey = (d) => d.toLocaleDateString('en-CA');

/**
 * Month calendar placing each task on its due date. Tasks without a deadline
 * are collected into a side rail so nothing silently disappears from the view.
 */
const TaskCalendar = ({ tasks, onTaskClick }) => {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const { weeks, undated } = useMemo(() => {
    const byDate = new Map();
    const undated = [];
    for (const task of tasks) {
      if (!task.deadline) {
        undated.push(task);
        continue;
      }
      const key = toKey(new Date(task.deadline));
      if (!byDate.has(key)) byDate.set(key, []);
      byDate.get(key).push(task);
    }

    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay()); // back to the Sunday before the 1st

    const weeks = [];
    const day = new Date(start);
    for (let w = 0; w < 6; w++) {
      const row = [];
      for (let i = 0; i < 7; i++) {
        row.push({
          date: new Date(day),
          key: toKey(day),
          inMonth: day.getMonth() === month,
          tasks: byDate.get(toKey(day)) || [],
        });
        day.setDate(day.getDate() + 1);
      }
      weeks.push(row);
    }
    return { weeks, undated };
  }, [tasks, cursor]);

  const todayKey = toKey(new Date());
  const monthLabel = cursor.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">{monthLabel}</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
              className="px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-2 py-2 text-center text-[11px] font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {weeks.flat().map((cell) => {
            const isToday = cell.key === todayKey;
            const isSunday = cell.date.getDay() === 0;
            return (
              <div
                key={cell.key}
                className={`min-h-[92px] border-b border-r border-border p-1.5 ${
                  cell.inMonth ? '' : 'bg-muted/30'
                } ${isSunday ? 'bg-muted/20' : ''}`}
              >
                <div
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs mb-1 ${
                    isToday
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : cell.inMonth
                        ? 'text-foreground'
                        : 'text-muted-foreground/50'
                  }`}
                >
                  {cell.date.getDate()}
                </div>
                <div className="space-y-1">
                  {cell.tasks.slice(0, 3).map((task) => {
                    const meta = priorityMeta(task.priority);
                    return (
                      <button
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className={`w-full flex items-center gap-1 px-1.5 py-1 rounded text-left text-[10px] leading-tight transition-colors hover:brightness-95 ${
                          task.status === 'done' ? 'bg-success/10 text-success line-through' : meta.badge
                        }`}
                        title={task.title}
                      >
                        <span className={`w-1 h-1 rounded-full shrink-0 ${meta.dot}`} />
                        <span className="truncate">{task.title}</span>
                      </button>
                    );
                  })}
                  {cell.tasks.length > 3 && (
                    <span className="text-[10px] text-muted-foreground pl-1">+{cell.tasks.length - 3} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {undated.length > 0 && (
        <div className="lg:w-64 shrink-0">
          <div className="bg-card border border-border rounded-xl">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">No due date</h3>
              <p className="text-xs text-muted-foreground">{undated.length} unscheduled</p>
            </div>
            <div className="p-2 space-y-1.5 max-h-[500px] overflow-y-auto">
              {undated.map((task) => {
                const meta = priorityMeta(task.priority);
                return (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
                    <span className="text-xs text-foreground truncate">{task.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCalendar;
