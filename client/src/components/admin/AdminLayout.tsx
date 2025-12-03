import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminOverview } from "./AdminOverview";
import { AdminProducts } from "./AdminProducts";
import { AdminCategories } from "./AdminCategories";
import { AdminOrders } from "./AdminOrders";
import { AdminBanners } from "./AdminBanners";
import { AdminCustomers } from "./AdminCustomers";
import { AdminDocuments } from "./AdminDocuments";

export const AdminLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

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
            Manage products, orders, payments, and customers
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
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

          <TabsContent value="orders" className="space-y-4">
            <AdminOrders />
          </TabsContent>

          <TabsContent value="banners" className="space-y-4">
            <AdminBanners />
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <AdminCustomers />
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <AdminDocuments />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};