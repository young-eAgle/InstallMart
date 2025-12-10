# Payment Gateway Integration Credentials Guide

This document provides guidance on obtaining and configuring credentials for payment gateways.

## JazzCash Integration

### Sandbox/Testing Credentials
1. Visit: https://sandbox.jazzcash.com.pk/
2. Register for a Merchant Account
3. Obtain the following credentials:
   - Merchant ID
   - Password
   - Integrity Salt

### Production Credentials
1. Visit: https://www.jazzcash.com.pk/
2. Apply for a Live Merchant Account
3. Complete the business verification process
4. Obtain production credentials from JazzCash support

### Configuration Variables
```
JAZZCASH_MERCHANT_ID=your_merchant_id
JAZZCASH_PASSWORD=your_password
JAZZCASH_INTEGRITY_SALT=your_integrity_salt
JAZZCASH_RETURN_URL=https://yourdomain.com/api/payment/jazzcash/callback
```

## EasyPaisa Integration

### Sandbox/Testing Credentials
1. Visit: https://easypay-sandbox.easypaisa.com.pk/
2. Register for a Merchant Account
3. Obtain the following credentials:
   - Store ID
   - Hash Key

### Production Credentials
1. Visit: https://easypay.easypaisa.com.pk/
2. Apply for a Live Merchant Account
3. Complete the business verification process
4. Obtain production credentials from EasyPaisa support

### Configuration Variables
```
EASYPAISA_STORE_ID=your_store_id
EASYPAISA_HASH_KEY=your_hash_key
EASYPAISA_POSTBACK_URL=https://yourdomain.com/api/payment/easypaisa/callback
```

## Security Best Practices

1. Never commit real credentials to version control
2. Use environment variables for all sensitive data
3. Rotate credentials periodically
4. Restrict access to production credentials
5. Use different credentials for development, staging, and production

## Testing Process

1. Start with sandbox/testing credentials
2. Test all payment scenarios:
   - Successful payments
   - Failed payments
   - Cancelled payments
   - Timeout scenarios
3. Verify callback handling
4. Test with various amounts
5. Move to production only after thorough testing