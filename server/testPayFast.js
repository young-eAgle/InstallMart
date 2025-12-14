import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createPayFastPayment, verifyPayFastPayment } from './src/utils/payFastGateways.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function testPayFastIntegration() {
  console.log('='.repeat(60));
  console.log('PayFast Payment Gateway Integration Test');
  console.log('='.repeat(60));

  // Check if credentials are loaded
  if (!process.env.PAYFAST_MERCHANT_ID || !process.env.PAYFAST_MERCHANT_KEY) {
    console.log('\n⚠️  Warning: PayFast credentials not fully configured');
    console.log('PAYFAST_MERCHANT_ID:', process.env.PAYFAST_MERCHANT_ID || 'NOT SET');
    console.log('PAYFAST_MERCHANT_KEY:', process.env.PAYFAST_MERCHANT_KEY || 'NOT SET');
    console.log('\nUsing test credentials for demonstration...');
    
    process.env.PAYFAST_MERCHANT_ID = '10000100';
    process.env.PAYFAST_MERCHANT_KEY = '46f0cd694581a';
    process.env.PAYFAST_PASSPHRASE = '';
  }

  try {
    // Test 1: Create Payment
    console.log('\n✅ Test 1: Creating Payment...');
    const testOrderData = {
      orderId: 'TEST_ORDER_' + Date.now(),
      amount: 100,
      customerEmail: 'test@example.com',
      customerMobile: '+27712345678',
      description: 'Test payment for InstallMart'
    };

    console.log('Input Data:', testOrderData);
    
    const paymentResult = await createPayFastPayment(testOrderData);
    
    console.log('\n✅ Payment Created Successfully!');
    console.log('Response:', {
      success: paymentResult.success,
      env: paymentResult.env,
      merchant_id: paymentResult.merchant_id,
      transactionRef: paymentResult.transactionRef,
      hasSignature: !!paymentResult.paymentData.signature
    });

    // Test 2: Verify Signature
    console.log('\n✅ Test 2: Verifying Signature...');
    const mockITN = {
      body: {
        ...paymentResult.paymentData,
        pf_payment_id: '1234567890',
        payment_status: 'COMPLETE',
        amount_gross: '100.00',
        amount_fee: '2.00',
        amount_net: '98.00',
        custom_str1: 'test_value',
        custom_int1: '123',
        test_mode: '1'
      }
    };

    console.log('\nMocking ITN Callback with:', {
      m_payment_id: mockITN.body.m_payment_id,
      pf_payment_id: mockITN.body.pf_payment_id,
      payment_status: mockITN.body.payment_status
    });

    const verificationResult = verifyPayFastPayment(mockITN);

    console.log('\n✅ Verification Result:', {
      verified: verificationResult.verified,
      isSuccess: verificationResult.isSuccess,
      transactionId: verificationResult.transactionId,
      amount: verificationResult.amount,
      orderId: verificationResult.orderId
    });

    // Test 3: Test with wrong signature
    console.log('\n✅ Test 3: Testing Signature Validation (should fail)...');
    const tamperedData = {
      body: {
        ...mockITN.body,
        signature: 'INVALID_SIGNATURE_12345678'
      }
    };

    const tamperedResult = verifyPayFastPayment(tamperedData);
    console.log('\n✅ Tampered Data Validation:', {
      verified: tamperedResult.verified,
      message: tamperedResult.message
    });

    console.log('\n' + '='.repeat(60));
    console.log('All Tests Completed!');
    console.log('='.repeat(60));

    if (paymentResult.success && verificationResult.verified && !tamperedResult.verified) {
      console.log('✅ PayFast Integration is working correctly!');
    } else {
      console.log('⚠️  Some tests failed. Check the output above.');
    }

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

// Run tests
testPayFastIntegration();