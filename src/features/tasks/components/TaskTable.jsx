import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TaskTable = ({ tasks, onTaskSelect, onBulkAction, selectedTasks, onTaskClick }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'dueDate', direction: 'asc' });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default: return 'text-slate-400 bg-slate-50 border-slate-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'overdue': return 'text-red-700 bg-red-50 border-red-200';
      case 'pending': return 'text-slate-500 bg-slate-50 border-slate-200';
      default: return 'text-slate-400 bg-slate-50 border-slate-200';
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onTaskSelect(tasks?.map(task => task?.id));
    } else {
      onTaskSelect([]);
    }
  };

  const isAllSelected = tasks?.length > 0 && selectedTasks?.length === tasks?.length;
  const isIndeterminate = selectedTasks?.length > 0 && selectedTasks?.length < tasks?.length;

  const formatDate = (dateString) => {
    if (!dateString) return 'NO_LIMIT';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'TBD_SCHEDULE';

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }).toUpperCase();
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate) return false;
    const date = new Date(dueDate);
    if (isNaN(date.getTime())) return false;
    return status !== 'completed' && date < new Date();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-none overflow-hidden mb-12">
      {/* Table Header / Bulk Actions */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={el => el && (el.indeterminate = isIndeterminate)}
              onChange={handleSelectAll}
              className="w-5 h-5 border border-slate-300 rounded-none cursor-pointer accent-slate-900"
            />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 leading-none">
              Data_Manifest
            </h3>
            {selectedTasks?.length > 0 && (
              <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                {selectedTasks?.length} SECUENCE_SELECTED
              </div>
            )}
          </div>
        </div>

        {selectedTasks?.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onBulkAction('priority', 'high')}
              className="px-3 py-1.5 border-2 border-slate-900 text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2"
            >
              <Icon name="AlertTriangle" size={12} />
              Set_Critical
            </button>
            <button
              onClick={() => onBulkAction('status', 'completed')}
              className="px-3 py-1.5 border-2 border-slate-900 text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2"
            >
              <Icon name="CheckCircle" size={12} />
              Finalize
            </button>
            <button
              onClick={() => onBulkAction('delete')}
              className="px-3 py-1.5 border-2 border-red-600 text-red-600 text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
            >
              <Icon name="Trash2" size={12} />
              Purge
            </button>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-900 text-boldtext-white">
              <th className="w-12 px-6 py-4"></th>
              <TableHead label="TASK" onSort={() => handleSort('title')} sortKey="title" currentSort={sortConfig} />
              <TableHead label="ASSIGNED_TO" onSort={() => handleSort('assignee')} sortKey="assignee" currentSort={sortConfig} />
              <TableHead label="CRITICALITY" onSort={() => handleSort('priority')} sortKey="priority" currentSort={sortConfig} />
              <TableHead label="STATUS" onSort={() => handleSort('status')} sortKey="status" currentSort={sortConfig} />
              <TableHead label="DUE_DATE" onSort={() => handleSort('dueDate')} sortKey="dueDate" currentSort={sortConfig} />
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Completion_Vector</th>
              <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100">
            {tasks?.map((task) => (
              <tr
                key={task?.id}
                className="hover:bg-slate-50 transition-all cursor-pointer group"
                onClick={() => onTaskClick(task)}
              >
                <td className="px-6 py-5" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedTasks?.includes(task?.id)}
                    onChange={(e) => {
                      const newSelected = e?.target?.checked
                        ? [...selectedTasks, task?.id]
                        : selectedTasks?.filter(id => id !== task?.id);
                      onTaskSelect(newSelected);
                    }}
                    className="w-5 h-5 border-2 border-slate-900 rounded-none cursor-pointer accent-slate-900"
                  />
                </td>
                <td className="px-6 py-5">
                  <div className="space-y-1">
                    <div className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                      {task?.title}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight line-clamp-1 italic">
                      {task?.description || 'NO_METADATA_PROVIDED'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-none border-2 border-slate-900 overflow-hidden bg-slate-100">
                      <Image
                        src={task?.assignee?.avatar}
                        alt={task?.assignee?.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-black text-slate-900 uppercase tracking-tight">
                        {task?.assignee?.name}
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {task?.assignee?.department}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2 py-0.5 border-2 text-[9px] font-black uppercase tracking-widest ${getPriorityColor(task?.priority)}`}>
                    {task?.priority}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2 py-0.5 border-2 text-[9px] font-black uppercase tracking-widest ${getStatusColor(task?.status)}`}>
                    {task?.status?.replace('-', '_')}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className={`font-mono text-[11px] font-bold tracking-tighter ${isOverdue(task?.dueDate, task?.status) ? 'text-red-600' : 'text-slate-600'}`}>
                    {formatDate(task?.dueDate)}
                    {isOverdue(task?.dueDate, task?.status) && (
                      <div className="text-[8px] font-black text-red-600 uppercase tracking-[0.2em] mt-1">STATUS::CRITICAL_OVERDUE</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 bg-slate-100 border border-slate-200 h-3 flex overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ${task?.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-900'}`}
                        style={{ width: `${task?.progress}%` }}
                      ></div>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-slate-900 w-10 text-right">
                      {task?.progress}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ActionButton icon="Eye" onClick={() => onTaskClick(task)} />
                    <ActionButton icon="Edit" onClick={() => { }} />
                    <ActionButton icon="Trash2" variant="danger" onClick={() => { }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tasks?.length === 0 && (
        <div className="text-center py-20 bg-slate-50 border-t-2 border-slate-900">
          <div className="inline-flex p-4 bg-slate-100 border-2 border-slate-900 mb-4">
            <Icon name="CheckSquare" size={32} className="text-slate-400" />
          </div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em] mb-2">Null_State_Detected</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Adjust telemetry filters or initialize a new task sequence.
          </p>
        </div>
      )}
    </div>
  );
};

const TableHead = ({ label, onSort, sortKey, currentSort }) => (
  <th className="px-6 py-4 text-left">
    <button
      onClick={onSort}
      className="flex items-center space-x-2 text-[10px] font-black tracking-[0.2em] text-slate-400 hover:text-white transition-colors uppercase group"
    >
      <span>{label}</span>
      <Icon
        name={currentSort?.key === sortKey ? (currentSort?.direction === 'asc' ? 'ArrowUp' : 'ArrowDown') : 'ArrowUpDown'}
        size={10}
        className={currentSort?.key === sortKey ? 'text-blue-400' : 'text-slate-700 group-hover:text-slate-500'}
      />
    </button>
  </th>
);

const ActionButton = ({ icon, onClick, variant = 'default' }) => (
  <button
    onClick={onClick}
    className={`p-2 border-2 transition-all active:scale-90 ${variant === 'danger'
        ? 'border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600'
        : 'border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900'
      }`}
  >
    <Icon name={icon} size={14} strokeWidth={3} />
  </button>
);

export default TaskTable;
