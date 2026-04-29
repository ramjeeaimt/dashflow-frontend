import React, { useState } from 'react';
import Icon from '../AppIcon';
import UserProfileDropdown from './UserProfileDropdown';
import NotificationCenter from './NotificationCenter';
import useAuthStore from '../../store/useAuthStore';

const Header = ({ onToggleSidebar }) => {
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.some(r => ['Super Admin', 'Admin'].includes(r.name));

  const getPageTitle = () => {
    // ... same logic
    const path = window.location.pathname;
    if (path.includes('/dashboard')) return isAdmin ? 'Admin Dashboard' : 'Dashboard';
    if (path.includes('/employee-dashboard')) return 'Employee Dashboard';
    if (path.includes('/employee-management')) return 'Employee Management';
    if (path.includes('/attendance-management') || path.includes('/attendance')) return 'Attendance Management';
    if (path.includes('/employee/leaves') || path.includes('/admin/leaves')) return 'Leave Management';
    if (path.includes('/payroll')) return 'Payroll Management';
    if (path.includes('/task-management')) return 'Task Management';
    if (path.includes('/projects')) return 'Project Management';
    if (path.includes('/settings')) return 'Settings';
    if (path.includes('/monitoring')) return 'Monitoring Dashboard';
    return 'CRM HRM';
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-card border-b border-border z-50 h-16 shadow-sm">
      <div className="relative flex items-center justify-between h-full px-3 sm:px-6">

        {/* Left Section: Mobile Toggle & Logo */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 -ml-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name="Menu" size={24} />
          </button>
          
          <div className="hidden sm:block">
            <img className='h-10 sm:h-12 w-auto object-contain' src="/assets/images/crm.logo1.png" alt="CRM Logo" />
          </div>
        </div>

        {/* Center: Dynamic Page Title (Absolute Centered) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-[45%] sm:max-w-[60%] lg:max-w-none px-2">
          <h2 className="text-[10px] sm:text-sm lg:text-base font-semibold text-slate-800 uppercase tracking-[0.04em] sm:tracking-[0.08em] truncate">
            {getPageTitle()}
          </h2>
        </div>

        {/* Right Section: Notifications & Profile */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          <NotificationCenter />
          <UserProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
