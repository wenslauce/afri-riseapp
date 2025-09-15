# Troubleshooting Guide - Afri-Rise Payment System

This guide helps you resolve common issues with the payment system.

## 🚨 Current Issues & Solutions

### Issue 1: "Failed to create payment record: TypeError: Failed to fetch"

**Cause**: Missing Supabase environment variables or authentication issues

**Solutions**:

#### Step 1: Create Environment File
```bash
# Copy the template and add your credentials
cp env.template .env.local
```

#### Step 2: Add Supabase Credentials
Add these to your `.env.local`:
```bash
# Get these from Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://pzsmgygwmyegnuarmlxy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

#### Step 3: Restart Development Server
```bash
# Stop the current server (Ctrl+C) then restart
npm run dev
```

#### Step 4: Check Authentication
- Ensure user is logged in before making payments
- The payment record creation requires authentication
- Check browser console for authentication errors

---

### Issue 2: Network Connection Timeouts

**Error**: `Connect Timeout Error` for external API calls (Pesapal, Currency Exchange)

**Cause**: Network connectivity issues or firewall blocking outbound connections

**Solutions**:

#### Option A: Check Network Connection
```bash
# Test connectivity to Pesapal API
curl -I https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken

# Test connectivity to currency API
curl -I https://api.exchangerate-api.com/v4/latest/USD
```

#### Option B: Configure Network/Proxy
If behind corporate firewall:
- Configure proxy settings
- Whitelist domains: `cybqa.pesapal.com`, `api.exchangerate-api.com`
- Check with IT department for network restrictions

#### Option C: Use Fallback Rates (Quick Fix)
The system uses fallback exchange rates when the API is unavailable. This is normal and payments will still work.

---

## 🔧 Common Solutions

### Environment Variables Not Loading

**Check these files exist**:
- `.env.local` (your local environment file)
- `env.template` (template file)

**Required Variables**:
```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Paystack (Optional)
PAYSTACK_SECRET_KEY=sk_test_your-key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your-key

# Pesapal (Optional)
PESAPAL_CONSUMER_KEY=your-consumer-key
PESAPAL_CONSUMER_SECRET=your-consumer-secret

# App URL (Required for callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Connection Issues

**Check Supabase Status**:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Check your project status
3. Verify API credentials are correct

**Test Database Connection**:
```bash
# Check if you can access the API endpoint
curl https://your-project.supabase.co/rest/v1/countries \
  -H "apikey: your-anon-key"
```

### RLS Policy Issues

**Error**: Permission denied or access blocked

**Solution**: Ensure user owns the application
```sql
-- Check if application belongs to current user
SELECT * FROM applications WHERE user_id = auth.uid();
```

### Payment Gateway Not Available

**Check Gateway Status**:
```bash
# Test endpoint
curl http://localhost:3000/api/payments/initialize
```

**Expected Response**:
```json
{
  "success": true,
  "availableGateways": ["paystack", "pesapal"],
  "message": "Payment initialization endpoint is ready"
}
```

---

## 🧪 Testing Steps

### 1. Environment Setup Test
```bash
# Check environment variables are loaded
echo $NEXT_PUBLIC_SUPABASE_URL
```

### 2. Database Connection Test
- Try creating a user profile
- Check if countries load
- Verify authentication works

### 3. Payment Gateway Test
- Select different payment methods
- Test currency conversion
- Check console for errors

### 4. Full Payment Flow Test
1. Create application
2. Upload documents
3. Try payment with Paystack
4. Try payment with Pesapal
5. Check payment records in database

---

## 📊 Debugging Tools

### Browser Console
- Check for JavaScript errors
- Monitor network requests
- Look for authentication issues

### Supabase Dashboard
- Monitor API usage
- Check database logs
- Verify RLS policies

### Network Tab
- Monitor API calls
- Check response status codes
- Verify request payloads

---

## 🎯 Quick Fixes

### 1. Payment Record Creation Failed
```typescript
// Add this debug code to payment form
console.log('User authenticated:', await supabase.auth.getUser())
console.log('Application ID:', application.id)
console.log('Payment data:', paymentData)
```

### 2. Currency Conversion Not Working
```typescript
// Test currency service
import { CurrencyService } from '@/lib/payments/CurrencyService'
const conversion = await CurrencyService.convertCurrency({
  amount: 100,
  fromCurrency: 'USD',
  toCurrency: 'KES'
})
console.log('Conversion result:', conversion)
```

### 3. Gateway Not Initializing
```bash
# Check environment variables
node -e "console.log(process.env.PESAPAL_CONSUMER_KEY ? 'Pesapal: ✅' : 'Pesapal: ❌')"
node -e "console.log(process.env.PAYSTACK_SECRET_KEY ? 'Paystack: ✅' : 'Paystack: ❌')"
```

---

## 🆘 Getting Help

### Error Patterns

**Database Errors**:
- "Failed to fetch" → Environment variables missing
- "Permission denied" → RLS policy or authentication issue
- "Row not found" → Data integrity issue

**Payment Errors**:
- "Gateway not available" → Missing API credentials
- "Currency conversion failed" → Network or API issue
- "Invalid reference" → Data validation issue

### Debug Information to Collect

1. **Error Messages**: Full error text and stack trace
2. **Environment**: Development/Production, Browser, OS
3. **User State**: Authenticated, Application ID, User ID
4. **Network**: Request/response details, status codes
5. **Database**: Current data state, RLS policies

### Contact Support

Include this information when asking for help:
- Error message and stack trace
- Steps to reproduce
- Environment setup
- Browser console logs
- Network request details

---

## ✅ Final Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Database connection working
- [ ] Authentication flow tested
- [ ] Payment gateways initialized
- [ ] Currency conversion working
- [ ] Webhook endpoints accessible
- [ ] SSL certificates valid
- [ ] Domain configured correctly
- [ ] Error handling tested
- [ ] Monitoring setup

Your payment system should now work smoothly! 🚀
