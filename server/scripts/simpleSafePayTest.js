import { Safepay } from "@sfpy/node-sdk";

console.log("Testing SafePay SDK import...");

try {
  // Initialize SafePay client
  const safepay = new Safepay({
    environment: 'sandbox',
    apiKey: 'test_api_key',
    v1Secret: 'test_secret_key',
    webhookSecret: 'test_webhook_secret'
  });
  
  console.log("✅ SafePay SDK imported and initialized successfully!");
  console.log("SafePay object:", typeof safepay);
  console.log("Available methods:", Object.keys(safepay));
} catch (error) {
  console.error("❌ Error initializing SafePay SDK:", error.message);
  console.error("Stack trace:", error.stack);
}