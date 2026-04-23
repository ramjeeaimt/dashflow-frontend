import React, { useState } from 'react';
import Icon from '../AppIcon';
import UserProfileDropdown from './UserProfileDropdown';
import NotificationCenter from './NotificationCenter';
import useAuthStore from '../../store/useAuthStore';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.some(r => ['Super Admin', 'Admin'].includes(r.name));

  const getPageTitle = () => {
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-card border-b border-border z-50 h-16 shadow-sm">
      <div className="relative flex items-center justify-between h-full px-6">

        {/* Left: Logo Section */}
        <div className="flex items-center">
          <div className="hidden sm:block">
            <img className='h-14 w-auto object-contain' src="/assets/images/crm.logo1.png" alt="CRM Logo" />
          </div>
        </div>

        {/* Center: Dynamic Page Title (Absolute Centered) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center whitespace-nowrap">
          <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase tracking-[0.1em]">
            {getPageTitle()}
          </h2>
        </div>

        {/* Right Section: Notifications & Profile */}
        <div className="flex items-center space-x-3">
          <NotificationCenter />
          <UserProfileDropdown />

          {/* Mobile Menu Button (Optional, can be removed if sidebar is main nav) */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Menu (Optional, can be removed if empty) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-card border-b border-border shadow-xl p-4">
          <p className="text-[10px] font-black text-slate-400 text-center uppercase tracking-widest">
            Navigation managed via sidebar
          </p>
        </div>
      )}
    </header>
  );
};

export default Header;