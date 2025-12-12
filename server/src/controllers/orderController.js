import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/mailer.js";

const PAYMENT_METHODS = ["safepay"];

const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const buildInstallmentSchedule = (total, months, startDate) => {
  const baseAmount = Math.floor(total / months);
  const remainder = total - baseAmount * months;

  return Array.from({ length: months }).map((_, index) => {
    const amount = index === months - 1 ? baseAmount + remainder : baseAmount;
    return {
      dueDate: addMonths(startDate, index + 1),
      amount,
      status: "pending",
    };
  });
};

const computeNextDueDate = (installments) => {
  const next = installments.find((installment) => installment.status === "pending");
  return next ? next.dueDate : null;
};

export const createOrder = asyncHandler(async (req, res) => {
  const {
    items,
    installmentMonths,
    shippingAddress,
    phone,
    paymentMethod,
    paymentReference,
    paymentProofUrl,
  } = req.body;

  if (!items?.length) {
    return res.status(400).json({ message: "Cart items are required" });
  }
  if (!shippingAddress || !phone) {
    return res.status(400).json({ message: "Address and phone are required" });
  }
  if (!paymentMethod || !PAYMENT_METHODS.includes(paymentMethod)) {
    return res.status(400).json({ message: "Valid payment method is required" });
  }

  const productIds = items.map((item) => item.id);
  const dbProducts = await Product.find({ _id: { $in: productIds } });

  const missing = productIds.filter((id) => !dbProducts.find((p) => p.id === id));
  if (missing.length) {
    return res.status(400).json({ message: `Products not available: ${missing.join(", ")}` });
  }

  const normalizedItems = items.map((item) => {
    const product = dbProducts.find((p) => p.id === item.id);
    return {
      product: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      category: product.category,
      image_url: product.image_url,
    };
  });

  const total = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const months = Number(installmentMonths) || 6;
  const monthlyPayment = Math.round(total / months);
  const installments = buildInstallmentSchedule(total, months, new Date());

  const order = await Order.create({
    user: req.user.id,
    items: normalizedItems,
    total,
    installmentMonths: months,
    monthlyPayment,
    shippingAddress,
    phone,
    paymentMethod,
    paymentReference,
    paymentProofUrl,
    installments,
    nextDueDate: computeNextDueDate(installments),
  });

  // Send order confirmation email
  try {
    const user = await User.findById(req.user.id);
    if (user && user.email) {
      await sendEmail(user.email, 'orderConfirmation', {
        user,
        order: order.toJSON()
      });
      console.log('Order confirmation email sent to:', user.email);
    }
  } catch (error) {
    console.error('Failed to send order confirmation email:', error.message);
    // Don't fail the order if email fails
  }

  res.status(201).json({ order });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .populate("items.product");

  // Transform orders to ensure id field is properly set
  const transformedOrders = orders.map(order => order.toJSON());
  
  res.json({ orders: transformedOrders });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate("user", "fullName email role");

  // Transform orders to ensure id field is properly set
  const transformedOrders = orders.map(order => order.toJSON());
  
  res.json({ orders: transformedOrders });
});

export const updateInstallmentStatus = asyncHandler(async (req, res) => {
  const { orderId, installmentId } = req.params;
  const { status, transactionId } = req.body;

  if (!["pending", "paid", "overdue"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const order = await Order.findById(orderId).populate('user');
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const installment = order.installments.id(installmentId);
  if (!installment) {
    return res.status(404).json({ message: "Installment not found" });
  }

  const previousStatus = installment.status;

  installment.status = status;
  if (status === "paid") {
    installment.paidAt = new Date();
    installment.transactionId = transactionId || installment.transactionId;
  }

  order.nextDueDate = computeNextDueDate(order.installments);
  await order.save();

  // Send payment confirmation email if status changed to paid
  if (previousStatus !== "paid" && status === "paid") {
    try {
      const user = order.user;
      if (user && user.email) {
        await sendEmail(user.email, 'paymentConfirmation', {
          user,
          installment: installment.toJSON(),
          order: order.toJSON()
        });
        console.log('Payment confirmation email sent to:', user.email);
      }
    } catch (error) {
      console.error('Failed to send payment confirmation email:', error.message);
      // Don't fail the update if email fails
    }
  }

  res.json({ order: order.toJSON() });
});

export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { paymentStatus } = req.body;

  if (!["pending", "verified", "rejected"].includes(paymentStatus)) {
    return res.status(400).json({ message: "Invalid payment status" });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.paymentStatus = paymentStatus;
  await order.save();

  res.json({ order: order.toJSON() });
});