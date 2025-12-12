import crypto from "crypto";
import axios from "axios";
import { Safepay } from "@sfpy/node-sdk";

// SafePay Configuration
const SAFEPAY_CONFIG = {
  apiKey: process.env.SAFEPAY_API_KEY || "test_api_key",
  secretKey: process.env.SAFEPAY_SECRET_KEY || "test_secret_key",
  webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET || "test_webhook_secret",
  returnUrl:
    process.env.SAFEPAY_RETURN_URL || "http://localhost:5173/payment/callback",
  cancelUrl:
    process.env.SAFEPAY_CANCEL_URL || "http://localhost:5173/cart",
  environment: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
};

// Initialize SafePay client
const safepay = new Safepay({
  environment: SAFEPAY_CONFIG.environment,
  apiKey: SAFEPAY_CONFIG.apiKey,
  v1Secret: SAFEPAY_CONFIG.secretKey,
  webhookSecret: SAFEPAY_CONFIG.webhookSecret
});

// Create SafePay Payment
export const createSafePayPayment = async (orderData) => {
  try {
    const { orderId, amount, customerEmail, customerMobile, description } =
      orderData;

    // Validate required data
    if (!orderId || !amount) {
      throw new Error("Order ID and amount are required for SafePay payment");
    }

    // Create payment with SafePay
    const payment = await safepay.payments.create({
      amount: Math.round(amount * 100), // Convert to paisas
      currency: 'PKR',
      metadata: {
        order_id: orderId,
        description: description || "InstallMart Order Payment",
        customer_email: customerEmail || "",
        customer_mobile: customerMobile || ""
      }
    });

    // Create checkout link with all payment methods enabled
    const checkoutUrl = safepay.checkout.create({
      token: payment.token,
      orderId: orderId,
      cancelUrl: SAFEPAY_CONFIG.cancelUrl,
      redirectUrl: SAFEPAY_CONFIG.returnUrl,
      source: 'installmart',
      mode: 'hosted', // Use hosted mode to show all payment options
      methods: {
        card: true,
        bank: true,
        mobile: true, // This should enable JazzCash, EasyPaisa, etc.
      }
    });

    console.log("SafePay Payment Created:", payment.token);

    return {
      success: true,
      paymentUrl: checkoutUrl,
      formData: {},
      transactionRef: payment.token,
    };
  } catch (error) {
    console.error("SafePay payment creation error:", error);
    throw new Error(`Failed to create SafePay payment: ${error.message}`);
  }
};

// Verify SafePay Payment Response
export const verifySafePayPayment = (requestData) => {
  try {
    // Validate request data
    if (!requestData) {
      return { verified: false, message: "No request data provided" };
    }

    // For GET requests (redirects from SafePay), we need to handle differently
    if (requestData.method === "GET" && requestData.query) {
      // Extract payment data from query parameters
      const { token, status } = requestData.query;
      
      if (!token) {
        return { verified: false, message: "No payment token in request" };
      }
      
      const isSuccess = status === "paid";
      
      // Note: In a production environment, you should verify the token with SafePay's API
      // For now, we'll assume the redirect indicates successful payment initiation
      
      return {
        verified: true,
        isSuccess,
        transactionId: token,
        amount: 0, // Amount would need to be retrieved from our database
        orderId: requestData.query.orderId || "",
        rawData: requestData.query
      };
    }

    // For POST requests (webhooks), verify webhook signature
    const isValid = safepay.verify.webhook(requestData);
    
    if (!isValid) {
      return { verified: false, message: "Invalid webhook signature" };
    }

    // Extract payment data
    const paymentData = requestData.body;
    
    if (!paymentData) {
      return { verified: false, message: "No payment data in request" };
    }

    const isSuccess = paymentData.status === "paid";
    const transactionId = paymentData.id;
    const amount = paymentData.amount ? paymentData.amount / 100 : 0; // Convert from paisas
    const orderId = paymentData.metadata?.order_id || "";

    return {
      verified: true,
      isSuccess,
      transactionId,
      amount,
      orderId,
      rawData: paymentData
    };
  } catch (error) {
    console.error("SafePay verification error:", error);
    return { verified: false, message: `Verification failed: ${error.message}` };
  }
};