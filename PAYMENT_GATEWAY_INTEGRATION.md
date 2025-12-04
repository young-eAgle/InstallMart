# Payment Gateway Integration Guide

## Overview
This document explains how to integrate real payment gateways (JazzCash and EasyPaisa) with the InstallMart e-commerce platform.

## Supported Payment Gateways
1. **JazzCash** - Mobile wallet and card payments
2. **EasyPaisa** - Mobile wallet payments

## Prerequisites
- Merchant accounts with JazzCash and EasyPaisa
- SSL certificate for production deployment
- Valid business registration

## Configuration Steps

### 1. Environment Variables Setup

Update your server `.env` file with production credentials:

```bash
# JazzCash Production Credentials
JAZZCASH_MERCHANT_ID=your_real_merchant_id
JAZZCASH_PASSWORD=your_real_password
JAZZCASH_INTEGRITY_SALT=your_real_integrity_salt
JAZZCASH_RETURN_URL=https://yourdomain.com/payment/callback
JAZZCASH_API_URL=https://jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/

# EasyPaisa Production Credentials
EASYPAISA_STORE_ID=your_real_store_id
EASYPAISA_HASH_KEY=your_real_hash_key
EASYPAISA_POSTBACK_URL=https://yourdomain.com/api/payment/easypaisa/callback
EASYPAISA_API_URL=https://easypay.easypaisa.com.pk/easypay/Index.jsf
```

### 2. Domain Configuration

Ensure your domain is whitelisted with both payment providers:
- JazzCash Return URL
- EasyPaisa Postback URL

### 3. SSL Certificate

Install a valid SSL certificate as payment gateways require HTTPS connections.

## Testing Process

### Sandbox Testing
1. Use sandbox credentials provided by payment gateways
2. Test various scenarios:
   - Successful payments
   - Failed payments
   - Cancelled payments
   - Timeout scenarios

### Production Testing
1. Start with small test transactions
2. Verify callback handling
3. Check email notifications
4. Confirm database updates

## Security Considerations

### Data Protection
- Never log sensitive payment data
- Use HTTPS for all payment-related communications
- Validate all callback data
- Implement proper CSRF protection

### Hash Verification
Both payment gateways use hash verification:
- JazzCash: HMAC-SHA256 with integrity salt
- EasyPaisa: SHA256 with hash key

## Error Handling

### Common Issues
1. **Hash Mismatch**: Verify credentials and implementation
2. **Callback Failures**: Check URL accessibility and SSL
3. **Amount Discrepancies**: Ensure proper amount formatting
4. **Duplicate Transactions**: Implement idempotency checks

### Monitoring
- Log all payment attempts
- Monitor success/failure ratios
- Set up alerts for unusual patterns
- Regular security audits

## Going Live Checklist

- [ ] Production credentials configured
- [ ] Domain whitelisted with payment providers
- [ ] SSL certificate installed and valid
- [ ] Callback URLs tested and working
- [ ] Email notifications configured
- [ ] Database backup strategy in place
- [ ] Monitoring and logging implemented
- [ ] Customer support documentation prepared
- [ ] Rollback plan ready

## Support Contacts

### JazzCash Support
- Email: merchantsupport@jazzcash.com
- Phone: +92-XXX-XXXXXXX

### EasyPaisa Support
- Email: merchantsupport@easypaisa.com
- Phone: +92-XXX-XXXXXXX

## Troubleshooting

### Payment Not Reflecting
1. Check callback logs
2. Verify transaction IDs
3. Confirm database connection
4. Review payment gateway dashboard

### Hash Verification Failures
1. Double-check credentials
2. Verify data formatting
3. Confirm encoding standards
4. Test with payment gateway tools

### SSL Issues
1. Validate certificate chain
2. Check intermediate certificates
3. Verify domain matching
4. Test with SSL checkers

## Maintenance

### Regular Tasks
- Monitor transaction logs
- Update credentials periodically
- Review security practices
- Test payment flows monthly

### Updates
- Keep payment SDKs current
- Apply security patches promptly
- Review integration guidelines annually
- Update documentation with changes

## Compliance

### PCI DSS
- Follow payment card industry standards
- Protect cardholder data
- Maintain secure networks
- Regular vulnerability assessments

### Local Regulations
- Comply with State Bank of Pakistan guidelines
- Follow consumer protection laws
- Maintain transaction records
- Report suspicious activities