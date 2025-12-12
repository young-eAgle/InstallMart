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

// Create order for guest users
export const createGuestOrder = asyncHandler(async (req, res) => {
  const {
    items,
    installmentMonths,
    shippingAddress,
    phone,
    paymentMethod,
    paymentReference,
    paymentProofUrl,
    customerInfo, // Guest customer information
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
  if (!customerInfo || !customerInfo.fullName || !customerInfo.email) {
    return res.status(400).json({ message: "Customer information is required for guest orders" });
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

  // Create a temporary guest user if one doesn't exist
  let guestUser = await User.findOne({ 
    email: customerInfo.email,
    role: "guest" 
  });

  if (!guestUser) {
    guestUser = await User.create({
      fullName: customerInfo.fullName,
      email: customerInfo.email,
      password: "guest_" + Date.now(), // Temporary password
      role: "guest",
      phone: phone,
      address: shippingAddress,
    });
  }

  const order = await Order.create({
    user: guestUser._id,
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
    await sendEmail(customerInfo.email, 'orderConfirmation', {
      user: {
        fullName: customerInfo.fullName,
        email: customerInfo.email
      },
      order: order.toJSON()
    });
    console.log('Order confirmation email sent to:', customerInfo.email);
  } catch (error) {
    console.error('Failed to send order confirmation email:', error.message);
    // Don't fail the order if email fails
  }

  res.status(201).json({ order });
});

// Get guest order by ID
export const getGuestOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  
  const order = await Order.findById(orderId)
    .populate("items.product");
    
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  
  // Check if the order belongs to a guest user
  const user = await User.findById(order.user);
  if (!user || user.role !== "guest") {
    return res.status(403).json({ message: "Access denied" });
  }
  
  // Transform order to ensure id field is properly set
  const transformedOrder = order.toJSON();
  
  res.json({ order: transformedOrder });
});