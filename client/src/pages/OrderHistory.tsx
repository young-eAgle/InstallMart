import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Calendar, 
  DollarSign, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  Clock,
  TrendingUp,
  FileText,
  Truck,
  CreditCard
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@/lib/api";
import { PaymentButton } from "@/components/PaymentButton";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  approved: "bg-green-500/10 text-green-500 border-green-500/20",
  shipped: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

// New status styles for installment statuses
const installmentStatusStyles: Record<string, string> = {
  paid: "bg-green-500/10 text-green-500 border-green-500/20",
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
};

const OrderHistory = () => {
  const navigate = useNavigate();
  const { user, token, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!user || !token)) {
      navigate("/auth");
    }
  }, [user, token, authLoading, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["orders", "history", user?.id],
    queryFn: () => orderApi.mine(token as string),
    enabled: Boolean(user && token),
  });

  const orders = data?.orders ?? [];
  const totalFinanced = orders.reduce((sum, order) => sum + order.total, 0);
  const monthlyCommitment = orders.reduce(
    (sum, order) => sum + order.monthlyPayment,
    0,
  );

  // Safe helper to get last 6 chars of order ID
  const getOrderIdDisplay = (id: string | undefined): string => {
    if (!id || typeof id !== "string") return "N/A";
    return id.length > 6 ? id.slice(-6) : id;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
          Loading orders...
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Order History</h1>
          <p className="text-muted-foreground">
            View and manage all your purchases and installment plans
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Active Plans
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Financed
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rs. {totalFinanced.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Across all plans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Installments
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.reduce(
                  (sum, order) =>
                    sum +
                    order.installments.filter((inst) => inst.status !== "paid")
                      .length,
                  0,
                )}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Commitment
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rs. {monthlyCommitment.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Next billing cycle
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="h-24 rounded-lg bg-muted/40 animate-pulse" />
                </CardContent>
              </Card>
            ))
          ) : orders.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start shopping to see your order history here
                </p>
                <Button onClick={() => navigate("/products")}>
                  Browse Products
                </Button>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => {
              // Calculate payment statistics for this order
              const paidInstallments = order.installments.filter(i => i.status === "paid").length;
              const pendingInstallments = order.installments.filter(i => i.status === "pending").length;
              const overdueInstallments = order.installments.filter(i => i.status === "overdue").length;
              const totalInstallments = order.installments.length;
              
              // Get next due installment
              const nextDueInstallment = order.installments.find(i => i.status === "pending") || 
                                       order.installments.find(i => i.status === "overdue");
              
              // Calculate progress percentage
              const progressPercentage = totalInstallments > 0 
                ? Math.round((paidInstallments / totalInstallments) * 100) 
                : 0;
              
              return (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">
                            Order #{getOrderIdDisplay(order.id)}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              className={
                                statusStyles[order.status] || statusStyles.pending
                              }
                            >
                              {order.status}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {order.paymentMethod}
                            </Badge>
                            <Badge
                              variant={
                                order.paymentStatus === "verified"
                                  ? "default"
                                  : "outline"
                              }
                            >
                              Payment {order.paymentStatus}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Order Date</p>
                            <p className="font-medium">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Items</p>
                            <p className="font-medium">{order.items.length}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Plan</p>
                            <p className="font-medium">
                              {order.installmentMonths} months
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Monthly</p>
                            <p className="font-medium">
                              Rs. {order.monthlyPayment.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm pt-3 border-t">
                          <div>
                            <p className="text-muted-foreground">
                              Payment Reference
                            </p>
                            <p className="font-medium">
                              {order.paymentReference || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Proof</p>
                            {order.paymentProofUrl ? (
                              <a
                                href={order.paymentProofUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-primary underline-offset-2 hover:underline"
                              >
                                View proof
                              </a>
                            ) : (
                              <p className="font-medium">Not uploaded</p>
                            )}
                          </div>
                          <div>
                            <p className="text-muted-foreground">Progress</p>
                            <p className="font-medium">
                              {paidInstallments}/{totalInstallments} paid
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Next Payment</p>
                            <p className="font-medium">
                              {nextDueInstallment 
                                ? `${new Date(nextDueInstallment.dueDate).toLocaleDateString()} (${nextDueInstallment.status})`
                                : "All paid"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-2">
                        <p className="text-2xl font-bold text-primary">
                          Rs. {order.total.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.shippingAddress}
                        </p>
                        <Button 
                          variant="ghost" 
                          className="mt-2"
                          onClick={() => navigate(`/payments`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View All Payments
                        </Button>
                      </div>
                    </div>

                    {/* Progress bar for installment completion */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Installment Progress</span>
                        <span className="font-medium">{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-lg border bg-muted/30 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Installment Schedule
                        </h4>
                        <div className="flex items-center gap-4 text-xs">
                          {nextDueInstallment && (
                            <span className="text-muted-foreground">
                              Next due:{" "}
                              {new Date(nextDueInstallment.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{paidInstallments} paid</span>
                          </div>
                          {(pendingInstallments > 0 || overdueInstallments > 0) && (
                            <>
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-amber-500" />
                                <span>{pendingInstallments} pending</span>
                              </div>
                              {overdueInstallments > 0 && (
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="h-3 w-3 text-red-500" />
                                  <span>{overdueInstallments} overdue</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="grid gap-2">
                        {order.installments.map((installment, index) => (
                          <div
                            key={installment._id}
                            className={`flex flex-col md:flex-row md:items-center justify-between rounded-md border px-4 py-3 text-sm gap-3 ${
                              installment.status === "overdue"
                                ? "bg-destructive/5 border-destructive"
                                : installment.status === "paid"
                                  ? "bg-green-50 border-green-200"
                                  : "bg-background border-muted"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium 
                                ${installment.status === "paid" 
                                  ? "bg-green-500 text-white" 
                                  : installment.status === "overdue" 
                                    ? "bg-destructive text-white" 
                                    : "bg-muted text-foreground"}`}>
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">
                                  Payment #{index + 1} - Due {" "}
                                  {new Date(installment.dueDate).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {installment.transactionId
                                    ? `Txn: ${installment.transactionId}`
                                    : "Awaiting payment"}
                                </p>
                                {installment.paidAt && (
                                  <p className="text-xs text-green-600 mt-1">
                                    Paid: {new Date(installment.paidAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right min-w-[120px]">
                                <p className="font-semibold">
                                  Rs. {installment.amount.toLocaleString()}
                                </p>
                                <Badge 
                                  className={`mt-1 ${installmentStatusStyles[installment.status] || ''}`}
                                  variant="outline"
                                >
                                  {installment.status.toUpperCase()}
                                </Badge>
                                {installment.paidAt && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Paid: {new Date(installment.paidAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>

                              {installment.status !== "paid" && (
                                <PaymentButton
                                  order={order}
                                  installmentId={installment._id}
                                  amount={installment.amount}
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t text-sm">
                        <div className="flex justify-between font-medium">
                          <span>Total Amount:</span>
                          <span>Rs. {order.total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Paid So Far:</span>
                          <span>Rs. {(paidInstallments * order.monthlyPayment).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-primary font-semibold mt-1">
                          <span>Remaining:</span>
                          <span>Rs. {((totalInstallments - paidInstallments) * order.monthlyPayment).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderHistory;