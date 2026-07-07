import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import Image from '../AppImage';
import useAuthStore from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Get user initials (First + Last or just First)
  const getInitials = (firstName, lastName) => {
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    }
    if (firstName) return firstName.substring(0, 2).toUpperCase();
    return 'U';
  };

  const getFullName = (user) => {
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    if (user?.firstName) return user.firstName;
    if (user?.lastName) return user.lastName;
    return user?.email || 'User';
  };

  const getRoleName = (user) => {
    if (user?.roles?.length > 0) return user.roles[0].name || 'User';
    return 'User';
  };

  const userProfile = {
    name: getFullName(user),
    email: user?.email || '',
    role: getRoleName(user),
    avatar: user?.avatar, // Removed the hardcoded placeholder to trigger fallback
    initials: getInitials(user?.firstName, user?.lastName)
  };

  // Helper to render Avatar or Fallback Initials
  const renderAvatar = (sizeClass = "w-8 h-8", textClass = "text-[10px]") => {
    if (userProfile?.avatar && userProfile.avatar !== '/assets/images/avatar-placeholder.jpg') {
      return (
        <div className={`${sizeClass} rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border`}>
          <Image
            src={userProfile?.avatar}
            alt={userProfile?.name}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    // Fallback UI
    return (
      <div className={`${sizeClass} rounded-full bg-primary flex items-center justify-center border border-primary shadow-sm`}>
        <span className={`${textClass} font-semibold text-white tracking-tighter`}>
          {userProfile?.initials}
        </span>
      </div>
    );
  };

  const menuItems = [
    { label: 'My Profile', icon: 'User', action: () => handleNavigation('/profile'), description: 'View and manage your profile details' },
    { label: 'Notifications', icon: 'Bell', action: () => handleNavigation('/notifications'), description: 'Configure notification preferences' },
    { label: 'Sign Out', icon: 'LogOut', action: handleSignOut, description: 'Sign out of your account', variant: 'destructive' }
  ];

  function handleNavigation(path) {
    setIsOpen(false);
    window.location.href = path;
  }

  function handleSignOut() {
    setIsOpen(false);
    logout();
    navigate('/login');
  }

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-muted/50 transition-all duration-200 focus:outline-none"
      >
        <div className="relative">
          {renderAvatar("w-9 h-9", "text-xs")}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
        </div>

        <div className="hidden sm:block text-left">
          <p className="text-xs font-bold text-foreground leading-none">{userProfile?.name}</p>
          {/* <p className="text-[10px] text-muted-foreground/70 font-medium mt-1">{userProfile?.role}</p> */}
        </div>

        <Icon
          name="ChevronDown"
          size={14}
          className={`hidden sm:block text-muted-foreground/70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-sm z-50 overflow-hidden">
          {/* User Info Header */}
          <button
            onClick={() => handleNavigation('/profile')}
            className="w-full text-left p-4 bg-muted/50 border-b border-border hover:bg-muted/60 transition-colors flex items-center justify-between outline-none group"
          >
            <div className="flex items-center space-x-3">
              {renderAvatar("w-12 h-12", "text-base")}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{userProfile?.name}</p>
                <p className="text-[11px] text-muted-foreground truncate font-medium">{userProfile?.email}</p>
              </div>
            </div>
            <Icon name="ChevronRight" size={14} className="text-muted-foreground/70 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems?.map((item, index) => (
              <button
                key={index}
                onClick={item?.action}
                className={`w-full flex items-start space-x-3 px-4 py-3 text-left hover:bg-muted/60 transition-colors ${item?.variant === 'destructive' ? 'text-red-600' : 'text-foreground'
 }`}
              >
                <Icon
                  name={item?.icon}
                  size={16}
                  className={`mt-0.5 ${item?.variant === 'destructive' ? 'text-red-500' : 'text-muted-foreground/70'}`}
                />
                <div className="flex-1">
                  <p className="text-xs font-bold">{item?.label}</p>
                  <p className="text-[10px] text-muted-foreground/70 font-medium">{item?.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border bg-muted/30">
            <p className="text-[10px] text-muted-foreground/70 text-center font-bold uppercase tracking-wide">
              CRM Systems • 2026
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;