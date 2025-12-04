import { Order } from "../models/Order.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createJazzCashPayment,
  createEasyPaisaPayment,
  verifyJazzCashPayment,
  verifyEasyPaisaPayment,
} from "../utils/paymentGateways.js";
import { sendEmail } from "../utils/mailer.js";

// Initialize payment
export const initializePayment = asyncHandler(async (req, res) => {
  const { orderId, paymentMethod, installmentId } = req.body;

  // Validate inputs
  if (!orderId || !paymentMethod) {
    return res.status(400).json({ message: "Order ID and payment method are required" });
  }

  if (!['jazzcash', 'easypaisa'].includes(paymentMethod)) {
    return res.status(400).json({ message: "Invalid payment method" });
  }

  const order = await Order.findById(orderId).populate("user");
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  // Check if user owns this order
  if (order.user._id.toString() !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  let amount;
  let description;

  if (installmentId) {
    // Paying specific installment
    const installment = order.installments.id(installmentId);
    if (!installment) {
      return res.status(404).json({ message: "Installment not found" });
    }

    if (installment.status === "paid") {
      return res.status(400).json({ message: "Installment already paid" });
    }

    if (installment.status === "overdue") {
      return res.status(400).json({ message: "Installment is overdue. Please contact support." });
    }

    amount = installment.amount;
    description = `Installment payment for order #${order.id.substring(0, 6)}`;
  } else {
    // Paying first pending installment
    const firstPending = order.installments.find(
      (inst) => inst.status === "pending",
    );
    if (!firstPending) {
      return res.status(400).json({ message: "No pending installments" });
    }

    amount = firstPending.amount;
    description = `First installment for order #${order.id.substring(0, 6)}`;
  }

  // Validate amount
  if (amount <= 0) {
    return res.status(400).json({ message: "Invalid payment amount" });
  }

  const paymentData = {
    orderId: order.id,
    amount,
    customerEmail: order.user.email,
    customerMobile: order.phone,
    description,
  };

  let paymentResponse;

  try {
    if (paymentMethod === "jazzcash") {
      paymentResponse = await createJazzCashPayment(paymentData);
    } else if (paymentMethod === "easypaisa") {
      paymentResponse = await createEasyPaisaPayment(paymentData);
    }
    
    console.log(`Payment initialized for order ${orderId} using ${paymentMethod}`);
    
    res.json({
      success: true,
      ...paymentResponse,
      orderId: order.id,
      installmentId,
    });
  } catch (error) {
    console.error(`Payment initialization failed for order ${orderId}:`, error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to initialize payment. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// JazzCash callback handler
export const jazzCashCallback = asyncHandler(async (req, res) => {
  console.log("JazzCash Callback Received:", req.body);

  const verificationResult = verifyJazzCashPayment(req.body);

  if (!verificationResult.verified) {
    console.error("JazzCash verification failed:", verificationResult.message);
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/failed?reason=verification_failed`,
    );
  }

  if (verificationResult.isSuccess) {
    // Extract order ID from bill reference
    const billRef = verificationResult.billReference;
    const orderId = billRef.replace("ORD", "");

    const order = await Order.findById(orderId);
    if (order) {
      // Mark first pending installment as paid
      const installment = order.installments.find(
        (inst) => inst.status === "pending",
      );
      if (installment) {
        installment.status = "paid";
        installment.paidAt = new Date();
        installment.transactionId = verificationResult.transactionId;

        // Update next due date
        const nextPending = order.installments.find(
          (inst) => inst.status === "pending",
        );
        order.nextDueDate = nextPending ? nextPending.dueDate : null;

        await order.save();

        // Send confirmation email
        try {
          const user = await User.findById(order.user);
          if (user) {
            await sendEmail(user.email, "paymentConfirmation", {
              user,
              installment: installment.toJSON(),
              order: order.toJSON(),
            });
          }
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
        }
      }
    }

    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/success?orderId=${orderId}&txnId=${verificationResult.transactionId}&amount=${verificationResult.amount}`,
    );
  } else {
    console.error(
      "JazzCash payment failed:",
      verificationResult.responseMessage,
    );
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/failed?reason=${encodeURIComponent(verificationResult.responseMessage)}`,
    );
  }
});

// EasyPaisa callback handler
export const easyPaisaCallback = asyncHandler(async (req, res) => {
  console.log("EasyPaisa Callback Received:", req.body);

  const verificationResult = verifyEasyPaisaPayment(req.body);

  if (!verificationResult.verified) {
    console.error("EasyPaisa verification failed:", verificationResult.message);
    return res.status(400).json({
      success: false,
      message: "Payment verification failed",
    });
  }

  if (verificationResult.isSuccess) {
    // Extract order ID from reference
    const orderRef = req.body.orderRefNum;
    const orderId = orderRef.replace(/ORD(\d+)\d{13}/, "$1");

    const order = await Order.findById(orderId);
    if (order) {
      // Mark first pending installment as paid
      const installment = order.installments.find(
        (inst) => inst.status === "pending",
      );
      if (installment) {
        installment.status = "paid";
        installment.paidAt = new Date();
        installment.transactionId = verificationResult.transactionId;

        // Update next due date
        const nextPending = order.installments.find(
          (inst) => inst.status === "pending",
        );
        order.nextDueDate = nextPending ? nextPending.dueDate : null;

        await order.save();

        // Send confirmation email
        try {
          const user = await User.findById(order.user);
          if (user) {
            await sendEmail(user.email, "paymentConfirmation", {
              user,
              installment: installment.toJSON(),
              order: order.toJSON(),
            });
          }
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
        }
      }
    }

    return res.json({
      success: true,
      orderId,
      transactionId: verificationResult.transactionId,
      amount: verificationResult.amount,
    });
  } else {
    console.error(
      "EasyPaisa payment failed:",
      verificationResult.responseMessage,
    );
    return res.json({
      success: false,
      message: verificationResult.responseMessage,
    });
  }
});

// Get payment status
export const getPaymentStatus = asyncHandler(async (req, res) => {
  const { orderId, installmentId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  // Check if user owns this order
  if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (installmentId) {
    const installment = order.installments.id(installmentId);
    if (!installment) {
      return res.status(404).json({ message: "Installment not found" });
    }

    return res.json({
      status: installment.status,
      amount: installment.amount,
      paidAt: installment.paidAt,
      transactionId: installment.transactionId,
    });
  }

  res.json({
    totalInstallments: order.installments.length,
    paidInstallments: order.installments.filter((i) => i.status === "paid")
      .length,
    pendingInstallments: order.installments.filter(
      (i) => i.status === "pending",
    ).length,
    overdueInstallments: order.installments.filter(
      (i) => i.status === "overdue",
    ).length,
    nextDueDate: order.nextDueDate,
  });
});
