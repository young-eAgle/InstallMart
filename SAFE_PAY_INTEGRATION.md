# SafePay Integration Guide

This document provides instructions for integrating and testing the SafePay payment gateway in the InstallMart e-commerce platform.

## Overview

SafePay is now integrated as a payment option alongside JazzCash and EasyPaisa. Customers can select SafePay as their preferred payment method during checkout.

## Implementation Details

### Backend Components

1. **Payment Gateway Utility** (`server/src/utils/paymentGateways.js`)
   - `createSafePayPayment()` - Creates a payment session with SafePay
   - `verifySafePayPayment()` - Verifies payment callbacks from SafePay

2. **Payment Controller** (`server/src/controllers/paymentController.js`)
   - `safePayCallback` - Handles SafePay webhook callbacks
   - Integrated with existing payment initialization flow

3. **Models**
   - Updated Order model to include "safepay" as a valid payment method

### Frontend Components

1. **Payment Button** (`client/src/components/PaymentButton.tsx`)
   - Added SafePay as a selectable payment option
   - Updated UI with SafePay branding (purple color scheme)
   - Redirects to SafePay checkout page upon selection

2. **Types** (`client/src/types/index.ts`)
   - Updated PaymentMethod type to include "safepay"

## Configuration

### Environment Variables

Add the following to your `server/.env` file:

```env
# SafePay Configuration (Sandbox/Test Credentials)
SAFEPAY_API_KEY=your_safepay_api_key
SAFEPAY_SECRET_KEY=your_safepay_secret_key
SAFEPAY_WEBHOOK_SECRET=your_safepay_webhook_secret
SAFEPAY_RETURN_URL=http://localhost:5173/payment/callback
SAFEPAY_CANCEL_URL=http://localhost:5173/cart
```

## Testing

### Running SafePay Tests

```bash
# From the server directory
npm run test:safepay
```

### Manual Testing

1. Place an order with installment plan
2. Navigate to dashboard and select "Pay Now" for pending installment
3. Choose SafePay as payment method
4. Complete payment on SafePay sandbox portal
5. Verify:
   - Payment status updates to "paid"
   - Transaction ID recorded
   - Email confirmation sent
   - Dashboard reflects updated status

## Obtaining Credentials

### Sandbox/Testing Credentials

1. Visit: https://sandbox.api.getsafepay.com/dashboard/login
2. Register for a Sandbox account
3. Navigate to Developer Settings to obtain:
   - API Key
   - Secret Key
   - Webhook Secret

### Production Credentials

1. Visit: https://getsafepay.com/dashboard/login
2. Complete business verification process
3. Navigate to Developer Settings to obtain production credentials

## Webhook Configuration

SafePay will send webhook notifications to:
`https://yourdomain.com/api/payment/safepay/callback`

Ensure this endpoint is publicly accessible and properly secured.

## Error Handling

The integration includes comprehensive error handling for:
- Network failures
- Invalid credentials
- Payment verification failures
- Database update errors

All errors are logged and appropriate user-facing messages are displayed.

## Security

- Webhook signatures are verified using the webhook secret
- Payment data is validated before processing
- Sensitive information is not logged
- HTTPS is required for production deployments

## Troubleshooting

### Common Issues

1. **Payment Not Updating Status**
   - Check webhook URL configuration
   - Verify webhook signature validation
   - Review server logs for errors
   - Confirm database connectivity

2. **Webhook Not Received**
   - Verify SafePay webhook configuration
   - Check firewall settings
   - Confirm URL accessibility
   - Review webhook logs

3. **Authentication Errors**
   - Verify API keys and secrets
   - Check environment variable configuration
   - Confirm credential validity

### Support

For SafePay-related issues:
- Email: support@getsafepay.com
- Documentation: https://apidocs.getsafepay.com/

For integration issues:
- Contact your development team