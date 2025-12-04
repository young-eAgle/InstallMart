import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Wallet,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Search,
  Filter
} from "lucide-react";
import { useState, useMemo } from "react";

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "—";

export const AdminPayments = () => {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const enabled = Boolean(token);

  const { data: ordersData } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminApi.orders(token as string),
    enabled,
  });

  const orders = ordersData?.orders ?? [];

  // Flatten all installments with order info
  const allInstallments = useMemo(() => {
    return orders.flatMap(order => 
      order.installments.map(installment => ({
        ...installment,
        order,
        user: order.user
      }))
    );
  }, [orders]);

  // Filter installments based on search and filters
  const filteredInstallments = useMemo(() => {
    return allInstallments.filter(installment => {
      const matchesSearch = 
        installment.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        installment.order?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        installment.order?.items?.some(item => 
          item.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesStatus = statusFilter === "all" || installment.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [allInstallments, searchTerm, statusFilter]);

  // Sort by due date (most urgent first)
  const sortedInstallments = useMemo(() => {
    return [...filteredInstallments].sort((a, b) => {
      // Overdue first, then pending, then paid
      const statusPriority: Record<string, number> = {
        "overdue": 1,
        "pending": 2,
        "paid": 3
      };
      
      const statusComparison = statusPriority[a.status] - statusPriority[b.status];
      if (statusComparison !== 0) return statusComparison;
      
      // Within same status, sort by due date
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [filteredInstallments]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalInstallments = allInstallments.length;
    const paidInstallments = allInstallments.filter(i => i.status === "paid").length;
    const pendingInstallments = allInstallments.filter(i => i.status === "pending").length;
    const overdueInstallments = allInstallments.filter(i => i.status === "overdue").length;
    const totalAmount = allInstallments.reduce((sum, inst) => sum + inst.amount, 0);
    const paidAmount = allInstallments
      .filter(i => i.status === "paid")
      .reduce((sum, inst) => sum + inst.amount, 0);
    
    return {
      totalInstallments,
      paidInstallments,
      pendingInstallments,
      overdueInstallments,
      totalAmount,
      paidAmount,
      collectionRate: totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0
    };
  }, [allInstallments]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Installments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalInstallments}</div>
            <p className="text-xs text-muted-foreground">All scheduled payments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected Amount</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₨ {summaryStats.paidAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              of ₨ {summaryStats.totalAmount.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.collectionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Payments collected</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.overdueInstallments}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search by customer, order, or product..."
                className="pl-8 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Installments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Payment Schedule
          </CardTitle>
          <CardDescription>
            Manage and track all installment payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedInstallments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No payments found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "No payments match your filters"
                  : "No payments scheduled yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedInstallments.map((installment) => {
                const itemName = installment.order?.items?.[0]?.name || "Order";
                const orderId = installment.order?.id
                  ? installment.order.id.slice(-6)
                  : "N/A";
                const customerName = installment.user?.fullName || "Unknown Customer";

                return (
                  <div
                    key={installment._id}
                    className={`border rounded-lg p-4 ${
                      installment.status === "overdue"
                        ? "border-destructive bg-destructive/5"
                        : installment.status === "paid"
                          ? "border-green-200 bg-green-50/50"
                          : "border-border"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="font-medium">{itemName}</p>
                        <p className="text-sm text-muted-foreground">
                          Order #{orderId} · {customerName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          ₨ {installment.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Due: {formatDate(installment.dueDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          installment.status === "paid"
                            ? "default"
                            : installment.status === "overdue"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {installment.status}
                      </Badge>
                      
                      {installment.paidAt && (
                        <p className="text-xs text-muted-foreground">
                          Paid: {new Date(installment.paidAt).toLocaleDateString()}
                        </p>
                      )}
                      
                      {installment.transactionId && (
                        <p className="text-xs text-muted-foreground">
                          TXN: {installment.transactionId}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};