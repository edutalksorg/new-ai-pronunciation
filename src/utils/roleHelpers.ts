/**
 * Role-based Helper Functions
 * Utilities for checking user roles and permissions
 */

export type UserRole = 'user' | 'instructor' | 'admin' | 'learner';

/**
 * Check if user has a specific role
 */
export const hasRole = (userRole: string | undefined, checkRole: UserRole): boolean => {
  if (!userRole) return false;
  return userRole.toLowerCase().trim() === checkRole.toLowerCase();
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (userRole: string | undefined, roles: UserRole[]): boolean => {
  if (!userRole) return false;
  const normalizedRole = userRole.toLowerCase().trim();
  return roles.some(r => normalizedRole === r.toLowerCase());
};

/**
 * Check if user is an instructor
 */
export const isInstructor = (userRole: string | undefined): boolean => {
  return hasRole(userRole, 'instructor');
};

/**
 * Check if user is an admin
 */
export const isAdmin = (userRole: string | undefined): boolean => {
  return hasRole(userRole, 'admin');
};

/**
 * Check if user is a learner/regular user
 */
export const isLearner = (userRole: string | undefined): boolean => {
  return hasAnyRole(userRole, ['user', 'learner']);
};

/**
 * Get appropriate dashboard route based on user role
 */
export const getDashboardRoute = (userRole: string | undefined): string => {
  const role = userRole?.toLowerCase().trim();
  
  if (role === 'admin') {
    return '/admin';
  } else if (role === 'instructor') {
    return '/instructor-dashboard';
  } else {
    return '/dashboard';
  }
};

/**
 * Get human-readable role name
 */
export const getRoleDisplayName = (role: string | undefined): string => {
  if (!role) return 'Unknown';
  
  const lowerRole = role.toLowerCase().trim();
  
  switch (lowerRole) {
    case 'admin':
      return 'Administrator';
    case 'instructor':
      return 'Instructor';
    case 'user':
    case 'learner':
      return 'Learner';
    default:
      return role.charAt(0).toUpperCase() + role.slice(1);
  }
};

/**
 * Get role color for UI display
 */
export const getRoleColor = (role: string | undefined): string => {
  const lowerRole = role?.toLowerCase().trim();
  
  switch (lowerRole) {
    case 'admin':
      return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
    case 'instructor':
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
    case 'user':
    case 'learner':
      return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  }
};

/**
 * Get role icon class name (lucide-react)
 */
export const getRoleIcon = (role: string | undefined): string => {
  const lowerRole = role?.toLowerCase().trim();
  
  switch (lowerRole) {
    case 'admin':
      return 'ShieldCheck';
    case 'instructor':
      return 'Briefcase';
    case 'user':
    case 'learner':
      return 'BookOpen';
    default:
      return 'User';
  }
};

/**
 * Check if role can access admin functions
 */
export const canAccessAdmin = (userRole: string | undefined): boolean => {
  return isAdmin(userRole);
};

/**
 * Check if role can create content
 */
export const canCreateContent = (userRole: string | undefined): boolean => {
  return hasAnyRole(userRole, ['instructor', 'admin']);
};

/**
 * Check if role can manage users
 */
export const canManageUsers = (userRole: string | undefined): boolean => {
  return isAdmin(userRole);
};

/**
 * Check if role can view analytics
 */
export const canViewAnalytics = (userRole: string | undefined): boolean => {
  return hasAnyRole(userRole, ['instructor', 'admin']);
};
