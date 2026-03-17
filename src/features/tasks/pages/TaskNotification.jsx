// TaskNotifications.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';
import { formatDistanceToNow } from 'date-fns';

const TaskNotifications = ({ notifications, onMarkAsRead, onTaskClick }) => {
  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className="relative">
        <button
          className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition"
          onClick={() => {
            const dropdown = document.getElementById('notification-dropdown');
            dropdown?.classList.toggle('hidden');
          }}
        >
          <Icon name="Bell" size={20} />
          {unreadNotifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {unreadNotifications.length}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        <div
          id="notification-dropdown"
          className="hidden absolute bottom-14 left-0 w-80 bg-card border border-border rounded-lg shadow-xl overflow-hidden"
        >
          <div className="p-3 border-b border-border flex items-center justify-between">
            <h3 className="font-medium text-foreground">Notifications</h3>
            {unreadNotifications.length > 0 && (
              <button
                onClick={() => unreadNotifications.forEach(n => onMarkAsRead(n.id))}
                className="text-xs text-primary hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-border last:border-0 hover:bg-accent/50 transition cursor-pointer ${
                    !notification.read ? 'bg-accent/30' : ''
                  }`}
                  onClick={() => {
                    onMarkAsRead(notification.id);
                    if (notification.taskId) {
                      onTaskClick(notification.taskId);
                    }
                    document.getElementById('notification-dropdown')?.classList.add('hidden');
                  }}
                >
                  <div className="flex gap-2">
                    <div className={`mt-1 ${
                      notification.type === 'TASK_ASSIGNED' ? 'text-blue-500' :
                      notification.type === 'NEW_COMMENT' ? 'text-purple-500' :
                      notification.type === 'TASK_UPDATED' ? 'text-green-500' :
                      'text-gray-500'
                    }`}>
                      <Icon
                        name={
                          notification.type === 'TASK_ASSIGNED' ? 'UserPlus' :
                          notification.type === 'NEW_COMMENT' ? 'MessageSquare' :
                          notification.type === 'TASK_UPDATED' ? 'Edit' :
                          'Bell'
                        }
                        size={16}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Icon name="BellOff" size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskNotifications;