import crypto from "crypto";
import axios from "axios";

// JazzCash Configuration
const JAZZCASH_CONFIG = {
  merchantId: process.env.JAZZCASH_MERCHANT_ID || "MC12345",
  password: process.env.JAZZCASH_PASSWORD || "test123",
  integritySalt: process.env.JAZZCASH_INTEGRITY_SALT || "test_salt",
  returnUrl:
    process.env.JAZZCASH_RETURN_URL || "http://localhost:5173/payment/callback",
  apiUrl:
    process.env.JAZZCASH_API_URL ||
    "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/",
};

// EasyPaisa Configuration
const EASYPAISA_CONFIG = {
  storeId: process.env.EASYPAISA_STORE_ID || "12345",
  hashKey: process.env.EASYPAISA_HASH_KEY || "test_hash_key",
  postBackURL:
    process.env.EASYPAISA_POSTBACK_URL ||
    "http://localhost:3000/api/payment/easypaisa/callback",
  apiUrl:
    process.env.EASYPAISA_API_URL ||
    "https://easypay-sandbox.easypaisa.com.pk/easypay/Index.jsf",
};

// Generate JazzCash Secure Hash
const generateJazzCashHash = (data) => {
  const sortedString = Object.keys(data)
    .sort()
    .map((key) => data[key])
    .join("&");

  const hashString = JAZZCASH_CONFIG.integritySalt + "&" + sortedString;
  return crypto
    .createHmac("sha256", JAZZCASH_CONFIG.integritySalt)
    .update(hashString)
    .digest("hex")
    .toUpperCase();
};

// Generate EasyPaisa Hash
const generateEasyPaisaHash = (data) => {
  const hashString = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join("&");

  return crypto
    .createHmac("sha256", EASYPAISA_CONFIG.hashKey)
    .update(hashString)
    .digest("hex")
    .toUpperCase();
};

// Create JazzCash Payment
export const createJazzCashPayment = async (orderData) => {
  try {
    const { orderId, amount, customerEmail, customerMobile, description } =
      orderData;

    const now = new Date();
    const transactionDateTime = now
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0];
    const expiryDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0];

    const paymentData = {
      pp_Version: "1.1",
      pp_TxnType: "MWALLET",
      pp_Language: "EN",
      pp_MerchantID: JAZZCASH_CONFIG.merchantId,
      pp_SubMerchantID: "",
      pp_Password: JAZZCASH_CONFIG.password,
      pp_TxnRefNo: `T${orderId}${Date.now()}`,
      pp_Amount: Math.round(amount * 100).toString(), // Convert to paisas
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: transactionDateTime,
      pp_BillReference: `ORD${orderId}`,
      pp_Description: description || "InstallMart Order Payment",
      pp_TxnExpiryDateTime: expiryDateTime,
      pp_ReturnURL: JAZZCASH_CONFIG.returnUrl,
      pp_SecureHash: "",
      ppmpf_1: customerEmail || "",
      ppmpf_2: customerMobile || "",
      ppmpf_3: "",
      ppmpf_4: "",
      ppmpf_5: "",
    };

    // Generate secure hash
    const hashData = { ...paymentData };
    delete hashData.pp_SecureHash;
    paymentData.pp_SecureHash = generateJazzCashHash(hashData);

    console.log("JazzCash Payment Created:", paymentData.pp_TxnRefNo);

    return {
      success: true,
      paymentUrl: JAZZCASH_CONFIG.apiUrl,
      formData: paymentData,
      transactionRef: paymentData.pp_TxnRefNo,
    };
  } catch (error) {
    console.error("JazzCash payment creation error:", error);
    throw new Error("Failed to create JazzCash payment");
  }
};

// Create EasyPaisa Payment
export const createEasyPaisaPayment = async (orderData) => {
  try {
    const { orderId, amount, customerEmail, customerMobile, description } =
      orderData;

    const paymentData = {
      storeId: EASYPAISA_CONFIG.storeId,
      amount: amount.toFixed(2),
      postBackURL: EASYPAISA_CONFIG.postBackURL,
      orderRefNum: `ORD${orderId}${Date.now()}`,
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      merchantHashedReq: "",
      autoRedirect: "0",
      paymentMethod: "MA_PAYMENT_METHOD",
      emailAddress: customerEmail || "",
      mobileNum: customerMobile || "",
    };

    // Generate hash
    const hashData = { ...paymentData };
    delete hashData.merchantHashedReq;
    paymentData.merchantHashedReq = generateEasyPaisaHash(hashData);

    console.log("EasyPaisa Payment Created:", paymentData.orderRefNum);

    return {
      success: true,
      paymentUrl: EASYPAISA_CONFIG.apiUrl,
      formData: paymentData,
      transactionRef: paymentData.orderRefNum,
    };
  } catch (error) {
    console.error("EasyPaisa payment creation error:", error);
    throw new Error("Failed to create EasyPaisa payment");
  }
};

// Verify JazzCash Payment Response
export const verifyJazzCashPayment = (responseData) => {
  try {
    const receivedHash = responseData.pp_SecureHash;
    const dataForHash = { ...responseData };
    delete dataForHash.pp_SecureHash;

    const calculatedHash = generateJazzCashHash(dataForHash);

    if (receivedHash !== calculatedHash) {
      return { verified: false, message: "Invalid hash" };
    }

    const isSuccess = responseData.pp_ResponseCode === "000";

    return {
      verified: true,
      isSuccess,
      transactionId: responseData.pp_TxnRefNo,
      responseCode: responseData.pp_ResponseCode,
      responseMessage: responseData.pp_ResponseMessage,
      amount: parseFloat(responseData.pp_Amount) / 100,
      billReference: responseData.pp_BillReference,
    };
  } catch (error) {
    console.error("JazzCash verification error:", error);
    return { verified: false, message: "Verification failed" };
  }
};

// Verify EasyPaisa Payment Response
export const verifyEasyPaisaPayment = (responseData) => {
  try {
    const receivedHash = responseData.merchantHashedReq;
    const dataForHash = { ...responseData };
    delete dataForHash.merchantHashedReq;

    const calculatedHash = generateEasyPaisaHash(dataForHash);

    if (receivedHash !== calculatedHash) {
      return { verified: false, message: "Invalid hash" };
    }

    const isSuccess = responseData.responseCode === "0000";

    return {
      verified: true,
      isSuccess,
      transactionId: responseData.orderRefNum,
      responseCode: responseData.responseCode,
      responseMessage: responseData.responseDesc,
      amount: parseFloat(responseData.amount),
    };
  } catch (error) {
    console.error("EasyPaisa verification error:", error);
    return { verified: false, message: "Verification failed" };
  }
};
