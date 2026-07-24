import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ManualTimeEntry = ({ onAddEntry, onClose, tasks = [] }) => {
  const [formData, setFormData] = useState({
    date: new Date()?.toISOString()?.split('T')?.[0],
    task: '',
    project: '',
    startTime: '',
    endTime: '',
    breakDuration: '0',
    description: '',
    category: 'work'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real tasks only — plus a "General work" option so time can be logged
  // without tying it to a task.
  const taskOptions = [
    { value: '', label: 'General work (no task)' },
    ...tasks.map(task => ({ value: task.id, label: task.title })),
  ];

  const projectOptions = Array.from(new Set(tasks.map(t => t.projectId).filter(Boolean))).map(projId => {
    const proj = tasks.find(t => t.projectId === projId)?.project;
    return { value: projId, label: proj?.projectName || proj?.name || 'Project' };
  });

  const categoryOptions = [
    { value: 'work', label: 'Work Time' },
    { value: 'break', label: 'Break Time' },
    { value: 'meeting', label: 'Meeting Time' },
    { value: 'training', label: 'Training Time' },
    { value: 'overtime', label: 'Overtime' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData?.task) {
      newErrors.task = 'Task is required';
    }

    if (!formData?.project) {
      newErrors.project = 'Project is required';
    }

    if (!formData?.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData?.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData?.startTime && formData?.endTime) {
      const start = new Date(`${formData.date}T${formData.startTime}`);
      const end = new Date(`${formData.date}T${formData.endTime}`);
      
      if (end <= start) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    if (!formData?.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const calculateDuration = () => {
    if (!formData?.startTime || !formData?.endTime) return '0h 0m';
    
    const start = new Date(`${formData.date}T${formData.startTime}`);
    const end = new Date(`${formData.date}T${formData.endTime}`);
    const breakMinutes = parseInt(formData?.breakDuration) || 0;
    
    const diffMs = end - start - (breakMinutes * 60000);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newEntry = {
        id: Date.now(),
        ...formData,
        duration: calculateDuration(),
        status: 'pending',
        createdAt: new Date()?.toISOString()
      };
      
      if (onAddEntry) {
        onAddEntry(newEntry);
      }
      
      // Reset form
      setFormData({
        date: new Date()?.toISOString()?.split('T')?.[0],
        task: '',
        project: '',
        startTime: '',
        endTime: '',
        breakDuration: '0',
        description: '',
        category: 'work'
      });
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error adding time entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Manual Time Entry</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add time entries for work completed outside of automatic tracking
          </p>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            iconName="X"
          />
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Date"
            value={formData?.date}
            onChange={(e) => handleInputChange('date', e?.target?.value)}
            error={errors?.date}
            required
          />
          
          <Select
            label="Category"
            options={categoryOptions}
            value={formData?.category}
            onChange={(value) => handleInputChange('category', value)}
            error={errors?.category}
            required
          />
        </div>

        {/* Task and Project */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Task Type"
            options={taskOptions}
            value={formData?.task}
            onChange={(value) => handleInputChange('task', value)}
            placeholder="Select task type"
            error={errors?.task}
            required
            searchable
          />
          
          <Select
            label="Project"
            options={projectOptions}
            value={formData?.project}
            onChange={(value) => handleInputChange('project', value)}
            placeholder="Select project"
            error={errors?.project}
            required
            searchable
          />
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="time"
            label="Start Time"
            value={formData?.startTime}
            onChange={(e) => handleInputChange('startTime', e?.target?.value)}
            error={errors?.startTime}
            required
          />
          
          <Input
            type="time"
            label="End Time"
            value={formData?.endTime}
            onChange={(e) => handleInputChange('endTime', e?.target?.value)}
            error={errors?.endTime}
            required
          />
          
          <Input
            type="number"
            label="Break Duration (minutes)"
            value={formData?.breakDuration}
            onChange={(e) => handleInputChange('breakDuration', e?.target?.value)}
            min="0"
            max="480"
            placeholder="0"
          />
        </div>

        {/* Duration Display */}
        {formData?.startTime && formData?.endTime && (
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">
                Total Duration: {calculateDuration()}
              </span>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Description *
          </label>
          <textarea
            value={formData?.description}
            onChange={(e) => handleInputChange('description', e?.target?.value)}
            placeholder="Describe what you worked on during this time..."
            rows={4}
            className={`w-full px-3 py-2 bg-input border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none ${
 errors?.description ? 'border-destructive' : 'border-border'
 }`}
          />
          {errors?.description && (
            <p className="text-sm text-destructive mt-1">{errors?.description}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-border">
          <Button
            type="submit"
            variant="default"
            loading={isSubmitting}
            iconName="Plus"
            iconPosition="left"
            className="sm:flex-1"
          >
            Add Time Entry
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({
                date: new Date()?.toISOString()?.split('T')?.[0],
                task: '',
                project: '',
                startTime: '',
                endTime: '',
                breakDuration: '0',
                description: '',
                category: 'work'
              });
              setErrors({});
            }}
            iconName="RotateCcw"
            iconPosition="left"
            className="sm:flex-1"
          >
            Reset Form
          </Button>
        </div>
      </form>
      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="text-sm font-medium text-foreground mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const now = new Date();
              const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
              handleInputChange('startTime', oneHourAgo?.toTimeString()?.slice(0, 5));
              handleInputChange('endTime', now?.toTimeString()?.slice(0, 5));
            }}
            className="text-xs"
          >
            Last Hour
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleInputChange('startTime', '09:00');
              handleInputChange('endTime', '17:00');
              handleInputChange('breakDuration', '60');
            }}
            className="text-xs"
          >
            Full Day
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleInputChange('startTime', '09:00');
              handleInputChange('endTime', '13:00');
              handleInputChange('breakDuration', '30');
            }}
            className="text-xs"
          >
            Morning
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleInputChange('startTime', '14:00');
              handleInputChange('endTime', '18:00');
              handleInputChange('breakDuration', '15');
            }}
            className="text-xs"
          >
            Afternoon
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ManualTimeEntry;