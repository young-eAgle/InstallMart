import { useAuth } from "@/contexts/AuthContext";
import { Permission, hasPermission } from "@/lib/permissions";

export const useHasPermission = (permission: Permission) => {
  const { user } = useAuth();
  
  if (!user) {
    return false;
  }
  
  return hasPermission(user.role, permission);
};

export const useHasAnyPermission = (permissions: Permission[]) => {
  const { user } = useAuth();
  
  if (!user) {
    return false;
  }
  
  return permissions.some(permission => hasPermission(user.role, permission));
};

export const useHasAllPermissions = (permissions: Permission[]) => {
  const { user } = useAuth();
  
  if (!user) {
    return false;
  }
  
  return permissions.every(permission => hasPermission(user.role, permission));
};