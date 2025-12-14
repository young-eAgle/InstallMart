/**
 * PayFast Integration Test Script
 * 
 * This script helps test the PayFast payment gateway integration by:
 * 1. Creating a test payment
 * 2. Verifying the payment URL generation
 * 3. Testing the callback verification
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Import our PayFast utility functions
import { createPayFastPayment, verifyPayFastPayment } from '../src/utils/payFastGateways.js';

// Test data
const testOrderData = {
  orderId: 'TEST_ORDER_123',
  amount: 1000, // Rs. 1000
  customerEmail: 'test@example.com',
  customerName: 'Test Customer',
  description: 'Test payment for PayFast integration'
};

async function testPayFastIntegration() {
  console.log('🧪 Starting PayFast Integration Tests...\n');

  try {
    // Test 1: Create PayFast Payment
    console.log('1️⃣ Testing PayFast Payment Creation...');
    console.log('Order Data:', testOrderData);
    
    const paymentResponse = await createPayFastPayment(testOrderData);
    console.log('✅ PayFast Payment Creation Success');
    console.log('Payment Response:', {
      success: paymentResponse.success,
      merchant_id: paymentResponse.merchant_id,
      env: paymentResponse.env
    });

    // Verify the response structure
    if (!paymentResponse.success) {
      throw new Error('Payment creation failed');
    }

    if (!paymentResponse.paymentData) {
      throw new Error('Missing payment data in response');
    }

    if (!paymentResponse.merchant_id) {
      throw new Error('Missing merchant ID in response');
    }

    console.log('✅ All payment creation validations passed\n');

    // Test 2: Verify Payment (simulate callback)
    console.log('2️⃣ Testing PayFast Payment Verification...');
    
    // Simulate a callback request using the payment data we just created
    // PayFast will send back many of the same fields and the signature
    const mockCallbackData = {
      body: {
        ...paymentResponse.paymentData,
        payment_status: 'COMPLETE',
        pf_payment_id: 'PF123456',
        amount_gross: paymentResponse.paymentData.amount,
        signature: paymentResponse.paymentData.signature,
      }
    };

    const verificationResult = verifyPayFastPayment(mockCallbackData);
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

    console.log('🎉 All PayFast Integration Tests Passed Successfully!');
    console.log('\n📋 Summary:');
    console.log('   • PayFast Payment Creation: ✅ Success');
    console.log('   • PayFast Payment Verification: ✅ Success');
    console.log('   • Response Validations: ✅ Passed');
    console.log('   • Verification Validations: ✅ Passed');

    console.log('\n📝 Next Steps:');
    console.log('   1. Obtain real PayFast sandbox credentials');
    console.log('   2. Update environment variables with real credentials');
    console.log('   3. Test with real payment flows in sandbox environment');
    console.log('   4. Verify callback handling with real webhooks');

  } catch (error) {
    console.error('❌ PayFast Integration Test Failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

// Run the test if this script is executed directly
testPayFastIntegration();

export { testPayFastIntegration };