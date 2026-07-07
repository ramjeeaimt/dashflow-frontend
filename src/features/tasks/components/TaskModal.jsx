import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const TaskModal = ({ isOpen, onClose, onSave, task = null, employees = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    estimatedHours: '',
    tags: '',
    attachments: []
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task?.title || '',
        description: task?.description || '',
        assigneeId: task?.assignee?.id || '',
        priority: task?.priority || 'medium',
        status: task?.status || 'pending',
        dueDate: task?.dueDate ? task?.dueDate?.split('T')?.[0] : '',
        estimatedHours: task?.estimatedHours || '',
        tags: task?.tags?.join(', ') || '',
        attachments: task?.attachments || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        assigneeId: '',
        priority: 'medium',
        status: 'pending',
        dueDate: '',
        estimatedHours: '',
        tags: '',
        attachments: []
      });
    }
    setErrors({});
  }, [task, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData?.title?.trim()) newErrors.title = 'REQUIRED_IDENTIFIER_MISSING';
    if (!formData?.description?.trim()) newErrors.description = 'METADATA_DESCRIPTION_REQUIRED';
    if (!formData?.assigneeId) newErrors.assigneeId = 'UNIT_ASSIGNMENT_PENDING';
    if (!formData?.dueDate) {
      newErrors.dueDate = 'TEMPORAL_TARGET_REQUIRED';
    } else {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today?.setHours(0, 0, 0, 0);
      if (dueDate < today) newErrors.dueDate = 'CHRONOLOGICAL_ERROR: PAST_DATE';
    }
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const taskData = {
        ...formData,
        tags: formData?.tags?.split(',')?.map(tag => tag?.trim())?.filter(tag => tag),
        estimatedHours: formData?.estimatedHours ? parseInt(formData?.estimatedHours) : null,
        ...(task?.id && { id: task.id }),
        progress: task?.progress || 0
      };
      await onSave(taskData);
      onClose();
    } catch (error) {
       setErrors({ submit: 'TRANSMISSION_ERROR: PERSISTENCE_FAILED' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-sidebar/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans italic selection:bg-primary/10">
      <div className="bg-card border border-border rounded-none w-full max-w-3xl shadow-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Command Header */}
        <div className="bg-primary p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground/70">
              <span className="w-6 h-px bg-slate-600"></span>
              <span>SEQUENCE_INITIALIZATION::V1</span>
            </div>
            <h2 className="text-3xl font-semibold text-white uppercase tracking-tighter">
              {task ? 'Edit task' : 'New task'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-red-600 text-white transition-colors border border-white/10"
          >
            <Icon name="X" size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Diagnostic Form */}
        <form onSubmit={handleSubmit} className="p-10 space-y-10 max-h-[70vh] overflow-y-auto industrial-scrollbar">
          {errors?.submit && (
            <div className="p-4 bg-red-50 border border-red-600 flex items-center space-x-3">
              <Icon name="AlertTriangle" size={18} className="text-red-600" />
              <p className="text-[10px] font-semibold uppercase tracking-wide text-red-600">{errors?.submit}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 flex items-center gap-2">
                 <span className="w-2 h-2 bg-sidebar"></span> Primary_Identifier
              </label>
              <input
                type="text"
                placeholder="INPUT_CORE_TASK_IDENTIFIER..."
                value={formData?.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className={`w-full px-5 py-4 bg-muted/60 border ${errors.title ? 'border-red-600' : 'border-border'} focus:border-primary focus:bg-card outline-none text-sm font-bold uppercase transition-all rounded-none`}
              />
              {errors.title && <p className="text-[9px] font-semibold text-red-600 uppercase tracking-wide">{errors.title}</p>}
            </div>

            <div className="md:col-span-2 space-y-2">
               <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 flex items-center gap-2">
                 <span className="w-2 h-2 bg-sidebar"></span> Operational_Definition
              </label>
              <textarea
                placeholder="PROVIDE_TECHNICAL_METADATA_DESCRIPTION..."
                rows="3"
                value={formData?.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className={`w-full px-5 py-4 bg-muted/60 border ${errors.description ? 'border-red-600' : 'border-border'} focus:border-primary focus:bg-card outline-none text-sm font-bold transition-all rounded-none resize-none`}
              />
               {errors.description && <p className="text-[9px] font-semibold text-red-600 uppercase tracking-wide">{errors.description}</p>}
            </div>

            <IndustrialSelect 
               label="Assignee_Unit"
               value={formData.assigneeId}
               onChange={(v) => setFormData({...formData, assigneeId: v})}
               options={employees.map(e => ({ value: e.id, label: e.name }))}
               error={errors.assigneeId}
            />

            <IndustrialSelect 
               label="Criticality_Level"
               value={formData.priority}
               onChange={(v) => setFormData({...formData, priority: v})}
               options={[
                 { value: 'high', label: 'CRITICAL' },
                 { value: 'medium', label: 'STABLE' },
                 { value: 'low', label: 'DEFERRED' }
               ]}
            />

            <div className="space-y-2">
               <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">Target_Timeline</label>
               <input 
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className={`w-full px-5 py-4 bg-muted/60 border ${errors.dueDate ? 'border-red-600' : 'border-border'} focus:border-primary outline-none text-xs font-bold font-mono tracking-tighter`}
               />
               {errors.dueDate && <p className="text-[9px] font-semibold text-red-600 uppercase tracking-wide">{errors.dueDate}</p>}
            </div>

            <div className="space-y-2">
               <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">Computational_Load_(H)</label>
               <input 
                type="number"
                placeholder="0.00"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({...formData, estimatedHours: e.target.value})}
                className="w-full px-5 py-4 bg-muted/60 border border-border focus:border-primary outline-none text-xs font-bold font-mono tracking-tighter"
               />
            </div>
          </div>

          <div className="space-y-4 pt-10 border-t border-border">
             <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 flex items-center gap-2">
                 <Icon name="Upload" size={14} /> Attach_Manifest
             </label>
             <div className="border-2 border-dashed border-border p-8 flex flex-col items-center justify-center bg-muted/50 group hover:border-slate-900 transition-colors cursor-pointer">
                <Icon name="Plus" size={32} className="text-muted-foreground/70 group-hover:text-foreground transition-colors mb-2" />
                <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.2em] group-hover:text-foreground">IDENTIFICATION_UPLOAD_PENDING</span>
             </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-6 pt-12 border-t border-border">
            <button
               type="button"
               onClick={onClose}
               className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/70 hover:text-foreground transition-colors"
            >
              Abuse_Sequence
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-10 py-5 bg-sidebar text-white text-[11px] font-semibold uppercase tracking-[0.3em] hover:bg-sidebar transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin"></div>
              ) : (
                <Icon name="Save" size={16} strokeWidth={3} />
              )}
              Confirm_Manifest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const IndustrialSelect = ({ label, value, options, onChange, error }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-5 py-4 bg-muted/60 border ${error ? 'border-red-600' : 'border-border'} focus:border-primary outline-none text-xs font-bold uppercase cursor-pointer appearance-none rounded-none`}
      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1rem' }}
    >
      <option value="">SELECT_OPTION</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {error && <p className="text-[9px] font-semibold text-red-600 uppercase tracking-wide">{error}</p>}
  </div>
);

export default TaskModal;
