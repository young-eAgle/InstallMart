import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  User, 
  Package,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  MoreVertical,
  Phone,
  MapPin,
  CreditCard,
  TrendingUp,
  DollarSign,
  FileText,
  Truck,
  CheckCircle
} from "lucide-react";
import { useState, useMemo } from "react";

export const AdminOrders = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [installmentStatusFilter, setInstallmentStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewMode, setViewMode] = useState<"customers" | "orders">("customers");

  const enabled = Boolean(token);

  const { data: ordersData } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminApi.orders(token as string),
    enabled,
  });

  const orders = ordersData?.orders ?? [];

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      const matchesSearch = 
        order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item => 
          item.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesPaymentStatus = paymentStatusFilter === "all" || order.paymentStatus === paymentStatusFilter;
      
      // Installment filter
      const matchesInstallmentStatus = installmentStatusFilter === "all" || 
        order.installments?.some(i => i.status === installmentStatusFilter);
      
      // Date filter
      const orderDate = order.createdAt ? new Date(order.createdAt) : null;
      const matchesDateFrom = !dateFrom || !orderDate || orderDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || !orderDate || orderDate <= new Date(dateTo + "T23:59:59");
      
      return matchesSearch && matchesStatus && matchesPaymentStatus && 
             matchesInstallmentStatus && matchesDateFrom && matchesDateTo;
    });
    
    // Sort orders
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "oldest":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "highest":
          return (b.total || 0) - (a.total || 0);
        case "lowest":
          return (a.total || 0) - (b.total || 0);
        default:
          return 0;
      }
    });
  }, [orders, searchTerm, statusFilter, paymentStatusFilter, installmentStatusFilter, sortBy, dateFrom, dateTo]);

  // Group orders by customer
  const customerData = useMemo(() => {
    const customerMap = new Map<string, {
      customerId: string;
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      orders: typeof orders;
      totalOrders: number;
      totalAmount: number;
      totalInstallments: number;
      paidInstallments: number;
      overdueInstallments: number;
      nextInstallment?: {
        orderId: string;
        amount: number;
        dueDate: string;
        daysUntilDue: number;
      };
      lastOrderDate?: string;
    }>();

    filteredOrders.forEach(order => {
      const customerId = order.user?.id || 'unknown';
      const customerName = order.user?.fullName || 'Unknown Customer';
      const customerEmail = order.user?.email || '';
      const customerPhone = order.phone;

      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          customerId,
          customerName,
          customerEmail,
          customerPhone,
          orders: [],
          totalOrders: 0,
          totalAmount: 0,
          totalInstallments: 0,
          paidInstallments: 0,
          overdueInstallments: 0,
        });
      }

      const customer = customerMap.get(customerId)!;
      customer.orders.push(order);
      customer.totalOrders++;
      customer.totalAmount += order.total || 0;
      customer.totalInstallments += order.installments?.length || 0;
      customer.paidInstallments += order.installments?.filter(i => i.status === 'paid').length || 0;
      customer.overdueInstallments += order.installments?.filter(i => i.status === 'overdue').length || 0;

      // Track last order date
      if (!customer.lastOrderDate || (order.createdAt && order.createdAt > customer.lastOrderDate)) {
        customer.lastOrderDate = order.createdAt;
      }

      // Find next upcoming installment
      order.installments?.forEach(installment => {
        if (installment.status === 'pending' && installment.dueDate) {
          const dueDate = new Date(installment.dueDate);
          const today = new Date();
          const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          if (!customer.nextInstallment || dueDate < new Date(customer.nextInstallment.dueDate)) {
            customer.nextInstallment = {
              orderId: order.id || '',
              amount: installment.amount || 0,
              dueDate: installment.dueDate,
              daysUntilDue,
            };
          }
        }
      });
    });

    return Array.from(customerMap.values()).sort((a, b) => {
      // Sort by customers with overdue installments first
      if (a.overdueInstallments !== b.overdueInstallments) {
        return b.overdueInstallments - a.overdueInstallments;
      }
      // Then by total amount (highest first)
      return b.totalAmount - a.totalAmount;
    });
  }, [filteredOrders]);

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

  // Toggle customer expansion
  const toggleCustomerExpansion = (customerId: string) => {
    const newExpanded = new Set(expandedCustomers);
    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId);
    } else {
      newExpanded.add(customerId);
    }
    setExpandedCustomers(newExpanded);
  };

  // Export orders to CSV
  const exportToCSV = () => {
    const headers = ["Order ID", "Customer", "Date", "Total", "Payment Status", "Order Status", "Installments"];
    const rows = filteredOrders.map(order => [
      order.id || "",
      order.user?.fullName || "",
      order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "",
      order.total || 0,
      order.paymentStatus || "",
      order.status || "",
      `${order.installments?.filter(i => i.status === "paid").length || 0}/${order.installments?.length || 0} paid`
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Orders exported successfully" });
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const pendingPayments = filteredOrders.filter(o => o.paymentStatus === "pending").length;
    const overdueInstallments = filteredOrders.reduce((count, order) => {
      return count + (order.installments?.filter(i => i.status === "overdue").length || 0);
    }, 0);
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    const totalInstallments = filteredOrders.reduce((count, order) => 
      count + (order.installments?.length || 0), 0);
    const paidInstallments = filteredOrders.reduce((count, order) => 
      count + (order.installments?.filter(i => i.status === "paid").length || 0), 0);
    const collectedRevenue = filteredOrders.reduce((sum, order) => {
      return sum + (order.installments?.filter(i => i.status === "paid")
        .reduce((s, i) => s + (i.amount || 0), 0) || 0);
    }, 0);
    
    return { 
      totalOrders, 
      pendingPayments, 
      overdueInstallments, 
      totalRevenue,
      totalInstallments,
      paidInstallments,
      collectedRevenue
    };
  }, [filteredOrders]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              from {orders.length} total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              awaiting verification
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{summaryStats.overdueInstallments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              require attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₨ {summaryStats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ₨ {summaryStats.collectedRevenue.toLocaleString()} collected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Installment Progress</p>
                <p className="text-2xl font-bold mt-1">
                  {summaryStats.totalInstallments > 0 
                    ? Math.round((summaryStats.paidInstallments / summaryStats.totalInstallments) * 100)
                    : 0}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <Progress 
              value={summaryStats.totalInstallments > 0 
                ? (summaryStats.paidInstallments / summaryStats.totalInstallments) * 100 
                : 0} 
              className="mt-3" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              {summaryStats.paidInstallments} of {summaryStats.totalInstallments} paid
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Collection Rate</p>
                <p className="text-2xl font-bold mt-1">
                  {summaryStats.totalRevenue > 0 
                    ? Math.round((summaryStats.collectedRevenue / summaryStats.totalRevenue) * 100)
                    : 0}%
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
            <Progress 
              value={summaryStats.totalRevenue > 0 
                ? (summaryStats.collectedRevenue / summaryStats.totalRevenue) * 100 
                : 0} 
              className="mt-3" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              ₨ {(summaryStats.totalRevenue - summaryStats.collectedRevenue).toLocaleString()} remaining
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Order Value</p>
                <p className="text-2xl font-bold mt-1">
                  ₨ {summaryStats.totalOrders > 0 
                    ? Math.round(summaryStats.totalRevenue / summaryStats.totalOrders).toLocaleString()
                    : 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              across {summaryStats.totalOrders} orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "customers" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("customers")}
                >
                  <User className="h-4 w-4 mr-2" />
                  Customer View
                </Button>
                <Button
                  variant={viewMode === "orders" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("orders")}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Order View
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={viewMode === "customers" ? "Search customers..." : "Search orders..."}
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={installmentStatusFilter} onValueChange={setInstallmentStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Installments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Installments</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="highest">Highest Value</SelectItem>
                    <SelectItem value="lowest">Lowest Value</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <label className="text-sm text-muted-foreground">From Date</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-muted-foreground">To Date</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="mt-1"
                />
              </div>
              {(dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="self-end"
                >
                  Clear Dates
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer/Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {viewMode === "customers" ? "Customer Installment Management" : "Orders & Installments"}
          </CardTitle>
          <CardDescription>
            {viewMode === "customers" 
              ? `Manage ${customerData.length} customers and their installment schedules`
              : "Verify payments and update installment statuses"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {viewMode === "customers" ? (
            // Customer View
            customerData.length === 0 ? (
              <div className="text-center py-8">
                <User className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No customers found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== "all" || paymentStatusFilter !== "all"
                    ? "No customers match your filters"
                    : "No customers with orders yet"}
                </p>
              </div>
            ) : (
              customerData.map((customer) => {
                const isExpanded = expandedCustomers.has(customer.customerId);
                const installmentProgress = customer.totalInstallments > 0
                  ? (customer.paidInstallments / customer.totalInstallments) * 100
                  : 0;

                return (
                  <div
                    key={customer.customerId}
                    className="rounded-lg border p-4 space-y-4"
                  >
                    {/* Customer Header */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">{customer.customerName}</h3>
                            {customer.overdueInstallments > 0 && (
                              <Badge variant="destructive" className="ml-2">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {customer.overdueInstallments} Overdue
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              {customer.customerEmail}
                            </span>
                            {customer.customerPhone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {customer.customerPhone}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {customer.totalOrders} {customer.totalOrders === 1 ? 'Order' : 'Orders'}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCustomerExpansion(customer.customerId)}
                        >
                          {isExpanded ? (
                            <><ChevronUp className="h-4 w-4" /> Hide Details</>
                          ) : (
                            <><ChevronDown className="h-4 w-4" /> View Details</>
                          )}
                        </Button>
                      </div>

                      {/* Customer Summary Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Total Amount</p>
                          <p className="text-lg font-bold">₨ {customer.totalAmount.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Installments Paid</p>
                          <p className="text-lg font-bold">
                            {customer.paidInstallments}/{customer.totalInstallments}
                          </p>
                          <Progress value={installmentProgress} className="h-1" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Next Payment</p>
                          {customer.nextInstallment ? (
                            <>
                              <p className="text-lg font-bold">₨ {customer.nextInstallment.amount.toLocaleString()}</p>
                              <p className="text-xs">
                                {customer.nextInstallment.daysUntilDue >= 0 ? (
                                  <span className={customer.nextInstallment.daysUntilDue <= 3 ? "text-orange-600" : "text-muted-foreground"}>
                                    In {customer.nextInstallment.daysUntilDue} days
                                  </span>
                                ) : (
                                  <span className="text-destructive">
                                    {Math.abs(customer.nextInstallment.daysUntilDue)} days overdue
                                  </span>
                                )}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">All paid</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Status</p>
                          {customer.overdueInstallments > 0 ? (
                            <Badge variant="destructive">Action Required</Badge>
                          ) : customer.paidInstallments === customer.totalInstallments ? (
                            <Badge className="bg-green-600">All Paid</Badge>
                          ) : (
                            <Badge>Active</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="space-y-4 pt-4 border-t">
                        {customer.orders.map((order) => (
                          <div key={order.id} className="rounded-md bg-muted/40 p-4 space-y-3">
                            {/* Order Header */}
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">
                                  Order #{order.id?.slice(-6) || "N/A"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {order.createdAt
                                    ? new Date(order.createdAt).toLocaleDateString()
                                    : "N/A"}{" "}
                                  · {order.items?.length || 0} items · ₨ {order.total?.toLocaleString() || 0}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="outline" className="capitalize">
                                  {order.paymentMethod || "—"}
                                </Badge>
                                <Badge 
                                  variant={order.paymentStatus === "verified" ? "default" : "outline"}
                                >
                                  {order.paymentStatus || "pending"}
                                </Badge>
                              </div>
                            </div>

                            {/* Payment Info */}
                            <div className="flex items-center justify-between text-sm">
                              <div>
                                <span className="text-muted-foreground">Reference: </span>
                                {order.paymentReference || "—"}
                                {order.paymentProofUrl && (
                                  <a
                                    href={order.paymentProofUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="ml-2 text-primary underline-offset-2 hover:underline"
                                  >
                                    View Proof
                                  </a>
                                )}
                              </div>
                              <Select
                                value={order.paymentStatus || "pending"}
                                onValueChange={(value) =>
                                  handlePaymentStatus(
                                    order.id || "",
                                    value as "pending" | "verified" | "rejected",
                                  )
                                }
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="verified">Verified</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Installments */}
                            <div className="space-y-2">
                              <h5 className="text-sm font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Installment Schedule
                              </h5>
                              {order.installments?.map((installment) => {
                                const dueDate = installment.dueDate ? new Date(installment.dueDate) : null;
                                const today = new Date();
                                const daysUntilDue = dueDate 
                                  ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                                  : 0;

                                return (
                                  <div
                                    key={installment._id || Math.random()}
                                    className="flex flex-col gap-2 rounded border bg-background px-3 py-2 text-sm md:flex-row md:items-center md:justify-between"
                                  >
                                    <div className="flex-1">
                                      <p className="font-medium">
                                        Due {dueDate ? dueDate.toLocaleDateString() : "N/A"}
                                        {installment.status === 'pending' && dueDate && (
                                          <span className={`ml-2 text-xs ${daysUntilDue < 0 ? 'text-destructive' : daysUntilDue <= 3 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                                            {daysUntilDue >= 0 ? `(${daysUntilDue} days)` : `(${Math.abs(daysUntilDue)} days overdue)`}
                                          </span>
                                        )}
                                      </p>
                                      <p className="text-muted-foreground">
                                        ₨ {installment.amount?.toLocaleString() || 0}
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
                                        {installment.status === "paid" && <CheckCircle className="h-3 w-3 mr-1" />}
                                        {installment.status === "overdue" && <AlertCircle className="h-3 w-3 mr-1" />}
                                        {installment.status || "pending"}
                                      </Badge>
                                      <Select
                                        value={installment.status || "pending"}
                                        onValueChange={(value) =>
                                          handleInstallmentStatus(
                                            order.id || "",
                                            installment._id || "",
                                            value as "pending" | "paid" | "overdue",
                                          )
                                        }
                                      >
                                        <SelectTrigger className="w-[110px]">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">Pending</SelectItem>
                                          <SelectItem value="paid">Paid</SelectItem>
                                          <SelectItem value="overdue">Overdue</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )
          ) : (
            // Original Order View
            filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No orders found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all" || paymentStatusFilter !== "all"
                  ? "No orders match your filters"
                  : "No orders yet"}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id || Math.random()}
                className="rounded-lg border p-4 space-y-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        Order #{order.id?.slice(-6) || "N/A"}
                      </p>
                      <Badge variant="outline">
                        <User className="h-3 w-3 mr-1" />
                        {order.user?.fullName || "Unknown"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "N/A"}{" "}
                      · {order.items?.length || 0} items · ₨ {order.total?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="capitalize">
                      {order.paymentMethod || "—"}
                    </Badge>
                    <Badge 
                      variant={order.paymentStatus === "verified" ? "default" : "outline"}
                    >
                      Payment {order.paymentStatus || "—"}
                    </Badge>
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
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Installment Schedule
                  </h4>
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
                          ₨ {installment.amount?.toLocaleString() || 0}
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
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};