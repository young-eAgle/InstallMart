import { useAuth } from "@/contexts/AuthContext";
import { hasRoleOrHigher, hasRoleOrLower, getHigherOrEqualRoles, getLowerOrEqualRoles } from "@/lib/roleHierarchy";

export const useRoleHierarchy = () => {
  const { user } = useAuth();
  
  const currentUserRole = user?.role || "guest";
  
  const hasRoleOrHigherThan = (requiredRole: string): boolean => {
    return hasRoleOrHigher(currentUserRole, requiredRole);
  };
  
  const hasRoleOrLowerThan = (requiredRole: string): boolean => {
    return hasRoleOrLower(currentUserRole, requiredRole);
  };
  
  const getRolesWithHigherOrEqualPrivilege = (): string[] => {
    return getHigherOrEqualRoles(currentUserRole);
  };
  
  const getRolesWithLowerOrEqualPrivilege = (): string[] => {
    return getLowerOrEqualRoles(currentUserRole);
  };
  
  return {
    currentUserRole,
    hasRoleOrHigherThan,
    hasRoleOrLowerThan,
    getRolesWithHigherOrEqualPrivilege,
    getRolesWithLowerOrEqualPrivilege,
    isSuperAdmin: currentUserRole === "superadmin",
    isAdmin: currentUserRole === "admin" || currentUserRole === "superadmin",
    isManager: currentUserRole === "manager",
    isCustomer: currentUserRole === "customer",
    isGuest: currentUserRole === "guest"
  };
};