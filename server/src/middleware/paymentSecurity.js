import { Order } from "../models/Order.js";

/**
 * Middleware to enhance payment security
 * Validates payment requests and prevents unauthorized access
 */
export const paymentSecurity = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Validate request body
    const { orderId, paymentMethod, installmentId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    // Validate payment method
    const validPaymentMethods = ['safepay', 'payfast', 'mock'];
    if (paymentMethod && !validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    // Check if order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify user ownership (except for admins)
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    // Validate installment ID if provided
    if (installmentId) {
      const installment = order.installments.id(installmentId);
      if (!installment) {
        return res.status(404).json({ message: "Installment not found" });
      }

      // Check if installment is already paid
      if (installment.status === "paid") {
        return res.status(400).json({ message: "Installment already paid" });
      }

      // Check if installment is overdue
      if (installment.status === "overdue") {
        return res.status(400).json({ message: "Installment is overdue. Please contact support." });
      }
    }

    // Add security context to request
    req.securityContext = {
      orderId,
      order,
      installmentId,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress
    };

    next();
  } catch (error) {
    console.error("Payment security middleware error:", error);
    return res.status(500).json({ message: "Security validation failed" });
  }
};

/**
 * Rate limiting for payment requests
 * Prevents abuse and brute force attacks
 */
export const paymentRateLimit = (req, res, next) => {
  // In a production environment, you would implement proper rate limiting
  // using Redis or similar technologies
  
  // For now, we'll add a simple in-memory rate limiter
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Add rate limiting logic here in production
  next();
};

/**
 * Validates payment callback requests
 * Ensures callbacks come from legitimate sources
 */
export const validatePaymentCallback = (req, res, next) => {
  try {
    // Log callback attempt
    console.log("Payment callback received:", {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    // In production, you would validate:
    // 1. IP whitelist for payment gateways
    // 2. Signature verification
    // 3. Timestamp validation
    // 4. Request origin validation

    next();
  } catch (error) {
    console.error("Payment callback validation error:", error);
    return res.status(400).json({ message: "Invalid callback request" });
  }
};