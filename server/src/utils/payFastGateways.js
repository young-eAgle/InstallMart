// PayFast Configuration
const PAYFAST_CONFIG = {
  merchant_id: process.env.PAYFAST_MERCHANT_ID || "",
  merchant_key: process.env.PAYFAST_MERCHANT_KEY || "",
  passphrase: process.env.PAYFAST_PASSPHRASE || "",
  return_url: process.env.PAYFAST_RETURN_URL || "http://localhost:8080/payment/success",
  cancel_url: process.env.PAYFAST_CANCEL_URL || "http://localhost:8080/cart",
  notify_url: process.env.PAYFAST_NOTIFY_URL || "http://localhost:3000/api/payment/payfast/callback",
  env: process.env.NODE_ENV === 'production' ? 'prod' : 'sandbox',
};

// Configure PayFast Express Handler (stub since we're not using the library)
export const configurePayFast = async (app) => {
  console.log('PayFast configuration initialized');
};





// Create PayFast Payment
export const createPayFastPayment = async (orderData) => {
  try {
    const { orderId, amount, customerEmail, customerName, description } = orderData;

    // Validate required data
    if (!orderId || !amount) {
      throw new Error("Order ID and amount are required for PayFast payment");
    }

    // Prepare payment data according to PayFast requirements
    const paymentData = {
      merchant_id: PAYFAST_CONFIG.merchant_id,
      merchant_key: PAYFAST_CONFIG.merchant_key,
      return_url: PAYFAST_CONFIG.return_url,
      cancel_url: PAYFAST_CONFIG.cancel_url,
      notify_url: PAYFAST_CONFIG.notify_url,
      m_payment_id: orderId,
      amount: amount.toFixed(2),
      item_name: description || "InstallMart Order Payment",
      item_description: description || "Installment payment for order",
      name_first: customerName || "Customer",
      email_address: customerEmail || "",
      // Add these additional fields that PayFast might require
      payment_method: 'cc', // Default to credit card, but can be changed by user on PayFast
    };

    console.log("PayFast Payment Data:", paymentData);

    // For PayFast, we need to return data that can be used by the frontend
    // to initiate the payment using PayFast's JavaScript integration
    return {
      success: true,
      paymentData: paymentData,
      merchant_id: PAYFAST_CONFIG.merchant_id,
      merchant_key: PAYFAST_CONFIG.merchant_key,
      env: PAYFAST_CONFIG.env,
    };
  } catch (error) {
    console.error("PayFast payment creation error:", error);
    throw new Error(`Failed to create PayFast payment: ${error.message}`);
  }
};

// Verify PayFast Payment Notification (ITN)
export const verifyPayFastPayment = (requestData) => {
  try {
    // Validate request data
    if (!requestData) {
      return { verified: false, message: "No request data provided" };
    }

    // Extract payment data
    const paymentData = requestData.body;
    
    if (!paymentData) {
      return { verified: false, message: "No payment data in request" };
    }

    // Check if payment was successful
    const isSuccess = paymentData.payment_status === "COMPLETE";
    const transactionId = paymentData.pf_payment_id;
    const amount = parseFloat(paymentData.amount_gross) || 0;
    const orderId = paymentData.m_payment_id || "";

    return {
      verified: true,
      isSuccess,
      transactionId,
      amount,
      orderId,
      rawData: paymentData
    };
  } catch (error) {
    console.error("PayFast verification error:", error);
    return { verified: false, message: `Verification failed: ${error.message}` };
  }
};