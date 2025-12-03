import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select("-password");
  res.json({ users });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  
  // Validate role
  const validRoles = ["superadmin", "admin", "manager", "customer", "guest"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  
  // Prevent removing superadmin role from self
  if (req.user.id === userId && req.user.role === "superadmin" && role !== "superadmin") {
    return res.status(400).json({ message: "Cannot remove superadmin role from yourself" });
  }
  
  // Role assignment restrictions based on current user's role
  const currentUserRole = req.user.role;
  
  // Only superadmins can assign the superadmin role
  if (role === "superadmin" && currentUserRole !== "superadmin") {
    return res.status(403).json({ message: "Only superadmins can assign the superadmin role" });
  }
  
  // Admins can only assign guest, customer, or manager roles (not superadmin or admin)
  if (currentUserRole === "admin" && (role === "superadmin" || role === "admin")) {
    return res.status(403).json({ message: "Admins can only assign guest, customer, or manager roles" });
  }
  
  // Update user role
  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  ).select("-password");
  
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  
  res.json(user);
});

export const getAdminStats = asyncHandler(async (_req, res) => {
  // Basic counts
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalCustomers = await User.countDocuments({ role: "customer" });

  // Get all orders for calculations
  const orders = await Order.find().lean();

  // Total sales amount
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);

  // Pending installments amount
  const pendingInstallmentsData = await Order.aggregate([
    { $unwind: "$installments" },
    { $match: { "installments.status": "pending" } },
    { $group: { _id: null, total: { $sum: "$installments.amount" }, count: { $sum: 1 } } }
  ]);
  const pendingInstallments = pendingInstallmentsData[0]?.total || 0;
  const pendingInstallmentsCount = pendingInstallmentsData[0]?.count || 0;

  // Overdue installments amount
  const overdueInstallmentsData = await Order.aggregate([
    { $unwind: "$installments" },
    { $match: { "installments.status": "overdue" } },
    { $group: { _id: null, total: { $sum: "$installments.amount" }, count: { $sum: 1 } } }
  ]);
  const overdueInstallments = overdueInstallmentsData[0]?.total || 0;
  const overdueInstallmentsCount = overdueInstallmentsData[0]?.count || 0;

  // Collect payments data for next 30 days
  const currentDate = new Date();
  const nextMonth = new Date(currentDate);
  nextMonth.setDate(currentDate.getDate() + 30);

  const upcomingPaymentsData = await Order.aggregate([
    { $unwind: "$installments" },
    {
      $match: {
        "installments.status": "pending",
        "installments.dueDate": {
          $gte: currentDate,
          $lt: nextMonth
        }
      }
    },
    { $group: { _id: null, total: { $sum: "$installments.amount" }, count: { $sum: 1 } } }
  ]);
  const upcomingPayments = upcomingPaymentsData[0]?.total || 0;
  const upcomingPaymentsCount = upcomingPaymentsData[0]?.count || 0;

  // Monthly sales trend (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1); // Start from the 1st of the month

  const monthlySalesData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" }
        },
        total: { $sum: "$total" },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  // Format for chart display
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlySales = monthlySalesData.map(item => ({
    month: monthNames[item._id.month - 1],
    year: item._id.year,
    sales: item.total,
    orders: item.count
  }));

  // Top selling products
  const topProducts = await Order.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        name: { $first: "$items.name" },
        count: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 }
  ]);

  // Popular payment methods
  const paymentMethodStats = await Order.aggregate([
    {
      $group: {
        _id: "$paymentMethod",
        count: { $sum: 1 },
        total: { $sum: "$total" }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Installment plan distribution
  const installmentPlanStats = await Order.aggregate([
    {
      $group: {
        _id: "$installmentMonths",
        count: { $sum: 1 },
        totalValue: { $sum: "$total" }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  // Calculate monthly commitment (sum of all pending monthly payments)
  const monthlyCommitment = orders.reduce(
    (sum, order) => {
      const nextPending = order.installments.find((inst) => inst.status === "pending");
      return sum + (nextPending?.amount || 0);
    },
    0
  );

  res.json({
    stats: {
      totalSales,
      totalOrders,
      totalProducts,
      totalCustomers,
      pendingInstallments,
      pendingInstallmentsCount,
      overdueInstallments,
      overdueInstallmentsCount,
      upcomingPayments,
      upcomingPaymentsCount,
      monthlyCommitment,
      monthlySales,
      topProducts,
      paymentMethodStats,
      installmentPlanStats
    }
  });
});






// import { User } from "../models/User.js";
// import { Order } from "../models/Order.js";
// import { Product } from "../models/Product.js";
// import { asyncHandler } from "../utils/asyncHandler.js";

// export const getUsers = asyncHandler(async (_req, res) => {
//   const users = await User.find().select("-password");
//   res.json({ users });
// });

// export const getAdminStats = asyncHandler(async (_req, res) => {
//   const [orders, products, users] = await Promise.all([
//     Order.find().lean(),
//     Product.find().lean(),
//     User.find().lean(),
//   ]);

//   const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
//   const pendingInstallments = orders.reduce(
//     (sum, order) => sum + order.installments.filter((inst) => inst.status !== "paid").length,
//     0
//   );
//   const monthlyCommitment = orders.reduce(
//     (sum, order) => sum + (order.installments.find((inst) => inst.status === "pending")?.amount || 0),
//     0
//   );

//   const topMap = new Map();
//   orders.forEach((order) => {
//     order.items.forEach((item) => {
//       const current = topMap.get(item.name) || { name: item.name, count: 0, revenue: 0 };
//       current.count += item.quantity;
//       current.revenue += item.price * item.quantity;
//       topMap.set(item.name, current);
//     });
//   });
//   const topProducts = Array.from(topMap.values())
//     .sort((a, b) => b.count - a.count)
//     .slice(0, 5);

//   res.json({
//     stats: {
//       totalSales,
//       totalOrders: orders.length,
//       totalProducts: products.length,
//       totalCustomers: users.filter((user) => user.role === "customer").length,
//       pendingInstallments,
//       monthlyCommitment,
//       topProducts,
//     },
//   });
// });
