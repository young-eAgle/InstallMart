import { Order } from "../models/Order.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createSafePayPayment, verifySafePayPayment } from "../utils/paymentGateways.js";
import { createGoPayFastPayment, verifyGoPayFastPayment, configureGoPayFast } from "../utils/gopayFastGateway.js";
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

  if (!['safepay', 'payfast', 'mock'].includes(paymentMethod)) {
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
    // Use order phone if available, otherwise use user phone
    customerMobile: order.phone || order.user.phone || order.user.contactNumber,
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
    
    // Handle different payment gateways
    if (paymentMethod === "safepay") {
      paymentResponse = await createSafePayPayment(paymentData);
    } else if (paymentMethod === "payfast") {
      // GoPay Fast requires specific data structure
      paymentResponse = await createGoPayFastPayment({
        order_id: order.id,
        user_id: req.user.id,
        user_mobile_number: paymentData.customerMobile,
        amount: paymentData.amount,
        product_name: 'InstallMart Order',
        product_description: paymentData.description
      });
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

// SafePay callback handler
export const safePayCallback = asyncHandler(async (req, res) => {
  logPaymentEvent("SAFEPAY_CALLBACK_RECEIVED", { 
    method: req.method,
    query: req.query,
    body: req.body 
  });

  // Prepare request data for verification
  const requestData = {
    method: req.method,
    query: req.query,
    body: req.body
  };

  const verificationResult = verifySafePayPayment(requestData);

  if (!verificationResult.verified) {
    logPaymentEvent("SAFEPAY_VERIFICATION_FAILED", { 
      error: verificationResult.message,
      query: req.query,
      body: req.body 
    });
    
    console.error("SafePay verification failed:", verificationResult.message);
    
    // For GET requests, redirect to appropriate page
    if (req.method === "GET") {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=verification_failed`);
    }
    
    return res.status(400).json({
      success: false,
      message: "Payment verification failed",
    });
  }

  if (verificationResult.isSuccess) {
    const orderId = verificationResult.orderId;
    
    if (!orderId) {
      logPaymentEvent("SAFEPAY_MISSING_ORDER_ID", { 
        transactionId: verificationResult.transactionId
      });
      
      // For GET requests, redirect to appropriate page
      if (req.method === "GET") {
        return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=missing_order_id`);
      }
      
      return res.status(400).json({
        success: false,
        message: "Missing order ID in payment data",
      });
    }

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
        
        logPaymentEvent("SAFEPAY_PAYMENT_SUCCESS", { 
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

    // For GET requests, redirect to success page
    if (req.method === "GET") {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/success?orderId=${orderId}&txnId=${verificationResult.transactionId}`);
    }

    return res.json({
      success: true,
      message: "Payment processed successfully",
    });
  } else {
    logPaymentEvent("SAFEPAY_PAYMENT_FAILED", { 
      orderId: verificationResult.orderId,
      transactionId: verificationResult.transactionId,
      amount: verificationResult.amount 
    });
    
    console.error("SafePay payment failed");
    
    // For GET requests, redirect to failed page
    if (req.method === "GET") {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=payment_failed`);
    }
    
    return res.status(400).json({
      success: false,
      message: "Payment failed",
    });
  }
});

// GoPay Fast callback handler
export const payFastCallback = asyncHandler(async (req, res) => {
  logPaymentEvent("GOPAYFAST_CALLBACK_RECEIVED", { 
    method: req.method,
    transaction_id: req.body?.transaction_id || req.query?.transaction_id,
    order_id: req.body?.order_id || req.query?.order_id,
    status: req.body?.status || req.query?.status
  });

  try {
    // GoPay Fast sends callback data in query params or body
    const callbackData = req.method === 'POST' ? req.body : req.query;
    
    const verificationResult = await verifyGoPayFastPayment(callbackData);

    if (!verificationResult.success) {
      logPaymentEvent("GOPAYFAST_VERIFICATION_FAILED", { 
        error: verificationResult.message,
        transactionId: callbackData.transaction_id
      });
      
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const orderId = verificationResult.orderId;
    
    if (!orderId) {
      logPaymentEvent("GOPAYFAST_MISSING_ORDER_ID", { 
        transactionId: verificationResult.transactionId
      });
      
      return res.status(400).json({
        success: false,
        message: "Missing order ID in payment data",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      logPaymentEvent("GOPAYFAST_ORDER_NOT_FOUND", { 
        orderId,
        transactionId: verificationResult.transactionId
      });
      
      return res.status(400).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if this payment was already processed (idempotency)
    const existingInstallment = order.installments.find(
      inst => inst.transactionId === verificationResult.transactionId
    );

    if (existingInstallment && existingInstallment.status === "paid") {
      logPaymentEvent("GOPAYFAST_DUPLICATE_PAYMENT", { 
        orderId,
        transactionId: verificationResult.transactionId
      });
      
      return res.status(200).json({
        success: true,
        message: "Payment already processed",
      });
    }

    // Mark first pending installment as paid
    const installment = order.installments.find(
      (inst) => inst.status === "pending",
    );
    if (installment) {
      installment.status = "paid";
      installment.paidAt = new Date();
      installment.transactionId = verificationResult.transactionId;
      installment.paymentMethod = "payfast";

      // Update next due date
      const nextPending = order.installments.find(
        (inst) => inst.status === "pending",
      );
      order.nextDueDate = nextPending ? nextPending.dueDate : null;

      await order.save();
      
      logPaymentEvent("GOPAYFAST_PAYMENT_SUCCESS", { 
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

    // Return 200 OK to acknowledge receipt of callback
    return res.status(200).json({
      success: true,
      message: "Payment processed successfully",
    });
  } catch (error) {
    console.error("GoPay Fast callback error:", error);
    logPaymentEvent("GOPAYFAST_CALLBACK_ERROR", { 
      error: error.message
    });
    
    return res.status(400).json({
      success: false,
      message: "Callback processing error",
    });
  }
});

// Mock payment callback handler
export const mockPaymentCallback = asyncHandler(async (req, res) => {
  // Mock payments don't need callback handling as they're processed immediately
  res.json({ success: true, message: "Mock payment processed" });
});

// Get payment status
export const getPaymentStatus = asyncHandler(async (req, res) => {
  const { orderId, installmentId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  // Check if user owns this order (or is admin)
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied" });
  }

  let installment;
  if (installmentId) {
    installment = order.installments.id(installmentId);
    if (!installment) {
      return res.status(404).json({ message: "Installment not found" });
    }
  } else {
    // Get first pending installment
    installment = order.installments.find(inst => 
      ["pending", "paid", "overdue"].includes(inst.status)
    );
    if (!installment) {
      return res.status(404).json({ message: "No installments found" });
    }
  }

  res.json({
    status: installment.status,
    amount: installment.amount,
    paidAt: installment.paidAt,
    transactionId: installment.transactionId,
    totalInstallments: order.installments.length,
    paidInstallments: order.installments.filter(i => i.status === "paid").length,
    pendingInstallments: order.installments.filter(i => i.status === "pending").length,
    overdueInstallments: order.installments.filter(i => i.status === "overdue").length,
  });
});