import { useHasPermission } from "@/hooks/useHasPermission";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, UserCog, Users, Eye } from "lucide-react";

export const PermissionExample = () => {
  // Check for specific permissions
  const canManageUsers = useHasPermission("manage_users");
  const canManageProducts = useHasPermission("manage_products");
  const canViewReports = useHasPermission("reports");
  const canManageOrders = useHasPermission("manage_orders");
  const canManageCustomers = useHasPermission("manage_customers");
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission-Based Features</CardTitle>
        <CardDescription>Features visible based on your role permissions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {canManageUsers && (
            <Button className="w-full">
              <Shield className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
          )}
          
          {canManageProducts && (
            <Button variant="secondary" className="w-full">
              <UserCog className="mr-2 h-4 w-4" />
              Manage Products
            </Button>
          )}
          
          {canViewReports && (
            <Button variant="outline" className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          )}
          
          {(canManageOrders || canManageCustomers) && (
            <Button variant="ghost" className="w-full">
              <Users className="mr-2 h-4 w-4" />
              Customer Management
            </Button>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground mt-4">
          <p>This component demonstrates conditional rendering based on user permissions.</p>
          <p className="mt-2">Features are only visible if you have the required permissions.</p>
        </div>
      </CardContent>
    </Card>
  );
};