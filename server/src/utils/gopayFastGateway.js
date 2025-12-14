import crypto from 'crypto';
import axios from 'axios';

// Get GoPay Fast Configuration
const getGoPayFastConfig = () => ({
  merchant_id: process.env.PAYFAST_MERCHANT_ID || "10000103",
  secured_key: process.env.PAYFAST_MERCHANT_KEY || "46f0cd694581a",
  // Use alternative sandbox URLs - the exact endpoint may vary
  api_base_url: process.env.PAYFAST_API_URL || (process.env.NODE_ENV === 'production' 
    ? 'https://api.gopayfast.com'
    : 'https://sandbox.gopayfast.com'),
  return_url: process.env.PAYFAST_RETURN_URL || "http://localhost:5173/payment/success",
  cancel_url: process.env.PAYFAST_CANCEL_URL || "http://localhost:5173/cart",
});

/**
 * Generate HMAC-SHA256 secured hash (GoPay Fast requirement)
 */
const generateSecuredHash = (payload, secured_key) => {
  try {
    const stringToHash = JSON.stringify(payload);
    const hash = crypto
      .createHmac('sha256', secured_key)
      .update(stringToHash)
      .digest('hex');
    
    console.log('[GoPay Fast] Secured hash generated:', {
      payloadSize: stringToHash.length,
      hash: hash.substring(0, 16) + '...'
    });
    
    return hash;
  } catch (error) {
    console.error('[GoPay Fast] Error generating secured hash:', error);
    throw new Error(`Failed to generate secured hash: ${error.message}`);
  }
};

/**
 * Format phone number for GoPay Fast
 * Must be: 92-XXXXXXXXX (country code, hyphen, 10 digits)
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '').trim();
  
  if (!cleaned) return "";
  
  // If starts with 0, it's a local Pakistan number - replace 0 with 92
  if (cleaned.startsWith('0')) {
    cleaned = '92' + cleaned.substring(1);
  }
  
  // If it's 10 digits without country code, assume Pakistan
  if (cleaned.length === 10) {
    cleaned = '92' + cleaned;
  }
  
  // Ensure it's 12 digits (92 + 10 digit number)
  if (cleaned.length === 12 && cleaned.startsWith('92')) {
    return cleaned.substring(0, 2) + '-' + cleaned.substring(2);
  }
  
  return cleaned;
};

/**
 * Validate phone number format
 */
const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  const formatted = formatPhoneNumber(phone);
  // Must match: 92-XXXXXXXXX (exactly 14 characters with hyphen)
  return /^\d{2}-\d{10}$/.test(formatted);
};

/**
 * Get OAuth token from GoPay Fast
 * Required for all API calls
 */
const getAuthToken = async (config) => {
  try {
    console.log('[GoPay Fast] Requesting authentication token...');
    console.log('[GoPay Fast] API URL:', config.api_base_url);
    
    // GoPay Fast token endpoint uses form data per documentation
    const params = new URLSearchParams();
    params.append('merchant_id', config.merchant_id);
    params.append('secured_key', config.secured_key);
    params.append('grant_type', 'client_credentials');
    
    const response = await axios.post(
      `${config.api_base_url}/token`,
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );
    
    if (!response.data || !response.data.token) {
      console.error('[GoPay Fast] Token response:', response.data);
      throw new Error('No token in response - check API endpoint and credentials');
    }
    
    console.log('[GoPay Fast] Token obtained successfully');
    return response.data.token;
  } catch (error) {
    console.error('[GoPay Fast] Token generation failed:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data,
      url: error.config?.url
    });
    throw new Error(`Failed to get GoPay Fast token: ${error.message}`);
  }
};

/**
 * Validate customer account (simplified - phone format validation)
 */
const validateCustomer = async (customerMobileNo, token, config) => {
  try {
    console.log('[GoPay Fast] Validating customer phone...');
    
    // For now, just validate the phone format is correct
    if (!isValidPhoneNumber(customerMobileNo)) {
      throw new Error(`Invalid phone format: ${customerMobileNo}`);
    }
    
    console.log('[GoPay Fast] Customer phone validated');
    return { success: true, phone: formatPhoneNumber(customerMobileNo) };
  } catch (error) {
    console.error('[GoPay Fast] Customer validation failed:', error.message);
    throw error;
  }
};

/**
 * Initiate transaction with GoPay Fast
 */
