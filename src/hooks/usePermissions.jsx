import useAuthStore from '../store/useAuthStore';
import {
  isAdminUser,
  isSystemAdmin,
  isGlobalOwner,
  hasRole,
  hasNonEmployeeRole,
  canUser,
} from '../config/roles';

/**
 * Convenience hook exposing the app's canonical role/permission checks for the
 * logged-in user. See src/config/roles.js — the single source of truth.
 */
const usePermissions = () => {
  const user = useAuthStore((state) => state.user);

  return {
    user,
    isAdmin: isAdminUser(user),
    isSystemAdmin: isSystemAdmin(user),
    isGlobalOwner: isGlobalOwner(user),
    hasNonEmployeeRole: hasNonEmployeeRole(user),
    hasRole: (...roles) => hasRole(user, ...roles),
    can: (action, resource) => canUser(user, action, resource),
  };
};

export default usePermissions;
