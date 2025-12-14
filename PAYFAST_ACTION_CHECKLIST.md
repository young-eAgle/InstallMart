# PayFast Cell Number Fix - Action Checklist

## ✅ Completed Fixes

- [x] Updated payFastGateways.js with enhanced phone formatting
- [x] Added multiple phone source fallbacks (order.phone → user.phone → user.contactNumber)
- [x] Implemented sandbox vs production phone handling
- [x] Created test scripts for phone formatting validation
- [x] All integration tests passing
- [x] Updated payment controller with fallback logic
- [x] Added detailed logging for phone processing
- [x] Created comprehensive documentation

## 📋 To Do - Immediate (Before Next Test)

### 1. Verify `.env` Credentials
- [ ] Check PAYFAST_MERCHANT_ID=10000103 (exactly 8 digits)
- [ ] Check PAYFAST_MERCHANT_KEY=46f0cd694581a (exactly 13 chars)
- [ ] Verify PAYFAST_PASSPHRASE is set (empty is OK for sandbox)
- [ ] Confirm PAYFAST_RETURN_URL is correct
- [ ] Confirm PAYFAST_CANCEL_URL is correct
- [ ] Confirm PAYFAST_NOTIFY_URL is correct

### 2. Test Phone Formatting
- [ ] Run: `node server/testPhoneFormatting.js`
- [ ] Verify all phone formats convert correctly
- [ ] Check length validation (9-15 digits)

### 3. Test PayFast Integration
- [ ] Run: `npm run test:payfast` (from server directory)
- [ ] Verify payment creation successful
- [ ] Verify signature generation correct
- [ ] Verify verification passes
- [ ] All tests show ✅ checkmarks

### 4. Check Order Model
- [ ] Verify Order model has `phone` field
- [ ] Ensure phone is being saved during checkout
- [ ] Check if phone is required or optional
- [ ] Verify phone field definition

## 📋 To Do - Before Testing with Real Orders

### 5. Update Checkout Form
- [ ] Ensure checkout collects customer phone number
- [ ] Make phone field required
- [ ] Add placeholder: "03001234567"
- [ ] Add helper text: "Enter phone without +92 or with it"
- [ ] Optional: Add real-time formatting as user types

### 6. Verify Order Creation
- [ ] Confirm phone is being passed during order creation
- [ ] Verify `order.phone` is populated with formatted number
- [ ] Check MongoDB shows phone field populated

### 7. Test Payment Flow
- [ ] Create test order with valid phone (e.g., 923001234567)
- [ ] Click "Pay Now" button
- [ ] Select "PayFast" payment method
- [ ] Verify redirects to PayFast payment form
- [ ] **Should NOT see "cell_number format invalid" error**

### 8. Test Different Phone Formats
- [ ] Test with: `03001234567` (local Pakistan)
- [ ] Test with: `923001234567` (international)
- [ ] Test with: `+92 300 1234567` (with + and spaces)
- [ ] Test with: `300-123-4567` (with dashes)
- [ ] All should work without errors

## 🔍 Troubleshooting Checklist

### If Still Getting "cell_number" Error

- [ ] Check server logs for "Phone Number Processing" output
- [ ] Verify phone is in order: `db.orders.findOne({...}).phone`
- [ ] Confirm phone format: Should be digits only, 9-15 chars, starting with country code
- [ ] Check if phone is undefined/null: `console.log('Phone:', order.phone)`
- [ ] Verify not in production mode: `NODE_ENV should be 'development'` for sandbox
- [ ] Try test phone: `923001234567`

### If Phone Not Being Saved

- [ ] Check checkout form is collecting phone
- [ ] Verify order creation endpoint receives phone parameter
- [ ] Confirm phone is included in order.create() call
- [ ] Check if phone field is in Order schema

### If Signature Mismatch

- [ ] Verify PAYFAST_MERCHANT_KEY is exactly 13 characters
- [ ] Verify PAYFAST_MERCHANT_ID is exactly 8 digits
- [ ] Verify PAYFAST_PASSPHRASE matches (empty is OK)
- [ ] Check .env file encoding is UTF-8

## 📊 Testing Checklist

### Unit Tests
- [ ] `npm run test:payfast` - All tests pass
- [ ] `node testPhoneFormatting.js` - All formats valid

### Integration Tests
- [ ] Create order through UI
- [ ] Verify phone saved in database
- [ ] Initiate payment through UI
- [ ] Verify PayFast payment page loads
- [ ] Check console logs for "Phone Number Processing"

### End-to-End Tests
- [ ] Complete full payment flow in sandbox
- [ ] Check payment status updates correctly
- [ ] Verify callback handling works
- [ ] Confirm installment marked as paid

## 📝 Documentation Checklist

- [ ] Read: PAYFAST_QUICK_PHONE_FIX.md (quick reference)
- [ ] Read: PAYFAST_CELL_NUMBER_FIX.md (detailed guide)
- [ ] Read: PAYFAST_BEFORE_AFTER.md (visual comparison)
- [ ] Review: PAYFAST_PHONE_FIX_SUMMARY.md (complete summary)

## 🚀 Production Readiness

### Before Going Live
- [ ] Get real PayFast merchant account
- [ ] Obtain real PAYFAST_MERCHANT_ID
- [ ] Obtain real PAYFAST_MERCHANT_KEY
- [ ] Set secure PAYFAST_PASSPHRASE
- [ ] Update NODE_ENV to 'production'
- [ ] Update URLs to production domain
- [ ] Update PAYFAST_RETURN_URL to production
- [ ] Update PAYFAST_CANCEL_URL to production
- [ ] Update PAYFAST_NOTIFY_URL to production
- [ ] Test complete flow in production (with monitoring)
- [ ] Set up error alerting
- [ ] Enable phone validation in checkout

### Production Considerations
- [ ] Invalid phone numbers will throw errors (not fallback)
- [ ] Error message will be: "Invalid phone number format. PayFast requires international format..."
- [ ] Ensure customer phone collection is robust
- [ ] Consider adding client-side phone validation
- [ ] Monitor payment failures related to phone format
- [ ] Have support process for customers with invalid phone

## ✅ Success Criteria

All items below should be true:

- [ ] Tests pass: `npm run test:payfast`
- [ ] Phone formatting works: `node testPhoneFormatting.js`
- [ ] Can create test payment without errors
- [ ] PayFast redirect works without cell_number error
- [ ] Signature verification passes
- [ ] Merchant credentials valid (8 digits + 13 chars)
- [ ] Phone fallback works in sandbox
- [ ] Clear errors shown in production

## 📞 Quick Support

| Problem | Solution |
|---------|----------|
| Still getting cell_number error | Ensure phone has country code (92 for Pakistan) |
| Phone not being saved | Make phone required in checkout form |
| Tests failing | Check .env credentials format |
| Can't find Phone Processing logs | Ensure NODE_ENV is not 'production' |
| Payment fails with timeout | Check PayFast URLs in .env are accessible |

---

**Last Updated**: December 13, 2025
**Status**: ✅ Ready for Testing
**Tests**: ✅ All Passing
