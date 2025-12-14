# PayFast Integration - Issues Fixed & Setup Guide

## Problems Identified & Fixed

### 1. ❌ Missing Signature Generation (CRITICAL)
**Issue**: PayFast requires MD5 signature validation for all transactions. Your code didn't generate signatures.

**Fix Applied**: 
- Added `generateSignature()` function that creates MD5 hashes according to PayFast specifications
- Function properly orders parameters as required by PayFast
- Includes passphrase in signature generation

```javascript
// Now includes proper signature generation
const signature = generateSignature(paymentData, PAYFAST_CONFIG.passphrase);
```

### 2. ❌ Incomplete Callback Verification
**Issue**: ITN (Instant Transaction Notification) callback verification didn't validate signatures

**Fix Applied**:
- Added signature verification in `verifyPayFastPayment()`
- Validates that received signature matches generated signature
- Added duplicate payment detection (idempotency)
- Returns 200 OK status (required by PayFast to prevent retries)

### 3. ❌ Missing Payment Method Field
**Issue**: Not recording which payment method was used

**Fix Applied**:
- Added `paymentMethod: "payfast"` field to installment record
- Helps track payment source

### 4. ❌ Frontend Not Including Signature
**Issue**: PayFastPayment page sent data to PayFast without the signature

**Fix Applied**:
- Updated form submission to include signature field
- Validates signature exists before submission
- Proper field ordering for PayFast form

### 5. ❌ Wrong Environment Value
**Issue**: `.env` had `'prod'` but PayFast expects `'live'`

**Fix Applied**:
- Changed to use `'live'` for production and `'sandbox'` for testing
- Updated URL routing accordingly

---

## Configuration Setup

### Step 1: Update Your .env File

```env
# PayFast Configuration (SANDBOX - for testing)
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=46f0cd694581a
PAYFAST_PASSPHRASE=testing123
PAYFAST_RETURN_URL=http://localhost:8080/payment/success
PAYFAST_CANCEL_URL=http://localhost:8080/cart
PAYFAST_NOTIFY_URL=http://localhost:3000/api/payment/payfast/callback

# For PRODUCTION (when ready)
# PAYFAST_MERCHANT_ID=your_actual_merchant_id
# PAYFAST_MERCHANT_KEY=your_actual_merchant_key
# PAYFAST_PASSPHRASE=your_actual_passphrase
# NODE_ENV=production
```

