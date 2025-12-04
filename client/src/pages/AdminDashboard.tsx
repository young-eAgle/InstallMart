import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminCategories } from "@/components/admin/AdminCategories";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminBanners } from "@/components/admin/AdminBanners";
import { AdminCustomers } from "@/components/admin/AdminCustomers";
import { AdminDocuments } from "@/components/admin/AdminDocuments";
import { AdminPermissions } from "@/components/admin/AdminPermissions";
import { AdminPayments } from "@/components/admin/AdminPayments";

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading || !user || (user.role !== "admin" && user.role !== "superadmin")) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 mr-2 animate-spin" />
          Loading admin portal...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage products, orders, payments, customers, and user permissions
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            {user?.role === "superadmin" && (
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <AdminProducts />
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <AdminCategories />
          </TabsContent>

          <TabsContent value="banners" className="space-y-4">
            <AdminBanners />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <AdminOrders />
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <AdminPayments />
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <AdminCustomers />
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <AdminDocuments />
          </TabsContent>
          
          {user?.role === "superadmin" && (
            <TabsContent value="permissions" className="space-y-4">
              <AdminPermissions />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
