# User Role and Permission System

This document explains the user role and permission system implemented in the e-commerce application.

## Role Hierarchy

The system implements the following role hierarchy (from lowest to highest privilege):

1. **Guest** - Read-only access to public content
2. **Customer** - Basic user actions (purchase, view orders, etc.)
3. **Manager** - Manage orders and customers
4. **Admin** - Manage users, products, and view reports
5. **Super Admin** - Full access with ability to assign roles to others

## Permissions Mapping

Each role has specific permissions:

### Super Admin
- `manage_users` - Full user management
- `manage_products` - Product management
- `reports` - Access to all reports
- `manage_orders` - Order management
- `manage_customers` - Customer management
- `basic_user_actions` - Basic user actions
- `read_only_public` - Read-only public access

### Admin
- `manage_users` - User management
- `manage_products` - Product management
- `reports` - Access to reports

### Manager
- `manage_orders` - Order management
- `manage_customers` - Customer management

### Customer
- `basic_user_actions` - Basic user actions

### Guest
- `read_only_public` - Read-only public access

## Implementation Details

### Frontend

1. **Permission Checking Hooks**:
   - `usePermissions()` - Comprehensive permission checking
   - `useHasPermission(permission)` - Check for specific permission
   - `useHasAnyPermission(permissions)` - Check for any of the specified permissions
   - `useHasAllPermissions(permissions)` - Check for all of the specified permissions
   - `useRoleHierarchy()` - Role-based hierarchy checking

2. **Permission Wrapper Component**:
   ```tsx
   <PermissionWrapper permission="manage_users">
     <button>Manage Users</button>
   </PermissionWrapper>
   ```

3. **Conditional Rendering**:
   ```tsx
   const canManageUsers = useHasPermission("manage_users");
   
   {canManageUsers && (
     <button>Manage Users</button>
   )}
   ```

### Backend

1. **Role Validation Middleware**:
   - `requireAdmin` - Allows admin and superadmin roles
   - `requireSuperAdmin` - Allows only superadmin role

2. **User Role Management API**:
   - PATCH `/api/admin/users/:userId/role` - Update user role (admin only)

3. **Database Schema**:
   - User model includes `role` field with enum validation

## Usage Examples

### Protecting Routes
```javascript
// In admin routes
router.use(protect, requireAdmin);
```

### Conditional Component Rendering
```tsx
const { isAdmin, isSuperAdmin } = usePermissions();

if (isSuperAdmin) {
  return <SuperAdminDashboard />;
} else if (isAdmin) {
  return <AdminDashboard />;
}
```

### Permission-Based UI Elements
```tsx
const canManageProducts = useHasPermission("manage_products");

{return canManageProducts && (
  <button onClick={handleEditProduct}>Edit Product</button>
)}
```

## Security Considerations

1. **Backend Validation**: All permission checks are also validated on the server side
2. **Role Assignment**: Only superadmins can assign the superadmin role to others
3. **Self-Protection**: Users cannot remove their own superadmin role
4. **Frontend Security**: UI elements are hidden based on permissions, but all API endpoints are also protected

## Setting Up Initial Super Admin

To create the initial Super Admin user:

1. Navigate to the server directory
2. Run the command:
   ```bash
   npm run create:superadmin
   ```

3. Customize credentials using environment variables:
   ```env
   SUPER_ADMIN_EMAIL=admin@yourecommerce.com
   SUPER_ADMIN_PASSWORD=YourSecurePassword123
   SUPER_ADMIN_NAME=Super Administrator
   ```

Refer to `SUPER_ADMIN_SETUP.md` for detailed instructions.

## Extending the System

To add new roles or permissions:

1. Update the `UserRole` type in `types/index.ts`
2. Add the role to the `ROLE_HIERARCHY` array in `lib/roleHierarchy.ts`
3. Update the role enum in the User model (`server/src/models/User.js`)
4. Add permission mappings in `lib/permissions.ts`
5. Update middleware if needed (`server/src/middleware/auth.js`)