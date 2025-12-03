// Define permission types
export type Permission = 
  | 'manage_users'
  | 'manage_products'
  | 'reports'
  | 'manage_orders'
  | 'manage_customers'
  | 'basic_user_actions'
  | 'read_only_public';

// Define role to permissions mapping
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  superadmin: [
    'manage_users',
    'manage_products',
    'reports',
    'manage_orders',
    'manage_customers',
    'basic_user_actions',
    'read_only_public'
  ],
  admin: [
    'manage_users',
    'manage_products',
    'reports'
  ],
  manager: [
    'manage_orders',
    'manage_customers'
  ],
  customer: [
    'basic_user_actions'
  ],
  guest: [
    'read_only_public'
  ]
};

// Check if user has a specific permission
export const hasPermission = (userRole: string, permission: Permission): boolean => {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
};

// Check if user has any of the specified permissions
export const hasAnyPermission = (userRole: string, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

// Check if user has all of the specified permissions
export const hasAllPermissions = (userRole: string, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(userRole, permission));
};