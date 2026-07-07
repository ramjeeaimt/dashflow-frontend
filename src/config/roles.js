/**
 * Single source of truth for role & permission policy on the frontend.
 *
 * RULES
 * - No component may compare `user.email` or role-name strings inline — import
 *   these helpers instead. If a check you need is missing, add it HERE.
 * - Everything here is UX-gating only. The backend re-enforces authorization
 *   on every request; never rely on these checks for security.
 */

export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  HR_MANAGER: 'HR Manager',
  FINANCE: 'Finance',
  EMPLOYEE: 'Employee',
};

/** Roles that get the admin experience (admin dashboard, management pages). */
export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER];

/**
 * Legacy email allowlist granting admin regardless of assigned roles.
 * Kept in ONE place so it can be deleted once role assignments in the DB are
 * correct for these accounts. Do not add to this list — assign roles instead.
 */
export const SYSTEM_ADMIN_EMAILS = [
  'admin@difmo.com',
  'info@difmo.com',
  'hello@system.com',
  'pritam@difmo.com',
];

/** Account(s) that operate across all companies. */
export const GLOBAL_OWNER_EMAILS = ['hello@system.com'];

const norm = (value) => (value || '').trim().toUpperCase();

const userRoleNames = (user) =>
  (user?.roles || []).map((role) => norm(typeof role === 'string' ? role : role?.name));

/** True if the user holds ANY of the given roles (case-insensitive). */
export const hasRole = (user, ...roleNames) => {
  const owned = userRoleNames(user);
  return roleNames.some((name) => owned.includes(norm(name)));
};

/** True if the user holds any role other than Employee. */
export const hasNonEmployeeRole = (user) =>
  userRoleNames(user).some((name) => name && name !== norm(ROLES.EMPLOYEE));

export const isGlobalOwner = (user) =>
  GLOBAL_OWNER_EMAILS.some((email) => norm(email) === norm(user?.email));

/** Legacy allowlisted accounts — admin regardless of role rows. */
export const isSystemAdmin = (user) =>
  SYSTEM_ADMIN_EMAILS.some((email) => norm(email) === norm(user?.email));

/** The one canonical "is admin" check for the app. */
export const isAdminUser = (user) =>
  hasRole(user, ...ADMIN_ROLES) || isSystemAdmin(user);

/**
 * Permission check against the user's permission claims, with admin bypass.
 * Mirrors backend semantics: `manage` implies every action; resource `all`
 * implies every resource.
 */
export const canUser = (user, action, resource) => {
  if (!user) return false;
  if (isAdminUser(user)) return true;
  return (user.permissions || []).some(
    (p) =>
      (p.action === action || p.action === 'manage') &&
      (p.resource === resource || p.resource === 'all'),
  );
};
