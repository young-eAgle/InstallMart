/**
 * SafePay Integration Test Script
 * 
 * This script helps test the SafePay payment gateway integration by:
 * 1. Creating a test payment
 * 2. Verifying the payment URL generation
 * 3. Testing the callback verification
 */

import dotenv from 'dotenv';
import { createSafePayPayment, verifySafePayPayment } from '../src/utils/paymentGateways.js';

// Load environment variables
dotenv.config({ path: './.env' });

// Test data
const testOrderData = {
  orderId: 'TEST_ORDER_123',
  amount: 1000, // Rs. 1000
  customerEmail: 'test@example.com',
  customerMobile: '+923001234567',
  description: 'Test payment for SafePay integration'
};

async function testSafePayIntegration() {
  console.log('🧪 Starting SafePay Integration Tests...\n');

  try {
    // Test 1: Create SafePay Payment
    console.log('1️⃣ Testing SafePay Payment Creation...');
    console.log('Order Data:', testOrderData);
    
    const paymentResponse = await createSafePayPayment(testOrderData);
    console.log('✅ SafePay Payment Creation Success');
    console.log('Payment Response:', {
      success: paymentResponse.success,
      paymentUrl: paymentResponse.paymentUrl ? '[URL_HIDDEN_FOR_SECURITY]' : null,
      transactionRef: paymentResponse.transactionRef
    });
    
    // Verify the response structure
    if (!paymentResponse.success) {
      throw new Error('Payment creation failed');
    }
    
    if (!paymentResponse.paymentUrl) {
      throw new Error('Payment URL not generated');
    }
    
    if (!paymentResponse.transactionRef) {
      throw new Error('Transaction reference not generated');
    }
    
    console.log('✅ All response validations passed\n');
    
    // Test 2: Verify SafePay Payment (mock data)
    console.log('2️⃣ Testing SafePay Payment Verification...');
    
    // Mock request data for verification
    const mockRequestData = {
      body: {
        status: 'paid',
        id: 'sp_test_transaction_123',
        amount: 100000, // Paisas (1000 PKR)
        metadata: {
          order_id: testOrderData.orderId
        }
      }
    };
    
    const verificationResult = verifySafePayPayment(mockRequestData);
    console.log('✅ SafePay Payment Verification Completed');
    console.log('Verification Result:', {
      verified: verificationResult.verified,
      isSuccess: verificationResult.isSuccess,
      transactionId: verificationResult.transactionId,
      amount: verificationResult.amount,
      orderId: verificationResult.orderId
    });
    
    // Verify the verification result
    if (!verificationResult.verified) {
      throw new Error('Payment verification failed: ' + verificationResult.message);
    }
    
    if (!verificationResult.isSuccess) {
      throw new Error('Payment was not successful');
    }
    
    if (verificationResult.amount !== testOrderData.amount) {
      throw new Error('Amount mismatch in verification');
    }
    
    if (verificationResult.orderId !== testOrderData.orderId) {
      throw new Error('Order ID mismatch in verification');
    }
    
    console.log('✅ All verification validations passed\n');
    
    console.log('🎉 All SafePay Integration Tests Passed Successfully!');
    console.log('\n📋 Summary:');
    console.log('   • SafePay Payment Creation: ✅ Success');
    console.log('   • SafePay Payment Verification: ✅ Success');
    console.log('   • Response Validations: ✅ Passed');
    console.log('   • Verification Validations: ✅ Passed');
    
    console.log('\n📝 Next Steps:');
    console.log('   1. Obtain real SafePay sandbox credentials');
    console.log('   2. Update environment variables with real credentials');
    console.log('   3. Test with real payment flows in sandbox environment');
    console.log('   4. Verify callback handling with real webhooks');
    
    return {
      payment: paymentResponse,
      verification: verificationResult
    };
    
  } catch (error) {
    console.error('\n💥 SafePay Integration Tests Failed!');
    console.error('Error:', error.message);
    
    if (error.stack) {
      console.error('Stack Trace:', error.stack);
    }
    
    process.exit(1);
  }
}

// Run tests if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSafePayIntegration();
}

export { testSafePayIntegration };