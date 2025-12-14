import { createGoPayFastPayment } from '../src/utils/gopayFastGateway.js';

// Test data
const testPaymentRequest = {
  order_id: '12345',
  user_id: 'user_12345',
  user_mobile_number: '923001234567', // Pakistani number
  amount: 5000,
  product_name: 'Test Order',
  product_description: 'Test payment for GoPay Fast'
};

console.log('[Test] Starting GoPay Fast integration test...');
console.log('[Test] Test data:', testPaymentRequest);

try {
  const result = await createGoPayFastPayment(testPaymentRequest);
  console.log('[Test] Payment creation result:', result);
  console.log('[Test] SUCCESS: GoPay Fast integration working!');
} catch (error) {
  console.error('[Test] ERROR:', error.message);
  console.error('[Test] Full error:', error);
}
