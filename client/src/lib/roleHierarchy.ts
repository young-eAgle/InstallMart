// Define the role hierarchy (higher index = higher privilege)
const ROLE_HIERARCHY = [
  "guest",
  "customer",
  "manager",
  "admin",
  "superadmin"
];

// Check if user has a specific role or higher
export const hasRoleOrHigher = (userRole: string, requiredRole: string): boolean => {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole);
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  
  // If either role is not in hierarchy, deny access
  if (userIndex === -1 || requiredIndex === -1) {
    return false;
  }
  
  return userIndex >= requiredIndex;
};

// Check if user has a specific role or lower
export const hasRoleOrLower = (userRole: string, requiredRole: string): boolean => {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole);
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  
  // If either role is not in hierarchy, deny access
  if (userIndex === -1 || requiredIndex === -1) {
    return false;
  }
  
  return userIndex <= requiredIndex;
};

// Get all roles with higher or equal privilege
export const getHigherOrEqualRoles = (role: string): string[] => {
  const roleIndex = ROLE_HIERARCHY.indexOf(role);
  if (roleIndex === -1) return [];
  
  return ROLE_HIERARCHY.slice(roleIndex);
};

// Get all roles with lower or equal privilege
export const getLowerOrEqualRoles = (role: string): string[] => {
  const roleIndex = ROLE_HIERARCHY.indexOf(role);
  if (roleIndex === -1) return [];
  
  return ROLE_HIERARCHY.slice(0, roleIndex + 1);
};