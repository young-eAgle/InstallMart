import dotenv from 'dotenv';
import { createSafePayPayment } from '../src/utils/paymentGateways.js';

// Load environment variables
dotenv.config({ path: './.env' });

console.log("Testing payment gateways...");

// Test data
const testOrderData = {
  orderId: 'TEST_ORDER_123',
  amount: 1000, // Rs. 1000
  customerEmail: 'test@example.com',
  customerMobile: '+923001234567',
  description: 'Test payment for SafePay integration'
};

async function testPaymentGateways() {
  try {
    console.log('Testing SafePay payment creation...');
    console.log('Order Data:', testOrderData);
    
    const paymentResponse = await createSafePayPayment(testOrderData);
    console.log('✅ SafePay Payment Creation Success');
    console.log('Payment Response:', paymentResponse);
  } catch (error) {
    console.error('❌ Error creating SafePay payment:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

testPaymentGateways();