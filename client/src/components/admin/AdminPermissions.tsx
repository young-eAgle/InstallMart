import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  UserCog, 
  User, 
  Shield, 
  Lock, 
  Key,
  Users,
  Crown
} from "lucide-react";
import type { AuthUser } from "@/types";

export const AdminPermissions = () => {
  const { user: currentUser, token } = useAuth();
  const queryClient = useQueryClient();

  const enabled = Boolean(token);

  const { data: usersData, refetch } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => adminApi.users(token as string),
    enabled,
  });

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await adminApi.updateUserRole(token as string, userId, newRole);
      // Refresh the users data
      refetch();
      // Invalidate and refetch queries related to user data
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  const users = (usersData?.users ?? []);

  // Role options for dropdown - filtered based on current user's role
  const getAvailableRoles = (currentUserRole: string) => {
    // Super admins can assign any role
    if (currentUserRole === "superadmin") {
      return [
        { value: "guest", label: "Guest", icon: User },
        { value: "customer", label: "Customer", icon: User },
        { value: "manager", label: "Manager", icon: UserCog },
        { value: "admin", label: "Admin", icon: Shield },
        { value: "superadmin", label: "Super Admin", icon: Crown },
      ];
    }
    
    // Admins can only assign guest, customer, or manager roles
    if (currentUserRole === "admin") {
      return [
        { value: "guest", label: "Guest", icon: User },
        { value: "customer", label: "Customer", icon: User },
        { value: "manager", label: "Manager", icon: UserCog },
      ];
    }
    
    // Other roles have no assignment permissions
    return [];
  };

  const availableRoles = currentUser ? getAvailableRoles(currentUser.role) : [];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "superadmin":
        return (
          <Badge className="bg-purple-600 hover:bg-purple-700 flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Super Admin
          </Badge>
        );
      case "admin":
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Admin
          </Badge>
        );
      case "manager":
        return (
          <Badge className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
            <UserCog className="h-3 w-3" />
            Manager
          </Badge>
        );
      case "customer":
        return (
          <Badge className="bg-gray-600 hover:bg-gray-700 flex items-center gap-1">
            <User className="h-3 w-3" />
            Customer
          </Badge>
        );
      case "guest":
        return (
          <Badge className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-1">
            <Users className="h-3 w-3" />
            Guest
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-600 hover:bg-gray-700 flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Unknown
          </Badge>
        );
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "superadmin": return <Crown className="h-4 w-4 text-purple-500" />;
      case "admin": return <Shield className="h-4 w-4 text-blue-500" />;
      case "manager": return <UserCog className="h-4 w-4 text-green-500" />;
      case "customer": return <User className="h-4 w-4 text-gray-500" />;
      case "guest": return <Users className="h-4 w-4 text-yellow-500" />;
      default: return <Lock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Permissions Management
        </CardTitle>
        <CardDescription>Manage user roles and permissions across the platform</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border p-4 bg-muted/50">
          <h3 className="font-semibold text-sm mb-2">Role Hierarchy</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Crown className="h-3 w-3 text-purple-500" />
              <span>Super Admin</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-blue-500" />
              <span>Admin</span>
            </div>
            <div className="flex items-center gap-1">
              <UserCog className="h-3 w-3 text-green-500" />
              <span>Manager</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-3 w-3 text-gray-500" />
              <span>Customer</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-yellow-500" />
              <span>Guest</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No users found.
            </p>
          ) : (
            users.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getRoleIcon(profile.role)}
                  <div>
                    <p className="font-semibold">{profile.fullName}</p>
                    <p className="text-muted-foreground text-xs">{profile.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getRoleBadge(profile.role)}
                  
                  {/* Only super admins can modify other super admins */}
                  {(currentUser?.role === "superadmin" || profile.role !== "superadmin") && (
                    <select
                      value={profile.role}
                      onChange={(e) => handleChangeRole(profile.id, e.target.value)}
                      className="ml-2 rounded border p-1 text-xs bg-background"
                      disabled={currentUser?.id === profile.id}
                    >
                      {availableRoles.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {currentUser?.id === profile.id && (
                    <Badge variant="outline" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};