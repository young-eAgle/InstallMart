import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { CategoryManagement } from "@/components/CategoryManagement";
import { BannerManagement } from "@/components/BannerManagement";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, productApi } from "@/lib/api";
import { categoryApi } from "@/lib/api";
import type { AuthUser, Order, Product } from "@/types";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  ShieldAlert,
  TrendingUp,
  Users,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { ImageUpload } from "@/components/ImageUpload";

interface ProductFormState extends Partial<Product> {
  name?: string;
  price?: number;
  stock?: number;
  category?: string;
  subcategory?: string;
  brand?: string;
  description?: string | null;
  image_url?: string | null;
  featured?: boolean;
  tags?: string[];
  specifications?: Record<string, string>;
}

const AdminDashboard = () => {
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [availableSubcategories, setAvailableSubcategories] = useState<any[]>(
    [],
  );

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const enabled = Boolean(token && user?.role === "admin");

  const { data: statsData } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminApi.stats(token as string),
    enabled,
  });

  const { data: ordersData } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminApi.orders(token as string),
    enabled,
  });

  const { data: usersData } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => adminApi.users(token as string),
    enabled,
  });

  const { data: productsData } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => productApi.list(),
    enabled,
  });

  const orders = ordersData?.orders ?? [];
  const stats = statsData?.stats;
  const customers = (usersData?.users ?? []).filter(
    (profile: AuthUser) => profile.role === "customer",
  );
  const products = productsData?.products ?? [];

  ///
  // Fetch categories for product form
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.list(),
    enabled,
  });

  const categories = categoriesData?.categories ?? [];

  // Update subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(
        (cat: any) => cat.slug === selectedCategory,
      );
      setAvailableSubcategories(category?.subcategories || []);
    } else {
      setAvailableSubcategories([]);
    }
  }, [selectedCategory, categories]);

  // Set initial category when editing
  useEffect(() => {
    if (editingProduct) {
      setSelectedCategory(editingProduct.category || "");
      setProductForm({
        name: editingProduct.name,
        price: editingProduct.price,
        stock: editingProduct.stock,
        category: editingProduct.category,
        subcategory: editingProduct.subcategory,
        brand: editingProduct.brand,
        description: editingProduct.description,
        featured: editingProduct.featured,
        tags: editingProduct.tags,
        specifications: editingProduct.specifications,
      });
    }
  }, [editingProduct]);

  ///

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", productForm.name || "");
    formData.append("price", String(productForm.price || 0));
    formData.append("stock", String(productForm.stock || 0));
    formData.append("category", productForm.category || "");
    if (productForm.subcategory) {
      formData.append("subcategory", productForm.subcategory);
    }
    if (productForm.brand) {
      formData.append("brand", productForm.brand);
    }
    if (productForm.description) {
      formData.append("description", productForm.description);
    }
    formData.append("featured", String(productForm.featured || false));

    if (productForm.tags && productForm.tags.length > 0) {
      formData.append("tags", productForm.tags.join(","));
    }

    if (productForm.specifications) {
      formData.append(
        "specifications",
        JSON.stringify(productForm.specifications),
      );
    }

    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    try {
      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, formData, token!);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await adminApi.createProduct(formData, token!);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      setProductDialogOpen(false);
      setEditingProduct(null);
      setProductForm({});
      setSelectedImage(null);
      setSelectedCategory("");
      setAvailableSubcategories([]);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const result = await adminApi.deleteProduct(id, token);
      toast({
        title: "Success",
        description: result?.message || "Product deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    } catch (error: any) {
      console.error("Delete product error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handlePaymentStatus = async (
    orderId: string,
    status: "pending" | "verified" | "rejected",
  ) => {
    if (!token) return;
    try {
      await adminApi.updatePaymentStatus(orderId, status, token);
      toast({ title: "Payment status updated" });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    } catch (error) {
      toast({
        title: "Unable to update payment",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleInstallmentStatus = async (
    orderId: string,
    installmentId: string,
    status: "pending" | "paid" | "overdue",
  ) => {
    if (!token) return;
    try {
      await adminApi.updateInstallment(
        orderId,
        installmentId,
        { status },
        token,
      );
      toast({ title: "Installment updated" });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    } catch (error) {
      toast({
        title: "Unable to update installment",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const pendingInstallments = useMemo(
    () =>
      orders.reduce(
        (sum, order) =>
          sum +
          order.installments.filter((inst) => inst.status !== "paid").length,
        0,
      ),
    [orders],
  );

  if (loading || !user || user.role !== "admin") {
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

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rs. {stats ? stats.totalSales.toLocaleString() : "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalOrders ?? 0} total orders
              </p>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-green-600 font-medium">+12.5%</span>
                <span className="text-muted-foreground ml-1">
                  from last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Installments
              </CardTitle>
              <ShieldAlert className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                Rs.{" "}
                {stats?.pendingInstallments
                  ? stats.pendingInstallments.toLocaleString()
                  : "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.pendingInstallmentsCount || 0} pending payments
              </p>
            </CardContent>
          </Card>

          {stats?.overdueInstallments !== undefined && (
            <Card className="hover:shadow-lg transition-shadow border-red-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Overdue Payments
                </CardTitle>
                <ShieldAlert className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  Rs. {stats.overdueInstallments.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.overdueInstallmentsCount || 0} overdue
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalCustomers ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalProducts ?? 0} products
              </p>
            </CardContent>
          </Card>

          {stats?.upcomingPayments !== undefined && (
            <Card className="hover:shadow-lg transition-shadow border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming (30 Days)
                </CardTitle>
                <ShieldAlert className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  Rs. {stats.upcomingPayments.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.upcomingPaymentsCount || 0} due soon
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Commitment
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rs.{" "}
                {stats?.monthlyCommitment
                  ? stats.monthlyCommitment.toLocaleString()
                  : "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                Active installments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sales Trend Chart */}
        {stats?.monthlySales && stats.monthlySales.length > 0 && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Sales Trend
              </CardTitle>
              <CardDescription>
                Monthly sales and order volume over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stats.monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.98)",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === "sales")
                        return [`Rs. ${value.toLocaleString()}`, "Sales"];
                      return [value, "Orders"];
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="sales"
                    fill="#8b5cf6"
                    name="Sales (Rs.)"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="orders"
                    fill="#06b6d4"
                    name="Orders"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Payment Methods & Installment Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats?.paymentMethodStats && stats.paymentMethodStats.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Payment Methods
                </CardTitle>
                <CardDescription>
                  Distribution of payment methods used
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.paymentMethodStats.map((method, index) => {
                    const total = stats.paymentMethodStats.reduce(
                      (sum, m) => sum + m.count,
                      0,
                    );
                    const percentage = ((method.count / total) * 100).toFixed(
                      1,
                    );
                    const colors = [
                      "bg-purple-500",
                      "bg-blue-500",
                      "bg-green-500",
                    ];

                    return (
                      <div key={method._id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}
                            />
                            <span className="text-sm font-medium capitalize">
                              {method._id}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold">
                              {method.count} orders
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Rs. {method.total.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`${colors[index % colors.length]} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {percentage}% of total orders
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {stats?.installmentPlanStats &&
            stats.installmentPlanStats.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Installment Plans
                  </CardTitle>
                  <CardDescription>
                    Popular installment durations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.installmentPlanStats.map((plan, index) => {
                      const total = stats.installmentPlanStats.reduce(
                        (sum, p) => sum + p.count,
                        0,
                      );
                      const percentage = ((plan.count / total) * 100).toFixed(
                        1,
                      );
                      const colors = [
                        "bg-orange-500",
                        "bg-cyan-500",
                        "bg-pink-500",
                        "bg-indigo-500",
                      ];

                      return (
                        <div key={plan._id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}
                              />
                              <span className="text-sm font-medium">
                                {plan._id} months
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold">
                                {plan.count} orders
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Rs. {plan.totalValue.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`${colors[index % colors.length]} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {percentage}% of total orders
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>

        {/* Top Products */}
        {stats?.topProducts && stats.topProducts.length > 0 && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Top Selling Products
              </CardTitle>
              <CardDescription>Best performers by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topProducts.map((product, index) => {
                  const maxRevenue = Math.max(
                    ...stats.topProducts.map((p) => p.revenue),
                  );
                  const widthPercentage = (
                    (product.revenue / maxRevenue) *
                    100
                  ).toFixed(1);
                  const medals = ["🥇", "🥈", "🥉"];

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent text-white font-bold text-sm">
                            {medals[index] || index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {product.count} units sold
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">
                            Rs. {product.revenue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                          style={{ width: `${widthPercentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Methods Pie Chart */}
        {stats?.paymentMethodStats && stats.paymentMethodStats.length > 0 && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle>Payment Method Distribution</CardTitle>
              <CardDescription>
                Visual breakdown of payment preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.paymentMethodStats}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry._id}: ${entry.count}`}
                  >
                    {stats.paymentMethodStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={["#8b5cf6", "#06b6d4", "#10b981"][index % 3]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>
                  Best performing items by order volume
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats?.topProducts?.length ? (
                  stats.topProducts.map((product) => (
                    <div
                      key={product.name}
                      className="flex items-center justify-between rounded-lg border px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.count} units sold
                        </p>
                      </div>
                      <p className="font-bold">
                        Rs. {product.revenue.toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No sales recorded yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Product Catalog</CardTitle>
                  <CardDescription>Add, edit, or remove items</CardDescription>
                </div>

                <Dialog
                  open={productDialogOpen}
                  onOpenChange={setProductDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setEditingProduct(null);
                        setProductForm({});
                        setSelectedImage(null);
                        setSelectedCategory("");
                        setAvailableSubcategories([]);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">
                        {editingProduct ? "Edit Product" : "Add New Product"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingProduct
                          ? "Update product information and inventory"
                          : "Add a new product to your catalog with detailed information"}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleProductSubmit} className="space-y-6">
                      {/* Image Upload Section */}
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">
                          Product Image
                        </Label>
                        <ImageUpload
                          currentImage={editingProduct?.image_url}
                          onImageSelect={setSelectedImage}
                        />
                      </div>

                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">
                          Basic Information
                        </h3>
                        <div>
                          <Label htmlFor="name">Product Name *</Label>
                          <Input
                            id="name"
                            placeholder="e.g., iPhone 15 Pro Max"
                            value={productForm.name ?? ""}
                            onChange={(e) =>
                              setProductForm((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            required
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            placeholder="Brief description of the product"
                            value={productForm.description ?? ""}
                            onChange={(e) =>
                              setProductForm((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="brand">Brand</Label>
                          <Input
                            id="brand"
                            placeholder="e.g., Apple, Samsung, Sony"
                            value={productForm.brand ?? ""}
                            onChange={(e) =>
                              setProductForm((prev) => ({
                                ...prev,
                                brand: e.target.value,
                              }))
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>

                      {/* Category & Subcategory */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">
                          Category & Classification
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Category *</Label>
                            <Select
                              value={productForm.category ?? ""}
                              onValueChange={(value) => {
                                setProductForm((prev) => ({
                                  ...prev,
                                  category: value,
                                  subcategory: "", // Reset subcategory when category changes
                                }));
                                setSelectedCategory(value);
                              }}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.length === 0 ? (
                                  <SelectItem value="none" disabled>
                                    No categories available
                                  </SelectItem>
                                ) : (
                                  categories.map((category: any) => (
                                    <SelectItem
                                      key={category.id}
                                      value={category.slug}
                                    >
                                      {category.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Subcategory</Label>
                            <Select
                              value={productForm.subcategory ?? ""}
                              onValueChange={(value) =>
                                setProductForm((prev) => ({
                                  ...prev,
                                  subcategory: value,
                                }))
                              }
                              disabled={
                                !selectedCategory ||
                                availableSubcategories.length === 0
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select subcategory" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableSubcategories.length === 0 ? (
                                  <SelectItem value="none" disabled>
                                    {selectedCategory
                                      ? "No subcategories"
                                      : "Select category first"}
                                  </SelectItem>
                                ) : (
                                  availableSubcategories.map(
                                    (subcategory: any) => (
                                      <SelectItem
                                        key={subcategory._id}
                                        value={subcategory.slug}
                                      >
                                        {subcategory.name}
                                      </SelectItem>
                                    ),
                                  )
                                )}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                              {!selectedCategory
                                ? "Select a category first"
                                : availableSubcategories.length === 0
                                  ? "No subcategories available for this category"
                                  : "Optional: Narrow down the category"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Inventory */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">
                          Pricing & Inventory
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="price">Price (Rs.) *</Label>
                            <Input
                              id="price"
                              type="number"
                              placeholder="0"
                              min="0"
                              step="0.01"
                              value={productForm.price ?? ""}
                              onChange={(e) =>
                                setProductForm((prev) => ({
                                  ...prev,
                                  price: Number(e.target.value),
                                }))
                              }
                              required
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="stock">Stock Quantity *</Label>
                            <Input
                              id="stock"
                              type="number"
                              placeholder="0"
                              min="0"
                              value={productForm.stock ?? ""}
                              onChange={(e) =>
                                setProductForm((prev) => ({
                                  ...prev,
                                  stock: Number(e.target.value),
                                }))
                              }
                              required
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Featured Product Toggle */}
                      <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={productForm.featured ?? false}
                          onChange={(e) =>
                            setProductForm((prev) => ({
                              ...prev,
                              featured: e.target.checked,
                            }))
                          }
                          className="w-4 h-4"
                        />
                        <div>
                          <Label
                            htmlFor="featured"
                            className="cursor-pointer font-semibold"
                          >
                            Featured Product
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Display this product prominently on the homepage
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t">
                        <Button type="submit" className="flex-1">
                          {editingProduct ? "Update Product" : "Create Product"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setProductDialogOpen(false);
                            setEditingProduct(null);
                            setProductForm({});
                            setSelectedImage(null);
                            setSelectedCategory("");
                            setAvailableSubcategories([]);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-4">
                {products.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No products yet.
                  </p>
                ) : (
                  products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 rounded-lg border p-4"
                    >
                      <div className="h-16 w-16 overflow-hidden rounded-md bg-muted">
                        <img
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Rs. {product.price.toLocaleString()} · Stock{" "}
                          {product.stock} · {product.category}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditingProduct(product);
                            setProductForm(product);
                            setProductDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <CategoryManagement />
          </TabsContent>

          <TabsContent value="banners" className="space-y-4">
            <BannerManagement />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Orders & Installments</CardTitle>
                <CardDescription>
                  Verify payments and update installment statuses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No orders yet.
                  </p>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id || Math.random()}
                      className="rounded-lg border p-4 space-y-4"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold">
                            Order #{order.id?.slice(-6) || "N/A"} ·{" "}
                            {order.user?.fullName || "Unknown"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString()
                              : "N/A"}{" "}
                            · {order.items?.length || 0} items
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="capitalize">
                            {order.paymentMethod || "—"}
                          </Badge>
                          <Badge>Payment {order.paymentStatus || "—"}</Badge>
                          <Select
                            defaultValue={order.paymentStatus || "pending"}
                            onValueChange={(value) =>
                              handlePaymentStatus(
                                order.id || "",
                                value as "pending" | "verified" | "rejected",
                              )
                            }
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="verified">Verified</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="rounded-md bg-muted/40 p-3 text-sm">
                        <p>
                          <span className="text-muted-foreground">
                            Reference:
                          </span>{" "}
                          {order.paymentReference || "—"}
                        </p>
                        {order.paymentProofUrl && (
                          <a
                            href={order.paymentProofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline-offset-2 hover:underline"
                          >
                            View proof
                          </a>
                        )}
                      </div>

                      <div className="space-y-2">
                        {order.installments?.map((installment) => (
                          <div
                            key={installment._id || Math.random()}
                            className="flex flex-col gap-2 rounded-lg border bg-background px-3 py-2 text-sm md:flex-row md:items-center md:justify-between"
                          >
                            <div>
                              <p className="font-medium">
                                Due{" "}
                                {installment.dueDate
                                  ? new Date(
                                      installment.dueDate,
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </p>
                              <p className="text-muted-foreground">
                                Rs. {installment.amount?.toLocaleString() || 0}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  installment.status === "paid"
                                    ? "default"
                                    : installment.status === "overdue"
                                      ? "destructive"
                                      : "outline"
                                }
                              >
                                {installment.status || "pending"}
                              </Badge>
                              <Select
                                defaultValue={installment.status || "pending"}
                                onValueChange={(value) =>
                                  handleInstallmentStatus(
                                    order.id || "",
                                    installment._id || "",
                                    value as "pending" | "paid" | "overdue",
                                  )
                                }
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">
                                    Pending
                                  </SelectItem>
                                  <SelectItem value="paid">Paid</SelectItem>
                                  <SelectItem value="overdue">
                                    Overdue
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customers</CardTitle>
                <CardDescription>Overview of registered users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {customers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No customers yet.
                  </p>
                ) : (
                  customers.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold">{profile.fullName}</p>
                        <p className="text-muted-foreground">{profile.email}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Customer
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
