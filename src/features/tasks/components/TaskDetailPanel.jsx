import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TaskDetailPanel = ({ task, onClose, onUpdate, onDelete }) => {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "SARAH JOHNSON",
      avatar: "https://images.unsplash.com/photo-1587403655231-b1734312903f",
      content: "I've reviewed the requirements and started working on the initial design. Should have the mockups ready by tomorrow.",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: 2,
      author: "MICHAEL CHEN",
      avatar: "https://images.unsplash.com/photo-1676989880361-091e12efc056",
      content: "Great progress! I've added some additional requirements in the project documentation.",
      timestamp: new Date(Date.now() - 1800000),
    }
  ]);

  if (!task) return null;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-600';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-600';
      case 'low': return 'text-emerald-600 bg-emerald-50 border-emerald-600';
      default: return 'text-slate-400 bg-slate-50 border-slate-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-600';
      case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-600';
      case 'overdue': return 'text-red-600 bg-red-50 border-red-600';
      case 'pending': return 'text-slate-400 bg-slate-50 border-slate-200';
      default: return 'text-slate-400 bg-slate-50 border-slate-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD_MANIFEST';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'INVALID_TEMPORAL_DATA';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).toUpperCase();
  };

  const isOverdue = () => {
    if (!task.dueDate) return false;
    const date = new Date(task.dueDate);
    return task?.status !== 'completed' && !isNaN(date.getTime()) && date < new Date();
  };

  const handleAddComment = () => {
    if (!newComment?.trim()) return;
    const comment = {
      id: Date.now(),
      author: "CURRENT_OPERATOR",
      avatar: "https://images.unsplash.com/photo-1584183323859-7deffecfe07c",
      content: newComment,
      timestamp: new Date(),
    };
    setComments((prev) => [comment, ...prev]);
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[110] p-4 italic font-sans selection:bg-blue-100">
      <div className="bg-white border-4 border-slate-900 rounded-none w-full max-w-5xl shadow-[40px_40px_0px_rgba(15,23,42,0.15)] flex flex-col md:flex-row max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
        
        {/* Detail Body */}
        <div className="flex-1 flex flex-col min-w-0 border-r-4 border-slate-900">
          {/* Header Module */}
          <div className="p-8 bg-blue-900 text-white border-b-4 border-slate-900">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">UNIT_DIAGNOSTIC::DETAIL</span>
              <span className="w-12 h-px bg-slate-700"></span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{task?.title}</h2>
              <div className="flex items-center space-x-2 shrink-0">
                <span className={`px-3 py-1 border-2 text-[10px] font-black uppercase tracking-widest ${getPriorityColor(task?.priority)}`}>
                  {task?.priority}
                </span>
                <span className={`px-3 py-1 border-2 text-[10px] font-black uppercase tracking-widest bg-white ${getStatusColor(task?.status)}`}>
                  {task?.status?.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-12 industrial-scrollbar">
             {/* Data Manifest Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <ManifestLabel label="Operational_Description" />
                  <p className="text-sm font-bold text-slate-600 leading-relaxed uppercase">
                    {task?.description || 'NO_METADATA_DESCRIPTION_AVAILABLE_FOR_THIS_UNIT'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <ManifestLabel label="Assigned_Unit" />
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 border-2 border-slate-900 grayscale">
                          <Image src={task?.assignee?.avatar} alt={task?.assignee?.name} className="w-full h-full object-cover" />
                       </div>
                       <div className="space-y-0.5">
                          <div className="text-xs font-black text-slate-900 uppercase">{task?.assignee?.name}</div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{task?.assignee?.department}</div>
                       </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <ManifestLabel label="Temporal_Target" />
                    <div className={`font-mono text-xs font-black italic tracking-tighter ${isOverdue() ? 'text-red-600' : 'text-slate-900'}`}>
                      {formatDate(task?.dueDate)}
                      {isOverdue() && <div className="text-[8px] font-black uppercase tracking-tighter mt-1">STATUS::CRITICAL_EXPIRED</div>}
                    </div>
                  </div>
                </div>
             </div>

             {/* Progress Telemetry */}
             <div className="space-y-6 pt-12 border-t-2 border-slate-100">
                <div className="flex items-center justify-between">
                   <ManifestLabel label="Completion_Vector" />
                   <span className="font-mono text-xl font-black text-slate-900">{task?.progress}%</span>
                </div>
                <div className="h-6 bg-slate-100 border-2 border-slate-900 p-1 flex">
                   <div 
                    className={`h-full transition-all duration-1000 ${task?.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-900'}`}
                    style={{ width: `${task?.progress}%` }}
                   ></div>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                    onClick={() => onUpdate({...task, progress: Math.min(100, (task.progress || 0) + 10)})}
                    className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors"
                   >
                     Increment_Sequence_+10%
                   </button>
                   {task?.status !== 'completed' && (
                     <button 
                      onClick={() => onUpdate({...task, status: 'completed', progress: 100})}
                      className="px-4 py-2 border-2 border-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                     >
                       Finalize_Module
                     </button>
                   )}
                </div>
             </div>

             {/* Manifest Attachments */}
             {task?.attachments?.length > 0 && (
               <div className="space-y-6 pt-12 border-t-2 border-slate-100">
                  <ManifestLabel label="Identified_Assets" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {task.attachments.map(att => (
                      <div key={att.id} className="p-4 bg-slate-50 border-2 border-slate-200 flex items-center justify-between group hover:border-slate-900 transition-colors">
                        <div className="flex items-center space-x-3">
                           <Icon name="File" size={16} className="text-slate-400 group-hover:text-slate-900" />
                           <div className="space-y-0.5">
                              <div className="text-[11px] font-black text-slate-900 uppercase truncate max-w-[150px]">{att.name}</div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase">Size: {(att.size / 1024 / 1024).toFixed(2)} MB</div>
                           </div>
                        </div>
                        <button className="p-2 border-2 border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                           <Icon name="Download" size={14} strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                  </div>
               </div>
             )}
          </div>
        </div>

        {/* Intelligence / Comments Sidebar */}
        <div className="w-full md:w-96 flex flex-col bg-slate-50">
          <div className="p-6 border-b-4 border-slate-900 flex items-center justify-between bg-white">
             <div className="flex items-center space-x-2">
                <Icon name="MessageSquare" size={16} className="text-slate-900" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">INTEL_FEED</h3>
             </div>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-900">
                <Icon name="X" size={20} strokeWidth={3} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 industrial-scrollbar">
             {/* Add Intel */}
             <div className="space-y-3">
                <textarea 
                  placeholder="TRANSMIT_NEW_INTEL_SIGNAL..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-4 bg-white border-2 border-slate-200 focus:border-slate-900 outline-none text-[11px] font-bold text-slate-900 uppercase h-24 resize-none transition-all placeholder:text-slate-300"
                />
                <button 
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="w-full py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:shadow-[4px_4px_0px_rgba(15,23,42,0.2)] active:translate-y-0.5 transition-all disabled:opacity-30"
                >
                  Confirm_Transmission
                </button>
             </div>

             {/* Intel Stream */}
             <div className="space-y-6">
                {comments.map(c => (
                  <div key={c.id} className="space-y-2 group">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                           <Image src={c.avatar} className="w-5 h-5 border border-slate-900 grayscale" />
                           <span className="text-[10px] font-black text-slate-900 uppercase">{c.author}</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase italic">Time: {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                     </div>
                     <div className="p-4 bg-white border-2 border-slate-200 group-hover:border-slate-900 transition-colors">
                        <p className="text-[11px] font-bold text-slate-600 leading-normal uppercase">{c.content}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Footer Controls */}
          <div className="p-6 border-t-2 border-slate-200 bg-white grid grid-cols-2 gap-4">
             <button className="py-3 border-2 border-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                Export_Report
             </button>
             <button 
              onClick={() => onDelete(task.id)}
              className="py-3 border-2 border-red-600 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
             >
                Purge_Record
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManifestLabel = ({ label }) => (
  <div className="flex items-center space-x-2">
    <div className="w-1.5 h-1.5 bg-slate-900"></div>
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</span>
  </div>
);

export default TaskDetailPanel;