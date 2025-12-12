import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PaymentButton } from "@/components/PaymentButton";
import {
  Package,
  CreditCard,
  BellRing,
  CalendarRange,
  Wallet,
  ShoppingBag,
  Calendar,
  TrendingUp,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
  DollarSign,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@/lib/api";
import type { Installment, Order } from "@/types";

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "—";

const daysUntil = (value: string) => {
  const diff = new Date(value).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const SimpleDashboard = () => {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // 🔥 All hooks MUST be before any return
  const { data, isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: () => orderApi.mine(token as string),
    enabled: Boolean(user && token),
  });

  useEffect(() => {
    if (!authLoading && (!user || !token)) {
      navigate("/auth");
    }
  }, [user, token, authLoading, navigate]);

  // Data preparation AFTER hooks
  const orders = data?.orders ?? [];
  const activeOrders = orders.filter((o) => o.status !== "shipped").length;
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  const pendingInstallments = useMemo(() => {
    const upcoming: Array<Installment & { order: Order }> = [];

    orders.forEach((order) => {
      order.installments.forEach((inst) => {
        if (inst.status !== "paid") {
          upcoming.push({ 
            ...inst, 
            order: {
              ...order,
              id: order.id
            }
          });
        }
      });
    });

    return upcoming.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );
  }, [orders]);

  const nextPayment = pendingInstallments[0];
  const pendingTotal = pendingInstallments.reduce(
    (sum, inst) => sum + inst.amount,
    0,
  );

  const notifications = pendingInstallments
    .filter((inst) => daysUntil(inst.dueDate) <= 7)
    .map((inst) => ({
      message: `Installment for ${
        inst.order.items[0]?.name || "order"
      } is due on ${formatDate(inst.dueDate)}`,
      severity: daysUntil(inst.dueDate) < 0 ? "overdue" : "upcoming",
    }));

  const paymentHistory = useMemo(() => {
    const history: Array<Installment & { order: Order }> = [];

    orders.forEach((order) => {
      order.installments.forEach((inst) => {
        if (inst.status === "paid" && inst.paidAt) {
          history.push({ 
            ...inst, 
            order: {
              ...order,
              id: order.id
            }
          });
        }
      });
    });

    return history
      .sort(
        (a, b) => new Date(b.paidAt!).getTime() - new Date(a.paidAt!).getTime(),
      )
      .slice(0, 6);
  }, [orders]);

  // Toggle order expansion
  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  // 🔥 Conditional rendering AFTER hooks
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (!user || !token) return null;

  // -----------------------------------------------
  // MAIN UI (unchanged)
  // -----------------------------------------------

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Top Summary */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.fullName}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button 
            onClick={() => navigate("/products")} 
            className="h-20 flex flex-col items-center justify-center gap-2"
          >
            <ShoppingBag className="h-6 w-6" />
            <span>Browse Products</span>
          </Button>
          
          <Button 
            onClick={() => navigate("/orders")} 
            variant="secondary"
            className="h-20 flex flex-col items-center justify-center gap-2"
          >
            <FileText className="h-6 w-6" />
            <span>View All Orders</span>
          </Button>
          
          <Button 
            onClick={() => navigate("/payments")} 
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2"
          >
            <CreditCard className="h-6 w-6" />
            <span>Payment Center</span>
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Active Orders
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeOrders}</div>
            </CardContent>
          </Card>

          {/* Total Spent */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Lifetime Spend
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rs. {totalSpent.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Pending Installments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Installments
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingInstallments.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Rs. {pendingTotal.toLocaleString()} pending
              </p>
            </CardContent>
          </Card>

          {/* Next Payment */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Next Due Date
              </CardTitle>
              <CalendarRange className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {nextPayment ? formatDate(nextPayment.dueDate) : "All clear"}
              </div>
              {nextPayment && (
                <p className="text-xs text-muted-foreground">
                  Rs. {nextPayment.amount.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders + Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Orders */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription className="mt-1">
                    Track your orders and installment payments
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/orders")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading...</p>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No orders yet</p>
                  <Button onClick={() => navigate("/products")}>
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 4).map((order) => {
                    const orderId = order.id ? order.id.slice(-6) : "N/A";
                    const isExpanded = expandedOrders.has(order.id || "");
                    const nextInstallment = order.installments.find(inst => inst.status === "pending");
                    const paidInstallments = order.installments.filter(inst => inst.status === "paid").length;
                    const overdueInstallments = order.installments.filter(inst => inst.status === "overdue").length;
                    const totalInstallments = order.installments.length;
                    const installmentProgress = totalInstallments > 0 
                      ? (paidInstallments / totalInstallments) * 100 
                      : 0;
                    const totalPaid = order.installments
                      .filter(i => i.status === "paid")
                      .reduce((sum, i) => sum + (i.amount || 0), 0);
                    const remainingAmount = order.total - totalPaid;
                    
                    return (
                      <div
                        key={order.id}
                        className="rounded-lg border p-4 space-y-3 hover:shadow-md transition-shadow"
                      >
                        {/* Order Header */}
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-lg">Order #{orderId}</p>
                              {overdueInstallments > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  {overdueInstallments} Overdue
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {order.installmentMonths} months plan
                              </Badge>
                              <Badge 
                                variant={order.paymentStatus === "verified" ? "default" : "outline"}
                                className="text-xs"
                              >
                                {order.paymentStatus === "verified" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                {order.paymentStatus}
                              </Badge>
                              <Badge variant="outline" className="text-xs capitalize">
                                {order.paymentMethod}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-xl text-primary">
                              Rs. {order.total.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Rs. {remainingAmount.toLocaleString()} remaining
                            </p>
                          </div>
                        </div>
                        
                        {/* Installment Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Payment Progress</span>
                            <span className="font-medium">
                              {paidInstallments}/{totalInstallments} installments paid ({Math.round(installmentProgress)}%)
                            </span>
                          </div>
                          <Progress value={installmentProgress} className="h-2" />
                        </div>

                        {/* Next Installment Info */}
                        {nextInstallment && (
                          <div className="rounded-md bg-muted/40 p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">
                                    Next Payment: Rs. {nextInstallment.amount.toLocaleString()}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Due {formatDate(nextInstallment.dueDate)}
                                    {daysUntil(nextInstallment.dueDate) >= 0 ? (
                                      <span className={daysUntil(nextInstallment.dueDate) <= 3 ? "text-orange-600 ml-1" : "ml-1"}>
                                        ({daysUntil(nextInstallment.dueDate)} days)
                                      </span>
                                    ) : (
                                      <span className="text-destructive ml-1">
                                        ({Math.abs(daysUntil(nextInstallment.dueDate))} days overdue)
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <Badge 
                                variant={nextInstallment.status === "overdue" ? "destructive" : "outline"}
                                className="text-xs"
                              >
                                {nextInstallment.status}
                              </Badge>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleOrderExpansion(order.id || "")}
                            className="flex-1"
                          >
                            {isExpanded ? (
                              <><ChevronUp className="h-4 w-4 mr-2" /> Hide Details</>
                            ) : (
                              <><ChevronDown className="h-4 w-4 mr-2" /> Show Details</>
                            )}
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => navigate(`/orders`)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Full Details
                          </Button>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="space-y-4 pt-4 border-t">
                            {/* Order Items */}
                            <div>
                              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Order Items
                              </h4>
                              <div className="space-y-2">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-muted/30">
                                    <div className="flex items-center gap-2">
                                      <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          Qty: {item.quantity} × Rs. {item.price.toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                    <p className="font-medium">
                                      Rs. {(item.price * item.quantity).toLocaleString()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Complete Installment Schedule */}
                            <div>
                              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Complete Installment Schedule
                              </h4>
                              <div className="space-y-2">
                                {order.installments.map((inst, idx) => {
                                  const daysLeft = daysUntil(inst.dueDate);
                                  const isOverdue = inst.status === "overdue";
                                  const isDueSoon = inst.status === "pending" && daysLeft <= 3 && daysLeft > 0;
                                  const isPaid = inst.status === "paid";

                                  return (
                                    <div
                                      key={inst._id}
                                      className={`flex items-center justify-between p-3 rounded-lg border ${
                                        isPaid
                                          ? "bg-green-50/50 border-green-200"
                                          : isOverdue
                                            ? "bg-destructive/5 border-destructive"
                                            : isDueSoon
                                              ? "bg-yellow-50 border-yellow-300"
                                              : "bg-background"
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                          {idx + 1}
                                        </div>
                                        <div>
                                          <p className="font-medium text-sm">
                                            Rs. {inst.amount.toLocaleString()}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            Due: {formatDate(inst.dueDate)}
                                            {inst.status === "pending" && (
                                              <span className={daysLeft < 0 ? "text-destructive ml-1" : daysLeft <= 3 ? "text-orange-600 ml-1" : "ml-1"}>
                                                {daysLeft >= 0 ? `(${daysLeft} days)` : `(${Math.abs(daysLeft)} days overdue)`}
                                              </span>
                                            )}
                                          </p>
                                          {inst.paidAt && (
                                            <p className="text-xs text-green-600 mt-1">
                                              Paid on: {new Date(inst.paidAt).toLocaleDateString()}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant={
                                            isPaid
                                              ? "default"
                                              : isOverdue
                                                ? "destructive"
                                                : "outline"
                                          }
                                          className="text-xs"
                                        >
                                          {isPaid && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                          {isOverdue && <AlertCircle className="h-3 w-3 mr-1" />}
                                          {inst.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                                          {inst.status}
                                        </Badge>
                                        {isPaid && inst.transactionId && (
                                          <span className="text-xs text-muted-foreground font-mono">
                                            TXN: {inst.transactionId.substring(0, 8)}...
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Shipping Info */}
                            {order.shippingAddress && (
                              <div className="text-sm">
                                <h4 className="font-medium mb-1">Shipping Address</h4>
                                <p className="text-muted-foreground">{order.shippingAddress}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {orders.length > 4 && (
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => navigate("/orders")}
                    >
                      View All {orders.length} Orders
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-muted-foreground">You're all caught up!</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((note, i) => (
                    <div key={i} className="border p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <BellRing className="h-4 w-4 text-primary" />
                        <span className="font-medium">{note.severity}</span>
                      </div>
                      <p>{note.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment History & Pending Payments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pending Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Pending Payments
              </CardTitle>
              <CardDescription>Installments awaiting payment</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingInstallments.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p className="text-muted-foreground">
                    All payments are up to date!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingInstallments.slice(0, 5).map((inst) => {
                    const itemName = inst.order?.items?.[0]?.name || "Order";
                    const orderId = inst.order?.id
                      ? inst.order.id.slice(-6)
                      : "N/A";
                    const daysLeft = daysUntil(inst.dueDate);
                    const isOverdue = inst.status === "overdue";
                    const isDueSoon = daysLeft <= 3 && daysLeft > 0;

                    return (
                      <div
                        key={inst._id}
                        className={`border rounded-lg p-4 ${
                          isOverdue
                            ? "border-destructive bg-destructive/5"
                            : isDueSoon
                              ? "border-yellow-500 bg-yellow-50"
                              : "border-border"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="font-medium">{itemName}</p>
                            <p className="text-sm text-muted-foreground">
                              Order #{orderId}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              Rs. {inst.amount.toLocaleString()}
                            </p>
                            <p
                              className={`text-xs ${
                                isOverdue
                                  ? "text-destructive font-medium"
                                  : isDueSoon
                                    ? "text-yellow-600 font-medium"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {isOverdue
                                ? "OVERDUE"
                                : isDueSoon
                                  ? `Due in ${daysLeft} days`
                                  : `Due: ${formatDate(inst.dueDate)}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <Badge 
                            variant={inst.status === "overdue" ? "destructive" : "outline"}
                            className="text-xs"
                          >
                            {inst.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Payment #{inst.order?.installments.findIndex(i => i._id === inst._id)! + 1} of {inst.order?.installments.length}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <PaymentButton
                            order={inst.order}
                            installmentId={inst._id}
                            amount={inst.amount}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/orders`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {pendingInstallments.length > 5 && (
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => navigate("/orders")}
                    >
                      View All {pendingInstallments.length} Pending Payments
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Payment History
              </CardTitle>
              <CardDescription>Recently completed payments</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No payment history yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentHistory.slice(0, 5).map((inst) => {
                    const itemName = inst.order?.items?.[0]?.name || "Order";
                    const orderId = inst.order?.id
                      ? inst.order.id.slice(-6)
                      : "N/A";
                    const orderDate = inst.order?.createdAt
                      ? new Date(inst.order.createdAt).toLocaleDateString()
                      : "N/A";

                    return (
                      <div
                        key={inst._id}
                        className="border rounded-lg p-4 bg-green-50/50 border-green-200 hover:bg-green-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">{itemName}</p>
                            <p className="text-sm text-muted-foreground">
                              Order #{orderId} • {orderDate}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              Rs. {inst.amount.toLocaleString()}
                            </p>
                            <Badge 
                              variant="default"
                              className="text-xs"
                            >
                              PAID
                            </Badge>
                          </div>
                        </div>
                        {inst.transactionId && (
                          <div className="mt-2 pt-2 border-t border-green-100">
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">TXN ID:</span> {inst.transactionId}
                            </p>
                          </div>
                        )}
                        {inst.paidAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Paid on: {new Date(inst.paidAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  {paymentHistory.length > 5 && (
                    <Button 
                      variant="ghost" 
                      className="w-full"
                      onClick={() => navigate('/orders')}
                    >
                      View All Payment History
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;