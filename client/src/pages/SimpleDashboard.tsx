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
import { PaymentButton } from "@/components/PaymentButton";
import {
  Package,
  CreditCard,
  BellRing,
  CalendarRange,
  Wallet,
  ShoppingBag,
} from "lucide-react";
import { CheckCircle2 } from "lucide-react";

import { useEffect, useMemo } from "react";
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
          upcoming.push({ ...inst, order });
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
        history.push({ ...inst, order });
      });
    });

    return history
      .sort(
        (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime(),
      )
      .slice(0, 6);
  }, [orders]);

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
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders + Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Orders */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading...</p>
              ) : orders.length === 0 ? (
                <div className="text-center py-6">
                  <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
                  <Button onClick={() => navigate("/products")}>
                    Browse Products
                  </Button>
                </div>
              ) : (
                orders.slice(0, 4).map((order) => {
                  const orderId = order.id ? order.id.slice(-6) : "N/A";
                  return (
                    <div
                      key={order.id}
                      className="p-4 border rounded-lg flex justify-between"
                    >
                      <div>
                        <p className="font-semibold">Order # {orderId}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          Rs. {order.total.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })
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
                <p className="text-muted-foreground">You’re all caught up!</p>
              ) : (
                notifications.map((note, i) => (
                  <div key={i} className="border p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <BellRing className="h-4 w-4 text-primary" />
                      <span className="font-medium">{note.severity}</span>
                    </div>
                    <p>{note.message}</p>
                  </div>
                ))
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
                <Package className="h-5 w-5 text-primary" />
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

                    return (
                      <div
                        key={inst._id}
                        className="border rounded-lg p-4 bg-green-50/50 border-green-200"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-medium">{itemName}</p>
                            <p className="text-sm text-muted-foreground">
                              Order #{orderId}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              Rs. {inst.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {inst.paidAt
                                ? new Date(inst.paidAt).toLocaleDateString()
                                : "Paid"}
                            </p>
                          </div>
                        </div>
                        {inst.transactionId && (
                          <p className="text-xs text-muted-foreground mt-2">
                            TXN: {inst.transactionId}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {paymentHistory.length > 5 && (
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => navigate("/orders")}
                    >
                      View All Payment History
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        {/*<Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>

          <CardContent>
            {paymentHistory.length === 0 ? (
              <p className="text-muted-foreground">No payment history.</p>
            ) : (
              paymentHistory.map((inst) => {
                const itemName = inst.order?.items?.[0]?.name || "Order";
                const orderId = inst.order?.id
                  ? inst.order.id.slice(-6)
                  : "N/A";

                return (
                  <div
                    key={inst._id}
                    className="border p-4 rounded-lg flex justify-between"
                  >
                    <p>
                      {itemName} #{orderId}
                    </p>

                    <p>Rs. {inst.amount.toLocaleString()}</p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>*/}
      </div>
    </div>
  );
};

export default SimpleDashboard;

// import { useNavigate } from "react-router-dom";
// import Navbar from "@/components/Navbar";
// import { useAuth } from "@/contexts/AuthContext";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Package, CreditCard, BellRing, CalendarRange, Wallet, ShoppingBag } from "lucide-react";
// import { useEffect, useMemo } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { orderApi } from "@/lib/api";
// import type { Installment, Order } from "@/types";

// const formatDate = (value?: string) =>
//   value ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—";

// const daysUntil = (value: string) => {
//   const diff = new Date(value).getTime() - Date.now();
//   return Math.ceil(diff / (1000 * 60 * 60 * 24));
// };

// const SimpleDashboard = () => {
//   const { user, token, loading: authLoading } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!authLoading && (!user || !token)) {
//       navigate("/auth");
//     }
//   }, [user, token, authLoading, navigate]);

//   const { data, isLoading } = useQuery({
//     queryKey: ["orders", user?.id],
//     queryFn: () => orderApi.mine(token as string),
//     enabled: Boolean(user && token),
//   });

//   if (authLoading) {
//     return (
//       <div className="min-h-screen bg-background">
//         <Navbar />
//         <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
//           Loading dashboard...
//         </div>
//       </div>
//     );
//   }

//   if (!user || !token) {
//     return null;
//   }

//   const orders = data?.orders ?? [];
//   const activeOrders = orders.filter((order) => order.status !== "shipped").length;
//   const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

//   const pendingInstallments = useMemo(() => {
//     const upcoming: Array<Installment & { order: Order }> = [];
//     orders.forEach((order) => {
//       order.installments.forEach((installment) => {
//         if (installment.status !== "paid") {
//           upcoming.push({ ...installment, order });
//         }
//       });
//     });
//     return upcoming.sort(
//       (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
//     );
//   }, [orders]);

//   const nextPayment = pendingInstallments[0];
//   const pendingTotal = pendingInstallments.reduce((sum, inst) => sum + inst.amount, 0);

//   const notifications = pendingInstallments
//     .filter((inst) => daysUntil(inst.dueDate) <= 7)
//     .map((inst) => ({
//       message: `Installment for ${inst.order.items[0]?.name || "order"} is due on ${formatDate(
//         inst.dueDate
//       )}`,
//       severity: daysUntil(inst.dueDate) < 0 ? "overdue" : "upcoming",
//     }));

//   const paymentHistory = useMemo(() => {
//     const history: Array<Installment & { order: Order }> = [];
//     orders.forEach((order) => {
//       order.installments.forEach((installment) => {
//         history.push({ ...installment, order });
//       });
//     });
//     return history
//       .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
//       .slice(0, 6);
//   }, [orders]);

//   return (
//     <div className="min-h-screen bg-background">
//       <Navbar />

//       <div className="container mx-auto px-4 py-8">
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
//           <p className="text-muted-foreground">Welcome back, {user.fullName}</p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
//               <Package className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{activeOrders}</div>
//               <p className="text-xs text-muted-foreground">
//                 {activeOrders > 0 ? "Keep up the good work" : "No active orders"}
//               </p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Lifetime Spend</CardTitle>
//               <CreditCard className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">Rs. {totalSpent.toLocaleString()}</div>
//               <p className="text-xs text-muted-foreground">Across all orders</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Pending Installments</CardTitle>
//               <Wallet className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{pendingInstallments.length}</div>
//               <p className="text-xs text-muted-foreground">
//                 Rs. {pendingTotal.toLocaleString()} pending
//               </p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Next Due Date</CardTitle>
//               <CalendarRange className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">
//                 {nextPayment ? formatDate(nextPayment.dueDate) : "All clear"}
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 {nextPayment ? `${daysUntil(nextPayment.dueDate)} days remaining` : "No pending dues"}
//               </p>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//           <Card className="lg:col-span-2">
//             <CardHeader>
//               <CardTitle>Recent Orders</CardTitle>
//               <CardDescription>Track your latest installment plans</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {isLoading ? (
//                 <div className="space-y-2">
//                   {Array.from({ length: 3 }).map((_, idx) => (
//                     <div key={idx} className="h-16 rounded-lg bg-muted/40 animate-pulse" />
//                   ))}
//                 </div>
//               ) : orders.length === 0 ? (
//                 <div className="text-center py-8">
//                   <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
//                   <p className="text-muted-foreground mb-4">No orders yet</p>
//                   <Button onClick={() => navigate("/products")}>Browse Products</Button>
//                 </div>
//               ) : (
//                 orders.slice(0, 4).map((order) => (
//                   <div
//                     key={order.id}
//                     className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
//                   >
//                     <div>
//                       <p className="font-semibold">Order #{order.id.slice(-6)}</p>
//                       <p className="text-sm text-muted-foreground">
//                         {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} items
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <p className="font-bold text-primary">Rs. {order.total.toLocaleString()}</p>
//                       <p className="text-sm text-muted-foreground">
//                         {order.installmentMonths} months · Rs. {order.monthlyPayment.toLocaleString()}/mo
//                       </p>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Notifications</CardTitle>
//               <CardDescription>Upcoming and overdue payments</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               {notifications.length === 0 ? (
//                 <p className="text-sm text-muted-foreground">You’re all caught up!</p>
//               ) : (
//                 notifications.map((note, idx) => (
//                   <div
//                     key={idx}
//                     className="rounded-lg border p-3 text-sm"
//                   >
//                     <div className="flex items-center gap-2 mb-1">
//                       <BellRing className="h-4 w-4 text-primary" />
//                       <span className="font-medium capitalize">{note.severity}</span>
//                     </div>
//                     <p className="text-muted-foreground">{note.message}</p>
//                   </div>
//                 ))
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle>Payment History</CardTitle>
//             <CardDescription>Your recent installment activity</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-3">
//             {paymentHistory.length === 0 ? (
//               <p className="text-sm text-muted-foreground">No payment activity recorded yet.</p>
//             ) : (
//               paymentHistory.map((installment) => (
//                 <div
//                   key={installment._id}
//                   className="flex flex-col md:flex-row md:items-center justify-between rounded-lg border p-4"
//                 >
//                   <div>
//                     <p className="font-semibold">
//                       {installment.order.items[0]?.name || "Order"} · #{installment.order.id.slice(-6)}
//                     </p>
//                     <p className="text-sm text-muted-foreground">
//                       Due {formatDate(installment.dueDate)} • {installment.order.paymentMethod.toUpperCase()}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-bold">Rs. {installment.amount.toLocaleString()}</p>
//                     <p
//                       className={`text-sm ${
//                         installment.status === "paid"
//                           ? "text-green-600"
//                           : installment.status === "overdue"
//                             ? "text-destructive"
//                             : "text-muted-foreground"
//                       }`}
//                     >
//                       {installment.status.toUpperCase()}
//                       {installment.paidAt ? ` · ${new Date(installment.paidAt).toLocaleDateString()}` : ""}
//                     </p>
//                   </div>
//                 </div>
//               ))
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default SimpleDashboard;
