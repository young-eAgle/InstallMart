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
import {
  TrendingUp,
  Users,
  ShoppingCart,
  CheckCircle2,
  ShieldAlert,
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

export const AdminOverview = () => {
  const { token } = useAuth();

  const enabled = Boolean(token);

  const { data: statsData } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminApi.stats(token as string),
    enabled,
  });

  const stats = statsData?.stats;

  // Calculate pending installments
  const pendingInstallments = stats?.pendingInstallmentsCount || 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <Card className="shadow-lg">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <Card className="shadow-lg">
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
        <Card className="shadow-lg">
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
    </div>
  );
};