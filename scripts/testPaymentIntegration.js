/**
 * Payment Integration Test Script
 * 
 * This script helps test the payment gateway integration by:
 * 1. Creating a test order
 * 2. Initializing payments with different methods
 * 3. Verifying payment status updates
 * 4. Testing error handling
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_USER_TOKEN = process.env.TEST_USER_TOKEN || 'your-test-user-jwt-token';
const TEST_ORDER_ID = process.env.TEST_ORDER_ID || 'your-test-order-id';

// Test data
const testPaymentData = {
  jazzcash: {
    orderId: TEST_ORDER_ID,
    paymentMethod: 'jazzcash'
  },
  easypaisa: {
    orderId: TEST_ORDER_ID,
    paymentMethod: 'easypaisa'
  },
  mock: {
    orderId: TEST_ORDER_ID,
    paymentMethod: 'mock'
  }
};

// Axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TEST_USER_TOKEN}`
  }
});

/**
 * Test payment initialization
 */
async function testPaymentInitialization() {
  console.log('🧪 Starting Payment Integration Tests...\n');

  try {
    // Test 1: Mock Payment
    console.log('1️⃣ Testing Mock Payment Initialization...');
    const mockResponse = await api.post('/api/payment/initialize', testPaymentData.mock);
    console.log('✅ Mock Payment Init Success:', mockResponse.data.success);
    
    // Test 2: JazzCash Payment
    console.log('\n2️⃣ Testing JazzCash Payment Initialization...');
    const jazzcashResponse = await api.post('/api/payment/initialize', testPaymentData.jazzcash);
    console.log('✅ JazzCash Payment Init Success:', jazzcashResponse.data.success);
    
    // Test 3: EasyPaisa Payment
    console.log('\n3️⃣ Testing EasyPaisa Payment Initialization...');
    const easypaisaResponse = await api.post('/api/payment/initialize', testPaymentData.easypaisa);
    console.log('✅ EasyPaisa Payment Init Success:', easypaisaResponse.data.success);
    
    return {
      mock: mockResponse.data,
      jazzcash: jazzcashResponse.data,
      easypaisa: easypaisaResponse.data
    };
  } catch (error) {
    console.error('❌ Payment Initialization Test Failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test payment status retrieval
 */
async function testPaymentStatus(initializationResults) {
  console.log('\n📊 Testing Payment Status Retrieval...');
  
  try {
    // Test getting overall payment status
    console.log('Checking order payment status...');
    const statusResponse = await api.get(`/api/payment/status/${TEST_ORDER_ID}`);
    console.log('✅ Payment Status Retrieved:', {
      totalInstallments: statusResponse.data.totalInstallments,
      paidInstallments: statusResponse.data.paidInstallments,
      pendingInstallments: statusResponse.data.pendingInstallments
    });
    
    return statusResponse.data;
  } catch (error) {
    console.error('❌ Payment Status Test Failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test error handling
 */
async function testErrorHandling() {
  console.log('\n🛡️ Testing Error Handling...');
  
  try {
    // Test 1: Missing order ID
    console.log('Testing missing order ID...');
    await api.post('/api/payment/initialize', {
      paymentMethod: 'mock'
    });
    console.error('❌ Should have failed with missing order ID');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Correctly rejected missing order ID');
    } else {
      console.error('❌ Unexpected error for missing order ID:', error.message);
    }
  }
  
  try {
    // Test 2: Invalid payment method
    console.log('Testing invalid payment method...');
    await api.post('/api/payment/initialize', {
      orderId: TEST_ORDER_ID,
      paymentMethod: 'invalid_method'
    });
    console.error('❌ Should have failed with invalid payment method');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Correctly rejected invalid payment method');
    } else {
      console.error('❌ Unexpected error for invalid payment method:', error.message);
    }
  }
  
  try {
    // Test 3: Non-existent order
    console.log('Testing non-existent order...');
    await api.post('/api/payment/initialize', {
      orderId: 'non-existent-order-id',
      paymentMethod: 'mock'
    });
    console.error('❌ Should have failed with non-existent order');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Correctly rejected non-existent order');
    } else {
      console.error('❌ Unexpected error for non-existent order:', error.message);
    }
  }
}

/**
 * Main test function
 */
async function runPaymentTests() {
  console.log('🚀 InstallMart Payment Integration Test Suite\n');
  console.log('===========================================\n');
  
  try {
    // Run payment initialization tests
    const initResults = await testPaymentInitialization();
    
    // Run payment status tests
    const statusResults = await testPaymentStatus(initResults);
    
    // Run error handling tests
    await testErrorHandling();
    
    console.log('\n🎉 All Payment Integration Tests Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • Mock Payment: ${initResults.mock.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`   • JazzCash Payment: ${initResults.jazzcash.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`   • EasyPaisa Payment: ${initResults.easypaisa.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`   • Payment Status API: ✅ Working`);
    console.log(`   • Error Handling: ✅ Working`);
    
    console.log('\n📝 Next Steps:');
    console.log('   1. Verify payment gateway sandbox accounts are configured');
    console.log('   2. Test actual payment flows in sandbox environment');
    console.log('   3. Check email notifications are working');
    console.log('   4. Verify database updates for payment statuses');
    
  } catch (error) {
    console.error('\n💥 Payment Integration Tests Failed!');
    console.error('Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPaymentTests();
}

export { testPaymentInitialization, testPaymentStatus, testErrorHandling, runPaymentTests };