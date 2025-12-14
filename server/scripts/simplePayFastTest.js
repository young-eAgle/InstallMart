// Simple PayFast test script
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing PayFast configuration...');
console.log('Merchant ID:', process.env.PAYFAST_MERCHANT_ID);
console.log('Merchant Key:', process.env.PAYFAST_MERCHANT_KEY);
console.log('Passphrase:', process.env.PAYFAST_PASSPHRASE || '(empty)');
console.log('Return URL:', process.env.PAYFAST_RETURN_URL);
console.log('Cancel URL:', process.env.PAYFAST_CANCEL_URL);
console.log('Notify URL:', process.env.PAYFAST_NOTIFY_URL);