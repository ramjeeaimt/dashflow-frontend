// RecentActivity.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';
import { formatDistanceToNow } from 'date-fns';

const RecentActivity = ({ activities, employees, onActivityClick }) => {
  const getActivityIcon = (type) => {
    switch(type) {
      case 'TASK_CREATED': return 'Plus';
      case 'TASK_UPDATED': return 'Edit';
      case 'TASK_DELETED': return 'Trash2';
      case 'TASK_STATUS_CHANGED': return 'ToggleRight';
      case 'COMMENT_ADDED': return 'MessageSquare';
      case 'TASK_ASSIGNED': return 'UserPlus';
      case 'BULK_TASK_UPDATE': return 'Layers';
      case 'FILTER_TASKS': return 'Filter';
      case 'VIEW_TASK': return 'Eye';
      default: return 'Activity';
    }
  };

  const getActivityColor = (type) => {
    switch(type) {
      case 'TASK_CREATED': return 'text-green-500';
      case 'TASK_DELETED': return 'text-red-500';
      case 'TASK_UPDATED': return 'text-blue-500';
      case 'COMMENT_ADDED': return 'text-purple-500';
      case 'TASK_ASSIGNED': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const getActivityMessage = (activity) => {
    const user = employees.find(e => e.id === activity.userId);
    const userName = user?.name || 'Someone';
    
    switch(activity.type) {
      case 'TASK_CREATED':
        return `${userName} created task "${activity.data?.taskTitle}"`;
      case 'TASK_UPDATED':
        return `${userName} updated task "${activity.data?.taskTitle}"`;
      case 'TASK_DELETED':
        return `${userName} deleted task "${activity.data?.taskTitle}"`;
      case 'TASK_STATUS_CHANGED':
        return `${userName} changed task "${activity.data?.taskTitle}" from ${activity.data?.oldStatus} to ${activity.data?.newStatus}`;
      case 'COMMENT_ADDED':
        return `${userName} commented on a task`;
      case 'TASK_ASSIGNED':
        return `${userName} assigned a task`;
      case 'BULK_TASK_UPDATE':
        return `${userName} performed bulk action on ${activity.data?.taskCount} tasks`;
      case 'VIEW_TASK':
        return `${userName} viewed task "${activity.data?.taskTitle}"`;
      default:
        return `${userName} performed an action`;
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
      </div>
      <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="p-4 hover:bg-accent/50 transition cursor-pointer"
              onClick={() => onActivityClick?.(activity)}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${getActivityColor(activity.type)}`}>
                  <Icon name={getActivityIcon(activity.type)} size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{getActivityMessage(activity)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
                {activity.data?.priority && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activity.data.priority === 'high' ? 'bg-red-100 text-red-700' :
                    activity.data.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {activity.data.priority}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <Icon name="Activity" size={40} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;