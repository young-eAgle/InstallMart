import { useAuth } from "@/contexts/AuthContext";
import { hasPermission, hasAnyPermission, hasAllPermissions, Permission } from "@/lib/permissions";

export const usePermissions = () => {
  const { user } = useAuth();
  
  const checkPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };
  
  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return hasAnyPermission(user.role, permissions);
  };
  
  const checkAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return hasAllPermissions(user.role, permissions);
  };
  
  const isSuperAdmin = user?.role === "superadmin";
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";
  const isCustomer = user?.role === "customer";
  const isGuest = user?.role === "guest";
  
  return {
    user,
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    isSuperAdmin,
    isAdmin,
    isManager,
    isCustomer,
    isGuest,
    role: user?.role
  };
};