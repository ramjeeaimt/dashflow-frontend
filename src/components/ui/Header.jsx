import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import UserProfileDropdown from './UserProfileDropdown';
import NotificationCenter from './NotificationCenter';
import useAuthStore from '../../store/useAuthStore';
import CompanySwitcher from './CompanySwitcher';
import { isAdminUser } from '../../config/roles';

// Quick-nav destinations searched from the header. Admin-only routes are
// filtered by role before matching.
const NAV_TARGETS = [
  { label: 'Dashboard', path: '/dashboard', keywords: 'home overview' },
  { label: 'Employees', path: '/employee-management', keywords: 'people staff team', admin: true },
  { label: 'Attendance', path: '/attendance-management', keywords: 'checkin checkout presence' },
  { label: 'Leave management', path: '/employee-leave', keywords: 'holiday vacation time off approvals', admin: true },
  { label: 'My leaves', path: '/employee/leaves', keywords: 'holiday vacation time off request' },
  { label: 'Payroll', path: '/payroll', keywords: 'salary payslip finance', admin: true },
  { label: 'Projects', path: '/projects', keywords: 'work clients delivery' },
  { label: 'Tasks', path: '/task-management', keywords: 'todo assignments' },
  { label: 'Time tracking', path: '/time-tracking', keywords: 'timesheet hours timer' },
  { label: 'Notifications', path: '/notifications', keywords: 'alerts messages' },
  { label: 'Permissions', path: '/settings/user-permissions', keywords: 'roles permissions access settings', admin: true },
  { label: 'Roles', path: '/settings/roles', keywords: 'roles access settings', admin: true },
  { label: 'Clients', path: '/client-management', keywords: 'customers accounts', admin: true },
  { label: 'Profile', path: '/profile', keywords: 'account me password' },
];

const PAGE_TITLES = [
  ['/employee-dashboard', 'Dashboard'],
  ['/dashboard', 'Dashboard'],
  ['/employee-management', 'Employees'],
  ['/attendance', 'Attendance'],
  ['/leaves', 'Leaves'],
  ['/payroll', 'Payroll'],
  ['/task-management', 'Tasks'],
  ['/projects', 'Projects'],
  ['/time-tracking', 'Time tracking'],
  ['/settings', 'Settings'],
  ['/monitoring', 'Monitoring'],
  ['/notifications', 'Notifications'],
  ['/profile', 'Profile'],
];

const Header = ({ onToggleSidebar }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = isAdminUser(user);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const pageTitle = useMemo(() => {
    const hit = PAGE_TITLES.find(([prefix]) => location.pathname.includes(prefix));
    return hit ? hit[1] : 'Workspace';
  }, [location.pathname]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return NAV_TARGETS.filter(
      (t) =>
        (!t.admin || isAdmin) &&
        (t.label.toLowerCase().includes(q) || t.keywords.includes(q)),
    ).slice(0, 6);
  }, [query, isAdmin]);

  // Close on outside click; focus search with "/"
  useEffect(() => {
    const onClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const go = (path) => {
    setQuery('');
    setOpen(false);
    navigate(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-border z-40 h-16">
      <div className="flex items-center justify-between gap-3 h-full px-3 sm:px-6 lg:pl-[294px]">

        {/* Left: mobile menu + page context */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 -ml-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            aria-label="Open menu"
          >
            <Icon name="Menu" size={22} />
          </button>
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold tracking-tight text-foreground truncate">
              {pageTitle}
            </h2>
          </div>
        </div>

        {/* Center: global quick-nav search */}
        <div ref={searchRef} className="relative hidden md:block w-full max-w-md">
          <div className="relative">
            <Icon
              name="Search"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => query && setOpen(true)}
              placeholder="Go to…"
              className="w-full h-9 pl-9 pr-12 bg-muted/70 border border-transparent focus:border-border focus:bg-card rounded-md text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 bg-card">
              /
            </kbd>
          </div>

          {open && results.length > 0 && (
            <div className="absolute top-11 left-0 right-0 bg-popover border border-border rounded-lg dropdown-shadow overflow-hidden">
              {results.map((r) => (
                <button
                  key={r.path}
                  onClick={() => go(r.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-muted text-left transition-colors"
                >
                  <Icon name="CornerDownRight" size={14} className="text-muted-foreground" />
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: compact actions */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          {isAdmin && <CompanySwitcher />}
          <NotificationCenter />
          <div className="h-6 w-px bg-border hidden sm:block" />
          <UserProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