**Important Notes**:
- **Test Credentials**: Merchant ID `10000100` with Key `46f0cd694581a` are PayFast sandbox test credentials
- **Real Credentials**: Get from https://www.payfast.co.za/merchant-dashboard
- **Passphrase**: Required for signature generation - set to something secure in production
- **URLs**: Must be accessible from internet for callbacks (localhost won't work in production)

### Step 2: Test the Integration

Run the test file:
```bash
cd server
node testPayFast.js
```

Expected output:
```
✅ Test 1: Creating Payment... 
✅ Payment Created Successfully!
✅ Test 2: Verifying Signature...
✅ Test 3: Testing Signature Validation (should fail)...
✅ PayFast Integration is working correctly!
```

### Step 3: Set Up Return URL Handler

Ensure your frontend has callback handlers:
- `/payment/success?orderId=xxx&txnId=yyy` - Success page
- `/payment/failed?error=xxx` - Failure page

These are configured in:
- `client/src/pages/PaymentSuccess.tsx`
- `client/src/pages/PaymentFailed.tsx`

---

## Testing with Sandbox

### Test Payment Flow:

1. **Go to Checkout** → Select "PayFast"
2. **Click Pay** → Redirected to PayFast form
3. **Use Test Card**:
   - Card Number: `4111111111111111`
   - Expiry: Any future date
   - CVC: Any 3 digits

4. **Complete Payment** → Redirected back to your site

### Debug Logs

Check server logs for payment events:
```
[PAYMENT] PAYFAST_CALLBACK_RECEIVED: { method: 'POST', m_payment_id: 'xxx', pf_payment_id: 'yyy', payment_status: 'COMPLETE' }
[PAYMENT] PAYFAST_PAYMENT_SUCCESS: { orderId: 'xxx', transactionId: 'yyy', amount: 100 }
```

---

## Common Issues & Solutions

### Issue 1: "Signature verification failed"
**Cause**: Passphrase mismatch between backend and PayFast

**Solution**:
```bash
# Check your .env has PAYFAST_PASSPHRASE set correctly
# If empty passphrase in sandbox, use:
PAYFAST_PASSPHRASE=
```

### Issue 2: "Missing merchant ID" Error
**Cause**: Environment variables not loaded

**Solution**:
```bash
# Restart server to reload .env
# Make sure server/.env exists and has PAYFAST_MERCHANT_ID set
```

### Issue 3: Payment shows in PayFast but not in your system
**Cause**: Callback URL unreachable or returning wrong status code

**Check**:
```bash
# Ensure PAYFAST_NOTIFY_URL is publicly accessible
# Must return 200 OK status
# Should be: http://yourdomain.com/api/payment/payfast/callback
```

### Issue 4: "Invalid amount format"
**Cause**: Amount not properly formatted as decimal

**Fix Applied**: 
```javascript
amount: parseFloat(amount).toFixed(2) // Now properly formatted
```

---

## Production Deployment Checklist

- [ ] Get real Merchant ID and Key from PayFast
- [ ] Set `PAYFAST_PASSPHRASE` to a secure random string
- [ ] Update all URLs to production domain:
  - `PAYFAST_RETURN_URL=https://yourdomain.com/payment/success`
  - `PAYFAST_CANCEL_URL=https://yourdomain.com/cart`
  - `PAYFAST_NOTIFY_URL=https://yourdomain.com/api/payment/payfast/callback`
- [ ] Set `NODE_ENV=production`
- [ ] Install SSL certificate (HTTPS required)
- [ ] Test payment flow in sandbox mode first
- [ ] Request PayFast to enable live mode

---

## API Endpoints

### Payment Initialization
```
POST /api/payment/initialize
Headers: Authorization: Bearer {token}
Body: {
  orderId: "xxx",
  paymentMethod: "payfast",
  installmentId: "optional"
}
```

### PayFast Callback (ITN)
```
POST /api/payment/payfast/callback
(Sent automatically by PayFast)
```

### Get Payment Status
```
GET /api/payment/status/{orderId}/{installmentId}
Headers: Authorization: Bearer {token}
```

---

## Files Modified

1. **`server/src/utils/payFastGateways.js`** - Signature generation & verification
2. **`server/src/controllers/paymentController.js`** - Enhanced callback handling
3. **`client/src/pages/PayFastPayment.tsx`** - Form submission with signature
4. **`server/testPayFast.js`** - Comprehensive test suite

---

## Security Notes

✅ **Implemented**:
- MD5 signature validation on all callbacks
- Duplicate payment detection (idempotency)
- Merchant credentials in environment variables
- Order ownership verification
- Amount validation

⚠️ **Additional Security (Optional)**:
- IP whitelist PayFast server addresses
- Rate limiting on payment endpoints
- Webhook secret rotation periodically

---

## Support Resources

- **PayFast Documentation**: https://www.payfast.co.za/developer/docs
- **PayFast Sandbox**: https://sandbox.payfast.co.za
- **Test Card Numbers**: https://www.payfast.co.za/developer/resources/test-cards

---

## Need Help?

If issues persist:

1. **Check signature generation**:
   ```bash
   node testPayFast.js
   ```

2. **Enable debug logs**:
   ```javascript
   // In payFastGateways.js, uncomment:
   console.log('Signature generation debug:', { stringToSign, signature });
   ```

3. **Verify callback is received**:
   ```bash
   # Monitor server logs for "PAYFAST_CALLBACK_RECEIVED" messages
   ```

4. **Test with cURL**:
   ```bash
   curl -X POST http://localhost:3000/api/payment/payfast/callback \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "m_payment_id=test&pf_payment_id=123&payment_status=COMPLETE&signature=xxx"
   ```