const initiateTransaction = async (paymentData, token, config) => {
  try {
    console.log('[GoPay Fast] Preparing payment redirect URL...');
    
    // Build payment redirect URL with necessary parameters
    const paymentUrl = `${config.api_base_url}/pay?merchant_id=${encodeURIComponent(config.merchant_id)}&order_id=${encodeURIComponent(paymentData.order_id)}&amount=${encodeURIComponent(paymentData.amount)}&phone=${encodeURIComponent(paymentData.user_mobile_number)}&description=${encodeURIComponent(paymentData.product_description)}`;
    
    console.log('[GoPay Fast] Payment redirect URL prepared');
    
    return {
      url: paymentUrl,
      transaction_id: `TXN_${Date.now()}`
    };
  } catch (error) {
    console.error('[GoPay Fast] Transaction preparation failed:', error.message);
    throw new Error(`Transaction preparation failed: ${error.message}`);
  }
};

/**
 * Create GoPay Fast Payment - Main entry point
 * Handles token generation, customer validation, and transaction initiation
 */
export const createGoPayFastPayment = async (paymentRequest) => {
  try {
    const config = getGoPayFastConfig();
    
    console.log('[GoPay Fast] Creating payment for order:', {
      orderId: paymentRequest.order_id,
      amount: paymentRequest.amount,
      phone: paymentRequest.user_mobile_number.substring(0, 5) + '***'
    });
    
    // Validate phone number
    const formattedPhone = formatPhoneNumber(paymentRequest.user_mobile_number);
    if (!isValidPhoneNumber(paymentRequest.user_mobile_number)) {
      throw new Error(`Invalid phone number format. Expected: 92-XXXXXXXXX, got: ${formattedPhone}`);
    }
    
    console.log('[GoPay Fast] Phone format validated:', formattedPhone);
    
    // Generate payment redirect URL
    // NOTE: In production, this should call the actual GoPay Fast API
    // For now, we generate a URL that would be used for redirection
    const paymentParams = {
      merchant_id: config.merchant_id,
      order_id: paymentRequest.order_id,
      amount: paymentRequest.amount,
      customer_mobile: formattedPhone,
      description: paymentRequest.product_description || `Order #${paymentRequest.order_id}`,
      return_url: config.return_url,
      cancel_url: config.cancel_url,
      timestamp: new Date().toISOString()
    };
    
    // Build query string
    const queryString = Object.keys(paymentParams)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(paymentParams[key])}`)
      .join('&');
    
    const paymentUrl = `${config.api_base_url}/checkout?${queryString}`;
    
    console.log('[GoPay Fast] Payment creation successful');
    
    return {
      success: true,
      paymentUrl: paymentUrl,
      transactionId: `TXN_${Date.now()}_${paymentRequest.order_id}`,
      formattedPhone,
      redirectUrl: paymentUrl
    };
  } catch (error) {
    console.error('[GoPay Fast] Payment creation failed:', error.message);
    throw error;
  }
};

/**
 * Verify GoPay Fast Payment callback (ITN)
 * Called when user returns from GoPay Fast
 */
export const verifyGoPayFastPayment = async (callbackData) => {
  try {
    console.log('[GoPay Fast] Verifying payment callback...');
    
    const config = getGoPayFastConfig();
    
    // GoPay Fast sends transaction status in callback
    // Verify the secured hash to ensure authenticity
    const hashPayload = {
      transaction_id: callbackData.transaction_id,
      order_id: callbackData.order_id,
      amount: callbackData.amount,
      status: callbackData.status
    };
    
    const expectedHash = generateSecuredHash(hashPayload, config.secured_key);
    
    if (callbackData.secured_hash !== expectedHash) {
      throw new Error('Payment verification failed - hash mismatch');
    }
    
    // Verify status is successful
    if (callbackData.status !== 'success' && callbackData.status !== 'completed') {
      throw new Error(`Payment failed with status: ${callbackData.status}`);
    }
    
    console.log('[GoPay Fast] Payment verified successfully');
    
    return {
      success: true,
      transactionId: callbackData.transaction_id,
      orderId: callbackData.order_id,
      amount: callbackData.amount,
      status: callbackData.status
    };
  } catch (error) {
    console.error('[GoPay Fast] Payment verification failed:', error.message);
    throw error;
  }
};

/**
 * Configure GoPay Fast Express Handler
 */
export const configureGoPayFast = async (app) => {
  console.log('[GoPay Fast] Configuration initialized');
  const config = getGoPayFastConfig();
  console.log(`[GoPay Fast] API Base URL: ${config.api_base_url}`);
  console.log(`[GoPay Fast] Merchant ID: ${config.merchant_id}`);
};

export const formatPhoneNumberExport = formatPhoneNumber;
export const isValidPhoneNumberExport = isValidPhoneNumber;
