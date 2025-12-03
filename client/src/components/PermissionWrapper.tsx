import { useAuth } from "@/contexts/AuthContext";
import { hasPermission, hasAnyPermission, hasAllPermissions, Permission } from "@/lib/permissions";

interface PermissionWrapperProps {
  permission?: Permission;
  permissions?: Permission[];
  condition?: "and" | "or";
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionWrapper = ({
  permission,
  permissions,
  condition = "and",
  fallback = null,
  children,
}: PermissionWrapperProps) => {
  const { user } = useAuth();
  
  // If no user, show fallback
  if (!user) {
    return <>{fallback}</>;
  }
  
  // If no permissions specified, show children
  if (!permission && !permissions) {
    return <>{children}</>;
  }
  
  // Check single permission
  if (permission && !permissions) {
    return hasPermission(user.role, permission) ? <>{children}</> : <>{fallback}</>;
  }
  
  // Check multiple permissions
  if (permissions) {
    const hasAccess = condition === "and" 
      ? hasAllPermissions(user.role, permissions)
      : hasAnyPermission(user.role, permissions);
      
    return hasAccess ? <>{children}</> : <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default PermissionWrapper;