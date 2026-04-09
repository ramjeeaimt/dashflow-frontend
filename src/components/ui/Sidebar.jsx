import React, { useState } from 'react';
import Icon from '../AppIcon';
import ComingSoonModal from './ComingSoonModal';

import { useNavigate, useLocation } from 'react-router-dom';

import useAuthStore from '../../store/useAuthStore';

const Sidebar = ({ isCollapsed = false, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeItem = location.pathname;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.some(r => ['Super Admin', 'Admin'].includes(r.name));
  const isEmployee = user?.roles?.some(r => r.name === 'Employee');

  const comingSoonPaths = [];

  let navigationItems = [];

  if (isAdmin) {
    navigationItems = [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'LayoutDashboard',
        tooltip: 'Analytics overview and metrics'
      },
      {
        label: 'Employees',
        path: '/employee-management',
        icon: 'Users',
        tooltip: 'Workforce management'
      },
      {
        label: 'Employee-Leave',
        path: '/employee-leave',
        icon: 'Users',
        tooltip: 'Workforce management'
      },

      {
        label: 'Attendance',
        path: '/attendance-management',
        icon: 'CalendarCheck',
        tooltip: 'Daily check-in/out'
      },

       {
        label: 'Client',
        path: '/client-management',
        icon: 'CalendarCheck',
        
      },
      {
        label: 'Tasks',
        path: '/task-management',
        icon: 'CheckSquare',
        tooltip: 'Project and assignment management'
      },
      {
        label: 'Time Tracking',
        path: '/time-tracking',
        icon: 'Clock',
        tooltip: 'Productivity monitoring'
      },
      {
        label: 'Project',       
        path: '/projects',
        icon: 'Folder',
        tooltip: 'Manage projects and assignments'
      },
      {
        label: 'Monitoring',
        path: '/monitoring-dashboard',
        icon: 'Monitor',
        tooltip: 'Advanced oversight capabilities'
      },
      {
        label: 'Payroll',
        path: '/payroll',
        icon: 'Calculator',
        tooltip: 'Financial processing'
      },
      {
        label: 'Finance',
        path: '/finance',
        icon: 'DollarSign',
        tooltip: 'Revenue and Expense tracking'
      },
      {
        label: 'Company Profile',
        path: '/company-profile',
        icon: 'Building',
        tooltip: 'Manage company settings'
      },
      {
        label: 'Roles & Permissions',
        path: '/settings/roles',
        icon: 'Shield',
        tooltip: 'System configuration'
      },
      {
        label: 'Jobs',
        path: '/jobs',
        icon: 'Briefcase',
        tooltip: 'Manage job postings'
      },
      {
        label: 'Applications',
        path: '/jobs/applications',
        icon: 'ClipboardList',
        tooltip: 'Candidate applications'
      },
      {
        label: 'Messages',
        path: '/messages',
        icon: 'MessageSquare',
        tooltip: 'Recruitment & inquiries'
      },
    ];
  } else if (isEmployee) {
    navigationItems = [
      {
        label: 'Dashboard',
        path: '/employee-dashboard',
        icon: 'LayoutDashboard',
        tooltip: 'My Dashboard'
      },
      {
        label: 'My Leaves',
        path: '/employee/leaves',
        icon: 'EmployeeDashboardLayout', // Leave form/status ke liye
        tooltip: 'Apply and track leaves'
      },
      {
        label: 'My Payroll',
        path: '/employee/payroll',
        icon: 'EmployeeDashboardLayout', // Salary/Payslip ke liye
        tooltip: 'View my payslips and salary'
      },
      {
        label: 'Attendance',
        path: '/employee-attendance',
        icon: 'CalendarCheck',
        tooltip: 'My daily attendance'
      },
      //if needed add another field
    ];
  
  } else {
    // Default/Fallback (Full menu for now if no role matches, or handle as guest/error)
    navigationItems = [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'LayoutDashboard',
        tooltip: 'Analytics overview and metrics'
      },
      // ... simplified items?
      { label: 'Employees', path: '/employee-management', icon: 'Users', tooltip: 'Workforce management' },
    ];
  }

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
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex-col bg-card border-r border-border transition-all duration-300 ${isCollapsed ? 'lg:w-16' : 'lg:w-60'
        }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Building2" size={20} color="white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-foreground">CRM HRM</h1>
                <p className="text-xs text-muted-foreground">Productivity System</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
              <Icon name="Building2" size={20} color="white" />
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
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems?.map((item) => {
            const isActive = activeItem === item?.path;
            const isComingSoon = comingSoonPaths.includes(item?.path);

            return (
              <div key={item?.path} className="relative group">
                <button
                  onClick={() => handleNavigation(item?.path)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 micro-interaction ${isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : isComingSoon
                      ? 'text-muted-foreground opacity-50 hover:opacity-80 hover:bg-muted/50'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon name={item?.icon} size={18} />
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
        <div className="p-4 border-t border-border">
          <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <Icon name="User" size={16} className="text-muted-foreground" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">admin@company.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>
      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 h-16">
        <div className="flex items-center justify-around h-full px-2">
          {navigationItems?.slice(0, 4)?.map((item) => {
            const isActive = activeItem === item?.path;
            return (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`flex flex-col items-center justify-center space-y-1 px-2 py-1 rounded-lg transition-colors duration-150 ${isActive
                  ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Icon name={item?.icon} size={18} />
                <span className="text-xs font-medium">{item?.label}</span>
              </button>
            );
          })}

          {/* More button for additional items */}
          <div className="relative group">
            <button className="flex flex-col items-center justify-center space-y-1 px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors duration-150">
              <Icon name="MoreHorizontal" size={18} />
              <span className="text-xs font-medium">More</span>
            </button>

            {/* More dropdown */}
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-popover border border-border rounded-lg dropdown-shadow opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              <div className="py-2">
                {navigationItems?.slice(4)?.map((item) => (
                  <button
                    key={item?.path}
                    onClick={() => handleNavigation(item?.path)}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150"
                  >
                    <Icon name={item?.icon} size={16} />
                    <span>{item?.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <ComingSoonModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Sidebar;