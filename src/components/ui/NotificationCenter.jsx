import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import { useNotificationStore } from '../../store/useNotificationStore';
import { formatDistance } from 'date-fns';
import notificationService from '../../services/notification.service';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, clearNotifications } = useNotificationStore();
  const [now, setNow] = useState(Date.now());

  // Update "time ago" every 30 seconds for better precision
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const getTimeAgo = (timestamp) => {
    try {
      if (!timestamp) return 'just now';
      // Use the 'now' state to force reactivity on every tick
      return formatDistance(new Date(timestamp), now, { addSuffix: true });
    } catch (e) {
      return 'just now';
    }
  };

  const dropdownRef = useRef(null);
  const unreadCount = notifications?.filter(n => !n?.read)?.length;

  const getNotificationIcon = (notification) => {
    // Prefer the domain event type over the generic channel strategy string
    const type = notification?.metadata?.type || notification?.type;
    const iconMap = {
      TASK_ASSIGNED: 'CheckSquare',
      LEAVE_REQUEST: 'Clock',
      LEAVE_STATUS: 'Clock',
      WFH_REQUEST: 'Home',
      WFH_STATUS: 'Home',
      PAYROLL_GENERATED: 'CreditCard',
      WELCOME: 'UserPlus',
      system: 'Settings',
      reminder: 'Bell',
      alert: 'AlertTriangle'
    };
    return iconMap?.[type] || 'Bell';
  };

  const getNotificationColor = (notification) => {
    const type = notification?.metadata?.type || notification?.type;
    const priority = notification?.metadata?.priority || notification?.priority;
    if (priority === 'high' || priority === 'HIGH') return 'text-error';
    if (type === 'LEAVE_REQUEST' || type === 'WFH_REQUEST') return 'text-warning';
    if (type === 'PAYROLL_GENERATED') return 'text-success';
    if (type === 'TASK_ASSIGNED' || type === 'WFH_STATUS') return 'text-primary';
    return 'text-muted-foreground';
  };

  const handleNotificationClick = (notification) => {
    const type = notification?.metadata?.type || notification?.type;
    
    // Navigate to relevant page
    if (notification?.actionUrl) {
      window.location.href = notification?.actionUrl;
    } else if (type === 'LEAVE_REQUEST') {
      window.location.href = '/employee-leave'; // Admin view
    } else if (type === 'LEAVE_STATUS') {
      window.location.href = '/employee/leaves'; // Employee view
    } else if (type === 'WFH_REQUEST') {
      window.location.href = '/attendance-management'; // Admin view
    } else if (type === 'WFH_STATUS') {
      window.location.href = '/employee-attendance'; // Employee view
    } else if (type === 'PAYROLL_GENERATED') {
      window.location.href = '/employee/payroll';
    } else if (type === 'TASK_ASSIGNED') {
      window.location.href = '/projects';
    }
    
    setIsOpen(false);
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Firestore onSnapshot will automatically update local state
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      if (window.confirm('Are you sure you want to clear all notifications?')) {
        await notificationService.clearAll();
      }
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event?.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Icon name="Bell" size={20} />
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-error text-error-foreground text-xs font-semibold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>
      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-popover border border-border rounded-lg dropdown-shadow z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-sm font-semibold text-popover-foreground">
              Notifications
            </h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:text-primary/80 font-medium transition-colors duration-150"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={clearAllNotifications}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications?.length === 0 ? (
              <div className="p-8 text-center">
                <Icon name="Bell" size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notifications</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You're all caught up!
                </p>
                <button 
                  onClick={() => { window.location.href = '/notifications'; setIsOpen(false); }}
                  className="mt-3 text-xs text-primary hover:text-primary/80 font-medium transition-colors duration-150"
                >
                  View all notifications
                </button>
              </div>
            ) : (
              <div className="py-2">
                {notifications?.map((notification) => (
                  <button
                    key={notification?.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full flex items-start space-x-3 p-4 text-left hover:bg-muted transition-colors duration-150 ${
                      !notification?.read ? 'bg-muted/50' : ''
                    }`}
                  >
                    <div className={`mt-1 ${getNotificationColor(notification)}`}>
                      <Icon name={getNotificationIcon(notification)} size={16} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className={`text-sm font-medium ${
                          !notification?.read ? 'text-popover-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification?.title}
                        </p>
                        {!notification?.read && (
                          <div className="w-2 h-2 bg-primary rounded-full ml-2 mt-1 flex-shrink-0"></div>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification?.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          {getTimeAgo(notification?.timestamp)}
                        </p>
                        {notification?.priority === 'high' && (
                          <span className="text-xs bg-error/10 text-error px-2 py-0.5 rounded-full font-medium">
                            High Priority
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications?.length > 0 && (
            <div className="p-3 border-t border-border">
              <button
                onClick={() => {
                  window.location.href = '/notifications';
                  setIsOpen(false);
                }}
                className="w-full text-center text-xs text-primary hover:text-primary/80 font-medium transition-colors duration-150"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;