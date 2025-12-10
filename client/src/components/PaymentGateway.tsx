import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { orderApi } from "@/lib/api";
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
import { 
  CreditCard, 
  Wallet, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Download,
  Eye
} from "lucide-react";
import { PaymentButton } from "@/components/PaymentButton";
import { useNavigate } from "react-router-dom";
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

// Status styles for installments
const installmentStatusStyles: Record<string, string> = {
  paid: "bg-green-500/10 text-green-500 border-green-500/20",
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
};

export const PaymentGateway = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["orders", "payments", user?.id],
    queryFn: () => orderApi.mine(token as string),
    enabled: Boolean(user && token),
  });

  const orders = data?.orders ?? [];
  
  // Calculate payment statistics
  const paymentStats = {
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
    monthlyCommitment: orders.reduce((sum, order) => sum + order.monthlyPayment, 0),
    pendingInstallments: orders.reduce(
      (sum, order) => sum + order.installments.filter(i => i.status === "pending").length,
      0
    ),
    overdueInstallments: orders.reduce(
      (sum, order) => sum + order.installments.filter(i => i.status === "overdue").length,
      0
    ),
    paidInstallments: orders.reduce(
      (sum, order) => sum + order.installments.filter(i => i.status === "paid").length,
      0
    ),
  };

  // Get all installments with order info
  const allInstallments = orders.flatMap(order => 
    order.installments.map(installment => ({ ...installment, order }))
  );

  // Sort and get upcoming payments
  const upcomingPayments = allInstallments
    .filter(inst => inst.status === "pending" || inst.status === "overdue")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  // Get recent paid payments
  const recentPayments = allInstallments
    .filter(inst => inst.status === "paid")
    .sort((a, b) => new Date(b.paidAt || "").getTime() - new Date(a.paidAt || "").getTime())
    .slice(0, 5);

  // Calculate overall payment progress
  const totalInstallments = paymentStats.paidInstallments + paymentStats.pendingInstallments + paymentStats.overdueInstallments;
  const progressPercentage = totalInstallments > 0 
    ? Math.round((paymentStats.paidInstallments / totalInstallments) * 100) 
    : 0;

  // Calculate collection rate
  const collectionRate = totalInstallments > 0 
    ? Math.round((paymentStats.paidInstallments * 100) / totalInstallments) 
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-24 rounded-lg bg-muted/40 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Payment Progress
            </CardTitle>
            <CardDescription>
              Your overall installment payment progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Completion Rate</span>
                <span className="font-medium">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{paymentStats.paidInstallments}</p>
                <p className="text-xs text-muted-foreground">Paid</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{totalInstallments}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collection Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Collection Rate
            </CardTitle>
            <CardDescription>
              Percentage of payments successfully collected
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Collection Performance</span>
                <span className="font-medium">{collectionRate}%</span>
              </div>
              <Progress value={collectionRate} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">₨ {paymentStats.totalSpent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">₨ {allInstallments
  .filter(i => i.status === 'paid')
  .reduce((sum, i) => sum + i.amount, 0)
  .toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Collected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Original Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Active installment plans</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Commitment</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₨ {paymentStats.monthlyCommitment.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Next billing cycle</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentStats.pendingInstallments}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentStats.overdueInstallments}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Payments */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Payments
              </CardTitle>
              <CardDescription>Installments due in the next 30 days</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/orders')}
            >
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingPayments.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p className="text-muted-foreground">
                No upcoming payments! You're all caught up.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingPayments.map((installment) => {
                const itemName = installment.order?.items?.[0]?.name || "Order";
                const orderId = installment.order?.id
                  ? installment.order.id.slice(-6)
                  : "N/A";
                const daysLeft = daysUntil(installment.dueDate);
                const isOverdue = installment.status === "overdue";
                const isDueSoon = daysLeft <= 3 && daysLeft > 0;

                return (
                  <div
                    key={installment._id}
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
                          ₨ {installment.amount.toLocaleString()}
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
                              : `Due: ${formatDate(installment.dueDate)}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge 
                        className={`${installmentStatusStyles[installment.status] || ''}`}
                        variant="outline"
                      >
                        {installment.status.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Payment #{installment.order?.installments.findIndex(i => i._id === installment._id)! + 1} of {installment.order?.installments.length}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <PaymentButton
                        order={installment.order}
                        installmentId={installment._id}
                        amount={installment.amount}
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recent Payment History
              </CardTitle>
              <CardDescription>Recently completed payments</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentPayments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No payment history yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((installment) => {
                const itemName = installment.order?.items?.[0]?.name || "Order";
                const orderId = installment.order?.id
                  ? installment.order.id.slice(-6)
                  : "N/A";
                const orderDate = installment.order?.createdAt
                  ? new Date(installment.order.createdAt).toLocaleDateString()
                  : "N/A";

                return (
                  <div
                    key={installment._id}
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
                          ₨ {installment.amount.toLocaleString()}
                        </p>
                        <Badge 
                          className={`${installmentStatusStyles[installment.status] || ''}`}
                          variant="outline"
                        >
                          {installment.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    {installment.transactionId && (
                      <div className="mt-2 pt-2 border-t border-green-100">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">TXN ID:</span> {installment.transactionId}
                        </p>
                      </div>
                    )}
                    {installment.paidAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Paid on: {new Date(installment.paidAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                );
              })}
              {allInstallments.filter(inst => inst.status === "paid").length > 5 && (
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
  );
};