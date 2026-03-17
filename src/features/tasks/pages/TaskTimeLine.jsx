// TaskTimeline.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';
import { format, formatDistanceToNow } from 'date-fns';

const TaskTimeline = ({ tasks, activities, onTaskClick }) => {
  // Combine tasks and activities into a timeline
  const timelineEvents = [
    ...tasks.map(task => ({
      id: `task-${task.id}`,
      type: 'task',
      date: task.createdAt,
      title: task.title,
      description: `Task created by ${task.createdBy}`,
      status: task.status,
      priority: task.priority,
      data: task
    })),
    ...activities.map(activity => ({
      id: `activity-${activity.id}`,
      type: 'activity',
      date: activity.timestamp,
      title: activity.type,
      description: activity.description || activity.message,
      data: activity
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Group by date
  const groupedEvents = timelineEvents.reduce((groups, event) => {
    const date = format(new Date(event.date), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {});

  const getEventIcon = (event) => {
    if (event.type === 'task') {
      switch(event.status) {
        case 'completed': return 'CheckCircle';
        case 'in-progress': return 'Loader2';
        case 'pending': return 'Clock';
        default: return 'CheckSquare';
      }
    }
    return 'Activity';
  };

  const getEventColor = (event) => {
    if (event.type === 'task') {
      switch(event.status) {
        case 'completed': return 'text-green-500';
        case 'in-progress': return 'text-blue-500';
        case 'pending': return 'text-yellow-500';
        default: return 'text-gray-500';
      }
    }
    return 'text-purple-500';
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Project Timeline</h2>
      </div>

      <div className="p-4 max-h-[600px] overflow-y-auto">
        {Object.keys(groupedEvents).map((date) => (
          <div key={date} className="mb-6">
            <div className="sticky top-0 bg-card z-10 py-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {format(new Date(date), 'MMMM d, yyyy')}
              </h3>
            </div>

            <div className="space-y-4">
              {groupedEvents[date].map((event) => (
                <div
                  key={event.id}
                  className="flex gap-3 group cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition"
                  onClick={() => {
                    if (event.type === 'task') {
                      onTaskClick(event.data);
                    }
                  }}
                >
                  <div className={`mt-1 ${getEventColor(event)}`}>
                    <Icon name={getEventIcon(event)} size={18} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {event.title}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.description}
                    </p>

                    {event.type === 'task' && (
                      <div className="flex gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          event.priority === 'high' ? 'bg-red-100 text-red-700' :
                          event.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {event.priority}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          event.status === 'completed' ? 'bg-green-100 text-green-700' :
                          event.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {timelineEvents.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Clock" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">No timeline events</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create tasks to see them in timeline
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskTimeline;