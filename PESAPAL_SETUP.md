# Pesapal Payment Gateway Setup

This guide explains how to set up Pesapal payment gateway integration for your Kenya-based business.

## Overview

Pesapal is a popular East African payment gateway that supports:
- **M-Pesa** (Kenya's leading mobile money platform)
- **Airtel Money** 
- **Credit/Debit Cards** (Visa, MasterCard)
- **Bank Transfers**
- **USD to KES conversion** for international customers

## Prerequisites

1. **Pesapal Business Account**: Register at [Pesapal Merchant Portal](https://www.pesapal.com)
2. **Business Verification**: Complete KYB (Know Your Business) verification
3. **Kenya Business**: Must have a Kenyan business registration
4. **API v3 Access**: Ensure your account has access to Pesapal API v3

**Note**: This integration uses Pesapal API v3 directly (no SDK required), providing better reliability and modern authentication.

## Configuration Steps

### 1. Get Pesapal Credentials

1. Log into your [Pesapal Merchant Portal](https://www.pesapal.com)
2. Navigate to **API Integration** section
3. Generate or copy your:
   - **Consumer Key**
   - **Consumer Secret**

### 2. Environment Variables

Add these to your `.env.local` file:

```bash
# Pesapal Configuration
PESAPAL_CONSUMER_KEY=your_consumer_key_here
PESAPAL_CONSUMER_SECRET=your_consumer_secret_here

# Application URL (required for Pesapal callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Example:
# PESAPAL_CONSUMER_KEY=qzFx9Jj3H8mKp2Wn5Ys7Uv4Rt6Qw8Ez1Cy3Dx5Fb7Gg9Hh2Jj4Kk6Ll8Mm0Nn2Pp4Qq6
# PESAPAL_CONSUMER_SECRET=aB3cD5eF7gH9iJ1kL3mN5oP7qR9sT1uV3wX5yZ7bC9dE1fG3hI5jK7lM9nO1pQ3rS5t
# NEXT_PUBLIC_APP_URL=https://yourdomain.com (in production)
```

### 3. Configure IPN (Instant Payment Notification)

In your Pesapal merchant portal:

1. Go to **Settings** → **IPN Settings**
2. Set your IPN URL to: `https://yourdomain.com/api/webhooks/pesapal`
3. Select notification methods: **Both GET and POST**
4. Save the configuration

### 4. Test Configuration

Test your setup:

```bash
# Check if Pesapal is available
curl https://yourdomain.com/api/payments/initialize

# Should return:
# {
#   "success": true,
#   "availableGateways": ["paystack", "pesapal"],
#   "message": "Payment initialization endpoint is ready"
# }
```

## Currency Support

### Supported Currencies
- **KES** (Kenyan Shilling) - Native support
- **USD** (US Dollar) - Auto-converted to KES

### Auto-Conversion Feature
- USD payments are automatically converted to KES
- Real-time exchange rates from CurrencyService
- Transparent pricing shown to customers
- Settlement in KES to your Kenyan bank account

## Payment Flow

1. **Customer selects Pesapal** as payment method
2. **Currency conversion** (if USD selected)
3. **Redirect to Pesapal** payment page
4. **Customer pays** via M-Pesa, card, or bank transfer
5. **IPN notification** sent to your webhook
6. **Payment status updated** in your database

## Webhook Handling

Pesapal sends IPN notifications to: `/api/webhooks/pesapal`

The webhook handles:
- Payment completion confirmations
- Payment failure notifications
- Status updates
- Database record updates

## Testing

### Test Credentials
Pesapal provides sandbox credentials for testing. Contact Pesapal support for test credentials.

### Test Flow
1. Set up test credentials in `.env.local`
2. Use test amounts (e.g., KES 100)
3. Test with M-Pesa sandbox numbers
4. Verify webhook notifications

## Production Checklist

- [ ] Pesapal business account verified
- [ ] Production credentials configured
- [ ] IPN URL configured correctly
- [ ] SSL certificate installed
- [ ] Webhook endpoint tested
- [ ] Payment flow tested with real transactions
- [ ] Customer support process established

## Troubleshooting

### Common Issues

**1. "Pesapal credentials not found"**
- Verify `PESAPAL_CONSUMER_KEY` and `PESAPAL_CONSUMER_SECRET` in `.env.local`
- Restart your application after adding environment variables

**2. Payment initialization fails**
- Check Pesapal merchant portal for account status
- Verify business verification is complete
- Check API quotas and limits

**3. Webhooks not working**
- Verify IPN URL is accessible publicly
- Check SSL certificate
- Verify webhook endpoint responds with 200 status
- Check webhook logs in your application

**4. M-Pesa payments failing**
- Verify M-Pesa is enabled in Pesapal portal
- Check transaction limits
- Ensure customer has sufficient funds

### Getting Help

1. **Pesapal Support**: support@pesapal.com
2. **Developer Documentation**: [Pesapal API Docs](https://developer.pesapal.com)
3. **Community Forum**: Pesapal Developer Community

## Benefits for Kenya-Based Business

### Why Choose Pesapal?

1. **Local Expertise**: Deep understanding of Kenyan payment landscape
2. **M-Pesa Integration**: Seamless mobile money support
3. **Competitive Rates**: Lower fees for local transactions
4. **Fast Settlement**: Quick payouts to Kenyan banks
5. **Customer Trust**: Well-known brand in East Africa
6. **Multi-currency**: USD to KES conversion for international customers

### Transaction Fees
- M-Pesa: Competitive rates (contact Pesapal for current rates)
- Cards: Standard East African rates
- Bank Transfer: Low-cost option for larger amounts

## Security

- **PCI DSS Compliant**: Industry-standard security
- **Encrypted Communications**: All API calls secured
- **Fraud Protection**: Built-in risk management
- **3D Secure**: Enhanced card security

Your Pesapal integration is now ready to accept payments from Kenyan and international customers!
