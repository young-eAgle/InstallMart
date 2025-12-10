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

// Mock payment configuration
const MOCK_PAYMENT_CONFIG = {
  successRate: 0.95, // 95% success rate for mock payments
  delayMs: 2000, // 2 second delay to simulate processing
};

// Helper function to log payment events
const logPaymentEvent = (eventType, data) => {
  console.log(`[PAYMENT] ${eventType}:`, {
    timestamp: new Date().toISOString(),
    ...data
  });
};

// Initialize payment (supporting both real and mock payments)
export const initializePayment = asyncHandler(async (req, res) => {
  const { orderId, paymentMethod, installmentId } = req.body;

  // Log payment initialization attempt
  logPaymentEvent("INITIALIZE_ATTEMPT", { 
    userId: req.user.id, 
    orderId, 
    paymentMethod, 
    installmentId 
  });

  // Validate inputs
  if (!orderId || !paymentMethod) {
    logPaymentEvent("VALIDATION_ERROR", { 
      userId: req.user.id, 
      error: "Order ID and payment method are required" 
    });
    return res.status(400).json({ message: "Order ID and payment method are required" });
  }

  if (!['jazzcash', 'easypaisa', 'mock'].includes(paymentMethod)) {
    logPaymentEvent("VALIDATION_ERROR", { 
      userId: req.user.id, 
      error: "Invalid payment method", 
      paymentMethod 
    });
    return res.status(400).json({ message: "Invalid payment method" });
  }

  const order = await Order.findById(orderId).populate("user");
  if (!order) {
    logPaymentEvent("ORDER_NOT_FOUND", { 
      userId: req.user.id, 
      orderId 
    });
    return res.status(404).json({ message: "Order not found" });
  }

  // Check if user owns this order
  if (order.user._id.toString() !== req.user.id) {
    logPaymentEvent("UNAUTHORIZED_ACCESS", { 
      userId: req.user.id, 
      orderId, 
      orderUserId: order.user._id.toString() 
    });
    return res.status(403).json({ message: "Unauthorized" });
  }

  let amount;
  let description;

  if (installmentId) {
    // Paying specific installment
    const installment = order.installments.id(installmentId);
    if (!installment) {
      logPaymentEvent("INSTALLMENT_NOT_FOUND", { 
        userId: req.user.id, 
        orderId, 
        installmentId 
      });
      return res.status(404).json({ message: "Installment not found" });
    }

    if (installment.status === "paid") {
      logPaymentEvent("INSTALLMENT_ALREADY_PAID", { 
        userId: req.user.id, 
        orderId, 
        installmentId 
      });
      return res.status(400).json({ message: "Installment already paid" });
    }

    if (installment.status === "overdue") {
      logPaymentEvent("INSTALLMENT_OVERDUE", { 
        userId: req.user.id, 
        orderId, 
        installmentId 
      });
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
      logPaymentEvent("NO_PENDING_INSTALLMENTS", { 
        userId: req.user.id, 
        orderId 
      });
      return res.status(400).json({ message: "No pending installments" });
    }

    amount = firstPending.amount;
    description = `First installment for order #${order.id.substring(0, 6)}`;
  }

  // Validate amount
  if (amount <= 0) {
    logPaymentEvent("INVALID_AMOUNT", { 
      userId: req.user.id, 
      orderId, 
      amount 
    });
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
    // Handle mock payment
    if (paymentMethod === "mock") {
      logPaymentEvent("MOCK_PAYMENT_START", { 
        userId: req.user.id, 
        orderId, 
        amount 
      });
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, MOCK_PAYMENT_CONFIG.delayMs));

      // Mock payment processing - 95% success rate
      const isSuccess = Math.random() < MOCK_PAYMENT_CONFIG.successRate;
      
      if (isSuccess) {
        logPaymentEvent("MOCK_PAYMENT_SUCCESS", { 
          userId: req.user.id, 
          orderId, 
          amount 
        });
        
        // Update installment status to paid
        if (installmentId) {
          const installment = order.installments.id(installmentId);
          installment.status = "paid";
          installment.paidAt = new Date();
          installment.transactionId = `MOCK_TXN_${Date.now()}`;
        } else {
          // Mark first pending installment as paid
          const firstPending = order.installments.find(
            (inst) => inst.status === "pending",
          );
          if (firstPending) {
            firstPending.status = "paid";
            firstPending.paidAt = new Date();
            firstPending.transactionId = `MOCK_TXN_${Date.now()}`;
          }
        }

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
              installment: order.installments.find(i => i.status === "paid" && i.paidAt && new Date(i.paidAt).getTime() === Math.max(...order.installments.filter(i => i.status === "paid" && i.paidAt).map(i => new Date(i.paidAt).getTime()))),
              order: order.toJSON(),
            });
          }
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
          logPaymentEvent("EMAIL_SEND_ERROR", { 
            userId: req.user.id, 
            orderId, 
            error: emailError.message 
          });
        }

        // Return success response
        res.json({
          success: true,
          paymentUrl: `${process.env.FRONTEND_URL}/payment/success`,
          formData: {},
          transactionRef: `MOCK_TXN_${Date.now()}`,
          orderId: order.id,
          installmentId,
          redirectUrl: `${process.env.FRONTEND_URL}/payment/success?orderId=${order.id}&txnId=MOCK_TXN_${Date.now()}&amount=${amount}`
        });
      } else {
        // Mock payment failure
        logPaymentEvent("MOCK_PAYMENT_FAILED", { 
          userId: req.user.id, 
          orderId, 
          amount 
        });
        
        res.status(500).json({ 
          success: false, 
          message: "Payment processing failed. Please try again.",
        });
      }
      return;
    }
    
    // Handle real payment gateways
    logPaymentEvent("REAL_PAYMENT_START", { 
      userId: req.user.id, 
      orderId, 
      paymentMethod, 
      amount 
    });
    
    if (paymentMethod === "jazzcash") {
      paymentResponse = await createJazzCashPayment(paymentData);
    } else if (paymentMethod === "easypaisa") {
      paymentResponse = await createEasyPaisaPayment(paymentData);
    }
    
    logPaymentEvent("REAL_PAYMENT_CREATED", { 
      userId: req.user.id, 
      orderId, 
      paymentMethod, 
      amount,
      transactionRef: paymentResponse?.transactionRef
    });
    
    res.json({
      success: true,
      ...paymentResponse,
      orderId: order.id,
      installmentId,
    });
  } catch (error) {
    console.error(`Payment initialization failed for order ${orderId}:`, error);
    logPaymentEvent("PAYMENT_INITIALIZATION_ERROR", { 
      userId: req.user.id, 
      orderId, 
      paymentMethod, 
      error: error.message 
    });
    
    res.status(500).json({ 
      success: false, 
      message: "Failed to initialize payment. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// JazzCash callback handler
export const jazzCashCallback = asyncHandler(async (req, res) => {
  logPaymentEvent("JAZZCASH_CALLBACK_RECEIVED", { 
    method: req.method,
    body: req.body 
  });

  const verificationResult = verifyJazzCashPayment(req.body);

  if (!verificationResult.verified) {
    logPaymentEvent("JAZZCASH_VERIFICATION_FAILED", { 
      error: verificationResult.message,
      body: req.body 
    });
    
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
        
        logPaymentEvent("JAZZCASH_PAYMENT_SUCCESS", { 
          orderId, 
          transactionId: verificationResult.transactionId,
          amount: verificationResult.amount 
        });

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
          logPaymentEvent("EMAIL_SEND_ERROR", { 
            orderId, 
            error: emailError.message 
          });
        }
      }
    }

    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/success?orderId=${orderId}&txnId=${verificationResult.transactionId}&amount=${verificationResult.amount}`,
    );
  } else {
    logPaymentEvent("JAZZCASH_PAYMENT_FAILED", { 
      orderId, 
      responseCode: verificationResult.responseCode,
      responseMessage: verificationResult.responseMessage 
    });
    
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
  logPaymentEvent("EASYPAISA_CALLBACK_RECEIVED", { 
    method: req.method,
    body: req.body 
  });

  const verificationResult = verifyEasyPaisaPayment(req.body);

  if (!verificationResult.verified) {
    logPaymentEvent("EASYPAISA_VERIFICATION_FAILED", { 
      error: verificationResult.message,
      body: req.body 
    });
    
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
        
        logPaymentEvent("EASYPAISA_PAYMENT_SUCCESS", { 
          orderId, 
          transactionId: verificationResult.transactionId,
          amount: verificationResult.amount 
        });

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
          logPaymentEvent("EMAIL_SEND_ERROR", { 
            orderId, 
            error: emailError.message 
          });
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
    logPaymentEvent("EASYPAISA_PAYMENT_FAILED", { 
      orderId, 
      responseCode: verificationResult.responseCode,
      responseMessage: verificationResult.responseMessage 
    });
    
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

// Mock payment callback handler
export const mockPaymentCallback = asyncHandler(async (req, res) => {
  logPaymentEvent("MOCK_CALLBACK_RECEIVED", { 
    body: req.body 
  });

  const { orderId, transactionId, amount, status } = req.body;

  if (status !== "success") {
    logPaymentEvent("MOCK_PAYMENT_FAILED", { 
      orderId, 
      transactionId, 
      status 
    });
    
    console.error("Mock payment failed");
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/failed?reason=payment_failed`,
    );
  }

  const order = await Order.findById(orderId);
  if (order) {
    // Find the installment that was paid
    const installment = order.installments.find(
      (inst) => inst.status === "pending",
    );
    if (installment) {
      installment.status = "paid";
      installment.paidAt = new Date();
      installment.transactionId = transactionId;

      // Update next due date
      const nextPending = order.installments.find(
        (inst) => inst.status === "pending",
      );
      order.nextDueDate = nextPending ? nextPending.dueDate : null;

      await order.save();
      
      logPaymentEvent("MOCK_PAYMENT_SUCCESS", { 
        orderId, 
        transactionId, 
        amount 
      });

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
        logPaymentEvent("EMAIL_SEND_ERROR", { 
          orderId, 
          error: emailError.message 
        });
      }
    }
  }

  return res.redirect(
    `${process.env.FRONTEND_URL}/payment/success?orderId=${orderId}&txnId=${transactionId}&amount=${amount}`,
  );
});

// Get payment status
export const getPaymentStatus = asyncHandler(async (req, res) => {
  const { orderId, installmentId } = req.params;

  logPaymentEvent("PAYMENT_STATUS_REQUEST", { 
    userId: req.user.id, 
    orderId, 
    installmentId 
  });

  const order = await Order.findById(orderId);
  if (!order) {
    logPaymentEvent("ORDER_NOT_FOUND_FOR_STATUS", { 
      userId: req.user.id, 
      orderId 
    });
    return res.status(404).json({ message: "Order not found" });
  }

  // Check if user owns this order
  if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
    logPaymentEvent("UNAUTHORIZED_STATUS_ACCESS", { 
      userId: req.user.id, 
      orderId, 
      orderUserId: order.user.toString() 
    });
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (installmentId) {
    const installment = order.installments.id(installmentId);
    if (!installment) {
      logPaymentEvent("INSTALLMENT_NOT_FOUND_FOR_STATUS", { 
        userId: req.user.id, 
        orderId, 
        installmentId 
      });
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