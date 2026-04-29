import React, { useState } from 'react';
import Icon from '../AppIcon';
import ComingSoonModal from './ComingSoonModal';

import { useNavigate, useLocation } from 'react-router-dom';

import useAuthStore from '../../store/useAuthStore';

const Sidebar = ({ isCollapsed = false, onToggleCollapse, isMobileOpen = false, onMobileClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeItem = location.pathname;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, can } = useAuthStore();
  const isAdmin = user?.roles?.some(r => ['Admin', 'Super Admin', 'Manager'].includes(r.name)) || user?.email === 'admin@difmo.com';
  const comingSoonPaths = [];

  const allNavigationItems = [
    // ... (rest of navigation items)
    {
      label: isAdmin ? 'Dashboard' : 'Dashboard',
      path: '/dashboard',
      icon: isAdmin ? 'LayoutDashboard' : 'UserCircle',
      tooltip: isAdmin ? 'Analytics overview and metrics' : 'Personal attendance dashboard',
      permission: { action: 'read', resource: 'dashboard' },
      alwaysShow: true // Personal dashboard for everyone
    },
    {
      label: 'Employees',
      path: '/employee-management',
      icon: 'Users',
      tooltip: 'Workforce management',
      permission: { action: 'read', resource: 'employee' }
    },
    {
      label: 'Employee-Leave',
      path: '/employee-leave',
      icon: 'Users',
      tooltip: 'Manage team leaves',
      permission: { action: 'manage', resource: 'leave' }
    },
    {
      label: 'My Leaves',
      path: '/employee/leaves',
      icon: 'Calendar',
      tooltip: 'Apply and track leaves',
      permission: { action: 'read', resource: 'leave' },
      alwaysShow: true
    },
    {
      label: 'Attendance',
      path: '/attendance-management',
      icon: 'CalendarCheck',
      tooltip: 'Daily check-in/out management',
      permission: { action: 'manage', resource: 'attendance' }
    },
    {
      label: 'My Attendance',
      path: '/employee-attendance',
      icon: 'CalendarCheck',
      tooltip: 'My daily attendance',
      permission: { action: 'read', resource: 'attendance' },
      alwaysShow: true
    },
    {
      label: 'Client',
      path: '/client-management',
      icon: 'Briefcase',
      permission: { action: 'manage', resource: 'client' }
    },
    {
      label: 'Tasks',
      path: '/task-management',
      icon: 'CheckSquare',
      tooltip: 'Project and assignment management',
      permission: { action: 'read', resource: 'task' }
    },
    {
      label: 'Time Tracking',
      path: '/time-tracking',
      icon: 'Clock',
      tooltip: 'Productivity monitoring',
      permission: { action: 'read', resource: 'time-tracking' }
    },
    {
      label: 'Project',
      path: '/projects',
      icon: 'Folder',
      tooltip: 'Manage projects and assignments',
      permission: { action: 'manage', resource: 'project' }
    },
    {
      label: 'Monitoring',
      path: '/monitoring-dashboard',
      icon: 'Monitor',
      tooltip: 'Advanced oversight capabilities',
      permission: { action: 'manage', resource: 'monitoring' }
    },
    {
      label: 'Attendance Analytics',
      path: '/attendance-analytics',
      icon: 'LineChart',
      tooltip: 'Detailed attendance reports',
      permission: { action: 'manage', resource: 'attendance' }
    },

    {
      label: 'Payroll',
      path: '/payroll',
      icon: 'Calculator',
      tooltip: 'Financial processing',
      permission: { action: 'manage', resource: 'payroll' }
    },
    {
      label: 'My Payroll',
      path: '/employee/payroll',
      icon: 'Calculator',
      tooltip: 'View my payslips',
      permission: { action: 'read', resource: 'payroll' },
      alwaysShow: true
    },
    {
      label: 'Finance',
      path: '/finance',
      icon: 'DollarSign',
      tooltip: 'Revenue and Expense tracking',
      permission: { action: 'manage', resource: 'expense' }
    },
    {
      label: 'Company Profile',
      path: '/company-profile',
      icon: 'Building',
      tooltip: 'Manage company settings',
      permission: { action: 'update', resource: 'company' }
    },
    {
      label: 'Roles & Permissions',
      path: '/settings/roles',
      icon: 'Shield',
      tooltip: 'System configuration',
      permission: { action: 'manage', resource: 'access-control' }
    },
    {
      label: 'Difmo Jobs',
      path: '/difmo-jobs',
      icon: 'Briefcase',
      tooltip: 'Manage difmo jobs',
      permission: { action: 'read', resource: 'job' }
    }
  ];

  // Filter navigation items based on permissions
  const navigationItems = allNavigationItems.filter(item => {
    if (item.alwaysShow) return true;
    if (!item.permission) return false;
    return user?.roles?.some(r => ['Admin', 'Super Admin'].includes(r.name)) || user?.email === 'admin@difmo.com' || can(item.permission.action, item.permission.resource);
  });

  const handleNavigation = (path) => {
    if (comingSoonPaths.includes(path)) {
      setIsModalOpen(true);
      return;
    }
    navigate(path);
  };

  const handleToggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onMobileClose}
      />

      {/* Mobile Drawer Sidebar */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out overflow-hidden flex flex-col ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-border h-16">
          <img src="/assets/images/crm.logo1.png" alt="Logo" className="h-10 w-auto object-contain" />
          <button onClick={onMobileClose} className="p-2 text-muted-foreground hover:bg-muted rounded-md">
            <Icon name="X" size={20} />
          </button>
        </div>
        <nav className="flex-1 min-h-0 p-3 space-y-1.5 overflow-y-auto overscroll-contain">
          {navigationItems?.map((item) => {
            const isActive = activeItem === item?.path;
            return (
              <button
                key={item?.path}
                onClick={() => { handleNavigation(item?.path); onMobileClose(); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-[13px] font-medium rounded-lg transition-all ${
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={17} />
                <span>{item?.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:h-screen lg:flex-col bg-card border-r border-border transition-all duration-300 overflow-hidden ${isCollapsed ? 'lg:w-16' : 'lg:w-60'
        }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border min-h-[64px]">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
               <img src="/assets/images/crm.logo1.png" alt="Logo" className="h-10 w-auto object-contain" />
            </div>
          )}
          {isCollapsed && (
            <div className="flex items-center justify-center w-full">
               <img src="/assets/images/crm.logo1.png" alt="Logo" className="h-8 w-8 object-contain" />
            </div>
          )}
          <button
            onClick={handleToggleCollapse}
            className={`p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors duration-150 ${isCollapsed ? 'mx-auto mt-2' : ''
              }`}
          >
            <Icon name={isCollapsed ? "ChevronRight" : "ChevronLeft"} size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 min-h-0 p-3 space-y-1.5 overflow-y-auto overscroll-contain">
          {navigationItems?.map((item) => {
            const isActive = activeItem === item?.path;
            const isComingSoon = comingSoonPaths.includes(item?.path);

            return (
              <div key={item?.path} className="relative group">
                <button
                  onClick={() => handleNavigation(item?.path)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-[13px] font-medium rounded-lg transition-all duration-150 micro-interaction ${isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : isComingSoon
                      ? 'text-muted-foreground opacity-50 hover:opacity-80 hover:bg-muted/50'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon name={item?.icon} size={17} />
                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between">
                      <span>{item?.label}</span>
                      {isComingSoon && <Icon name="Lock" size={12} className="opacity-70" />}
                    </div>
                  )}
                </button>
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md border border-border dropdown-shadow opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50">
                    {item?.tooltip}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="shrink-0 p-4 border-t border-border">
          <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              {/* <Icon name="User" size={16} className="text-muted-foreground" /> */}
            </div>
            {/* {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">admin@company.com</p>
              </div>
            )} */}
          </div>
        </div>
      </aside>
      <ComingSoonModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Sidebar;
