import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import useAuthStore from '../../store/useAuthStore';
import BrandMark, { BrandGlyph } from '../BrandMark';
import { ROLES, isGlobalOwner as isGlobalOwnerUser, isSystemAdmin as isSystemAdminUser, hasRole, hasNonEmployeeRole } from '../../config/roles';

const Sidebar = ({ isCollapsed = false, onToggleCollapse, isMobileOpen = false, onMobileClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = location.pathname;
  const { user, can } = useAuthStore();
  const [openGroups, setOpenGroups] = useState({});

  const isGlobalOwner = isGlobalOwnerUser(user);
  const isSystemAdmin = isSystemAdminUser(user);
  const isCompanyAdmin = isSystemAdmin || hasRole(user, ROLES.ADMIN);
  const isAdmin = isCompanyAdmin ||
    hasRole(user, ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.HR_MANAGER) ||
    hasNonEmployeeRole(user) ||
    (user?.permissions && user.permissions.length > 0) ||
    isGlobalOwner;

  const canAccess = (permission, alwaysShow = false) => {
    if (alwaysShow) return true;
    if (!permission) return false;
    const isFullAdmin = isCompanyAdmin || isSystemAdmin || isGlobalOwner;
    return isFullAdmin || can(permission.action, permission.resource);
  };

  const sections = useMemo(() => {
    if (!user) return [];

    const systemAdminSection = {
      key: 'system_administration',
      label: 'System Admin',
      items: [
        {
          key: 'manage_companies',
          label: 'Companies',
          icon: 'Building2',
          path: '/system/companies',
          alwaysShow: true
        },
        {
          key: 'global_users',
          label: 'All Users',
          icon: 'Globe',
          path: '/global-users',
          alwaysShow: true
        },
        { key: 'profile', label: 'My Profile', icon: 'UserCircle2', path: '/profile', alwaysShow: true },
      ]
    };

    if (isGlobalOwner) {
      return [systemAdminSection];
    }

    if (!isAdmin) {
      return [
        {
          key: 'workspace',
          label: 'Workspace',
          items: [
            { key: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard', alwaysShow: true },
            { key: 'notifications', label: 'Notifications', icon: 'Bell', path: '/notifications', alwaysShow: true },
            { key: 'quick-attendance', label: 'Quick Attendance', icon: 'Clock3', path: '/employee-check-in-check-out', alwaysShow: true },
            { key: 'my-attendance', label: 'My Attendance', icon: 'CalendarCheck', path: '/employee-attendance', alwaysShow: true },
            { key: 'my-leaves', label: 'My Leaves', icon: 'CalendarDays', path: '/employee/leaves', alwaysShow: true },
            { key: 'my-payroll', label: 'My Payroll', icon: 'ReceiptText', path: '/employee/payroll', alwaysShow: true },
            { key: 'profile', label: 'Profile', icon: 'UserCircle2', path: '/profile', alwaysShow: true },
          ]
        }
      ];
    }

    const adminSections = [
      {
        key: 'overview',
        label: 'Overview',
        items: [
          { key: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard', alwaysShow: true },
          { key: 'notifications', label: 'Notifications', icon: 'Bell', path: '/notifications', permission: { action: 'read', resource: 'notification' } },
          { key: 'email-templates', label: 'Email Templates', icon: 'Mail', path: '/notifications/templates', permission: { action: 'read', resource: 'notification' } },
        ]
      },
      {
        key: 'people',
        label: 'People',
        items: [
          {
            key: 'employees',
            label: 'Employees',
            icon: 'Users',
            children: [
              { key: 'employee-directory', label: 'Directory', path: '/employee-management', permission: { action: 'read', resource: 'employee' } },
              { key: 'employee-leaves', label: 'Leave Requests', path: '/employee-leave', permission: { action: 'manage', resource: 'leave' } },
              { key: 'attendance', label: 'Attendance', path: '/attendance-management', permission: { action: 'manage', resource: 'attendance' } },

            ]
          },
          !user?.roles?.some(r => r.name === 'Admin' || r.name === 'Super Admin') && {
            key: 'employee-self-service',
            label: 'Employee Self Service',
            icon: 'UserRound',
            children: [
              { key: 'my-attendance', label: 'My Attendance', path: '/employee-attendance', alwaysShow: true },
              { key: 'my-leaves', label: 'My Leaves', path: '/employee/leaves', alwaysShow: true },
              { key: 'my-payroll', label: 'My Payroll', path: '/employee/payroll', alwaysShow: true },
            ]
          }
        ].filter(Boolean)
      },
      {
        key: 'operations',
        label: 'Operations',
        items: [
          {
            key: 'work-management',
            label: 'Work Management',
            icon: 'BriefcaseBusiness',
            children: [
              { key: 'projects', label: 'Projects', path: '/projects', permission: { action: 'manage', resource: 'project' } },
              { key: 'tasks', label: 'Tasks', path: '/task-management', permission: { action: 'read', resource: 'task' } },
              { key: 'time-tracking', label: 'Time Tracking', path: '/time-tracking', permission: { action: 'read', resource: 'time-tracking' } },
              { key: 'monitoring', label: 'Monitoring', path: '/monitoring-dashboard', permission: { action: 'manage', resource: 'monitoring' } },
            ]
          },
          {
            key: 'recruitment',
            label: 'Recruitment',
            icon: 'Briefcase',
            children: [
              { key: 'jobs', label: 'Jobs', path: '/difmo-jobs', permission: { action: 'read', resource: 'job' } },
              { key: 'clients', label: 'Clients', path: '/client-management', permission: { action: 'manage', resource: 'client' } },
            ]
          }
        ]
      },
      {
        key: 'finance',
        label: 'Finance',
        items: [
          {
            key: 'finance-suite',
            label: 'Finance Suite',
            icon: 'Wallet',
            children: [
              { key: 'payroll', label: 'Payroll', path: '/payroll', permission: { action: 'manage', resource: 'payroll' } },
              { key: 'finance', label: 'Finance Dashboard', path: '/finance', permission: { action: 'manage', resource: 'expense' } },
            ]
          }
        ]
      },
      {
        key: 'administration',
        label: 'Administration',
        items: [
          {
            key: 'settings',
            label: 'Settings',
            icon: 'Settings',
            children: [
              { key: 'company-profile', label: 'Company Profile', path: '/company-profile', permission: { action: 'update', resource: 'company' } },
              isCompanyAdmin && { key: 'roles', label: 'Roles & Permissions', path: '/settings/roles', alwaysShow: true },
              isCompanyAdmin && { key: 'user-permissions', label: 'User Permissions', path: '/settings/user-permissions', alwaysShow: true },
              { key: 'profile', label: 'My Profile', path: '/profile', alwaysShow: true },
            ].filter(Boolean)
          }
        ]
      }
    ];

    if (isSystemAdmin) {
      // System Admin only sees the Global tools
      return [systemAdminSection];
    }

    // Company Admin/Standard Admin sees the Company tools
    return adminSections;
  }, [user, isAdmin, isSystemAdmin, isGlobalOwner, can]);

  const normalizedSections = useMemo(() => {
    return sections
      .map((section) => ({
        ...section,
        items: section.items
          .map((item) => {
            if (!item.children) {
              return canAccess(item.permission, item.alwaysShow) ? item : null;
            }

            const visibleChildren = item.children.filter((child) => canAccess(child.permission, child.alwaysShow));
            if (!visibleChildren.length) return null;
            return { ...item, children: visibleChildren };
          })
          .filter(Boolean)
      }))
      .filter((section) => section.items.length > 0);
  }, [sections]);

  useEffect(() => {
    const nextOpenGroups = {};
    normalizedSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children) {
          nextOpenGroups[item.key] = item.children.some((child) => activePath.startsWith(child.path));
        }
      });
    });
    setOpenGroups((prev) => ({ ...nextOpenGroups, ...prev }));
  }, [activePath, normalizedSections]);

  const isPathActive = (path) => activePath === path || activePath.startsWith(`${path}/`);
  const isGroupActive = (item) => item.children?.some((child) => isPathActive(child.path));

  const handleLeafNavigation = (path) => {
    navigate(path);
    onMobileClose?.();
  };

  const handleGroupClick = (item) => {
    if (isCollapsed) {
      const firstChild = item.children?.[0];
      if (firstChild?.path) {
        handleLeafNavigation(firstChild.path);
      }
      return;
    }
    setOpenGroups((prev) => ({ ...prev, [item.key]: !prev[item.key] }));
  };

  const renderLeafItem = (item, mobile = false) => {
    const isActive = isPathActive(item.path);
    return (
      <button
        key={item.key}
        onClick={() => handleLeafNavigation(item.path)}
        className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors ${isActive
 ? 'bg-sidebar-active text-sidebar-foreground font-medium'
 : 'text-sidebar-muted hover:bg-white/5 hover:text-sidebar-foreground'
 } ${isCollapsed && !mobile ? 'justify-center' : ''}`}
        title={isCollapsed && !mobile ? item.label : undefined}
      >
        <Icon name={item.icon} size={17} />
        {(!isCollapsed || mobile) && <span className="truncate">{item.label}</span>}
      </button>
    );
  };

  const renderGroupItem = (item, mobile = false) => {
    const expanded = mobile || openGroups[item.key];
    const active = isGroupActive(item);
    return (
      <div key={item.key} className="space-y-1">
        <button
          onClick={() => handleGroupClick(item)}
          className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors ${active
 ? 'text-sidebar-foreground font-medium'
 : 'text-sidebar-muted hover:bg-white/5 hover:text-sidebar-foreground'
 } ${isCollapsed && !mobile ? 'justify-center' : ''}`}
          title={isCollapsed && !mobile ? item.label : undefined}
        >
          <Icon name={item.icon} size={17} />
          {(!isCollapsed || mobile) && (
            <>
              <span className="flex-1 truncate text-left">{item.label}</span>
              <Icon name={expanded ? 'ChevronDown' : 'ChevronRight'} size={14} className="text-sidebar-muted" />
            </>
          )}
        </button>

        {(!isCollapsed || mobile) && expanded && (
          <div className="ml-4 space-y-1 border-l border-sidebar-border pl-3">
            {item.children.map((child) => {
              const childActive = isPathActive(child.path);
              return (
                <button
                  key={child.key}
                  onClick={() => handleLeafNavigation(child.path)}
                  className={`w-full rounded-md px-3 py-2 text-left text-[12px] transition-colors ${childActive
 ? 'bg-sidebar-active text-sidebar-foreground font-medium'
 : 'text-sidebar-muted hover:bg-white/5 hover:text-sidebar-foreground'
 }`}
                >
                  {child.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderSectionContent = (mobile = false) => (
    <div className="space-y-4">
      {normalizedSections.map((section) => (
        <div key={section.key} className="space-y-1.5">
          {(!isCollapsed || mobile) && (
            <p className="px-3 text-[11px] font-medium uppercase tracking-wide text-sidebar-muted/70">
              {section.label}
            </p>
          )}
          <div className="space-y-1">
            {section.items.map((item) => item.children ? renderGroupItem(item, mobile) : renderLeafItem(item, mobile))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div
        className={`lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
 }`}
        onClick={onMobileClose}
      />

      <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transform transition-transform duration-300 ease-in-out overflow-hidden flex flex-col ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
 }`}>
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border h-16">
          <BrandMark variant="dark" />
          <button onClick={onMobileClose} className="p-2 text-sidebar-muted hover:bg-white/5 hover:text-sidebar-foreground rounded-md">
            <Icon name="X" size={20} />
          </button>
        </div>
        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4">
          {renderSectionContent(true)}
        </nav>
      </aside>

      <aside className={`hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:h-screen lg:flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 overflow-hidden ${isCollapsed ? 'lg:w-16' : 'lg:w-60'
 }`}>
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border min-h-[64px]">
          {!isCollapsed ? (
            <BrandMark variant="dark" />
          ) : (
            <div className="flex items-center justify-center w-full">
              <BrandGlyph size={26} />
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className={`p-1.5 text-sidebar-muted hover:text-sidebar-foreground hover:bg-white/5 rounded-md transition-colors duration-150 ${isCollapsed ? 'mx-auto mt-2' : ''
 }`}
          >
            <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={16} />
          </button>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4">
          {renderSectionContent(false)}
        </nav>

        {!isCollapsed && (
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3 rounded-md border border-sidebar-border bg-white/5 px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                {(user?.firstName?.[0] || user?.email?.[0] || '?').toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email}
                </p>
                <p className="text-[11px] text-sidebar-muted truncate">
                  {isCompanyAdmin ? 'Admin' : isAdmin ? 'Staff' : 'Employee'}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
