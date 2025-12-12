// Hardcoded SafePay Configuration (from server/.env)
const SAFEPAY_CONFIG = {
  apiKey: "sec_14ae4624-c146-40e3-94b8-ab70d285433c",
  secretKey: "3bded3fca19284c7e6a4068034b3c12dfc5538203d383e4dab30ad399ab4379d",
  webhookSecret: "39b01faf17c490238ef8a50ee7b1269d81d608f4c3e7aae13f24627a4504ece4",
  returnUrl: "http://localhost:8080/payment/callback",
  cancelUrl: "http://localhost:8080/cart",
  environment: "sandbox",
};

console.log("SafePay Configuration:");
console.log("- API Key:", SAFEPAY_CONFIG.apiKey ? "SET" : "NOT SET");
console.log("- Secret Key:", SAFEPAY_CONFIG.secretKey ? "SET" : "NOT SET");
console.log("- Webhook Secret:", SAFEPAY_CONFIG.webhookSecret ? "SET" : "NOT SET");
console.log("- Return URL:", SAFEPAY_CONFIG.returnUrl);
console.log("- Cancel URL:", SAFEPAY_CONFIG.cancelUrl);
console.log("- Environment:", SAFEPAY_CONFIG.environment);

const { Safepay } = require("@sfpy/node-sdk");

// Initialize SafePay client
const safepay = new Safepay({
  environment: SAFEPAY_CONFIG.environment,
  apiKey: SAFEPAY_CONFIG.apiKey,
  v1Secret: SAFEPAY_CONFIG.secretKey,
  webhookSecret: SAFEPAY_CONFIG.webhookSecret
});

console.log("\nTesting SafePay Integration...");

async function testSafePay() {
  try {
    // Test payment creation
    console.log("\nCreating test payment...");
    const payment = await safepay.payments.create({
      amount: 10000, // Rs. 100 in paisas
      currency: 'PKR',
      metadata: {
        order_id: "TEST_ORDER_001",
        description: "Test Payment for InstallMart",
        customer_email: "test@example.com",
        customer_mobile: "03001234567"
      }
    });

    console.log("Payment created successfully!");
    console.log("- Token:", payment.token);
    console.log("- Amount:", payment.amount);
    console.log("- Currency:", payment.currency);

    // Test checkout URL creation
    console.log("\nCreating checkout URL...");
    const checkoutUrl = safepay.checkout.create({
      token: payment.token,
      orderId: "TEST_ORDER_001",
      cancelUrl: SAFEPAY_CONFIG.cancelUrl,
      redirectUrl: SAFEPAY_CONFIG.returnUrl,
      source: 'installmart',
      mode: 'hosted',
      methods: {
        card: true,
        bank: true,
        mobile: true,
      }
    });

    console.log("Checkout URL created successfully!");
    console.log("URL:", checkoutUrl);

    console.log("\n✅ SafePay integration test completed successfully!");
    console.log("\nTo test the payment:");
    console.log("1. Visit the checkout URL above");
    console.log("2. Use test card details:");
    console.log("   - Card Number: 4242 4242 4242 4242");
    console.log("   - Expiry: Any future date");
    console.log("   - CVV: Any 3 digits");
    console.log("   - Name: Any name");

  } catch (error) {
    console.error("❌ SafePay integration test failed:", error.message);
    console.error("Error details:", error);
  }
}

testSafePay();