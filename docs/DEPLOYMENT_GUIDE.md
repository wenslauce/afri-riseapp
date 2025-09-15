# Deployment Guide

## Overview

This guide covers the deployment process for the AfriRise Capital Loan Application System, including environment setup, configuration, and deployment strategies.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Next.js App   │    │   Supabase DB   │
│    (Vercel)     │────│   (Vercel)      │────│   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       ┌─────────────────┐
                       │   File Storage  │
                       │   (Supabase)    │
                       └─────────────────┘
```

## Environments

### Development
- **URL**: http://localhost:3000
- **Database**: Local Supabase instance
- **Storage**: Local file system
- **Payments**: Sandbox mode

### Staging
- **URL**: https://staging.afri-rise.com
- **Database**: Staging Supabase project
- **Storage**: Staging Supabase storage
- **Payments**: Sandbox mode

### Production
- **URL**: https://app.afri-rise.com
- **Database**: Production Supabase project
- **Storage**: Production Supabase storage
- **Payments**: Live mode

## Prerequisites

### Required Accounts
1. **Vercel Account** - For hosting the Next.js application
2. **Supabase Account** - For database and storage
3. **Pesapal Account** - For payment processing
4. **Domain Provider** - For custom domain (optional)

### Required Tools
```bash
# Node.js (v18 or later)
node --version

# npm or yarn
npm --version

# Vercel CLI
npm install -g vercel

# Supabase CLI
npm install -g supabase
```

## Environment Configuration

### Environment Variables

Create `.env.local` files for each environment:

#### Development (.env.local)
```bash
# App Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres

# Security Configuration
ENCRYPTION_KEY=your-32-character-encryption-key
SIGNATURE_SECRET=your-signature-secret-key
JWT_SECRET=your-jwt-secret-key

# Payment Configuration
PESAPAL_CONSUMER_KEY=your-pesapal-consumer-key
PESAPAL_CONSUMER_SECRET=your-pesapal-consumer-secret
PESAPAL_ENVIRONMENT=sandbox

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Monitoring (Optional)
SENTRY_DSN=your-sentry-dsn
ANALYTICS_ID=your-analytics-id
```

#### Production (.env.production)
```bash
# App Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://app.afri-rise.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key

# Security Configuration (Use strong, unique keys)
ENCRYPTION_KEY=your-production-encryption-key
SIGNATURE_SECRET=your-production-signature-secret
JWT_SECRET=your-production-jwt-secret

# Payment Configuration
PESAPAL_CONSUMER_KEY=your-live-pesapal-consumer-key
PESAPAL_CONSUMER_SECRET=your-live-pesapal-consumer-secret
PESAPAL_ENVIRONMENT=live

# Email Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key

# Monitoring
SENTRY_DSN=your-production-sentry-dsn
ANALYTICS_ID=your-production-analytics-id
```

## Database Setup

### Supabase Project Setup

1. **Create Supabase Project**
   ```bash
   # Login to Supabase
   supabase login
   
   # Create new project
   supabase projects create afri-rise-capital
   ```

2. **Initialize Local Development**
   ```bash
   # Initialize Supabase in your project
   supabase init
   
   # Start local Supabase
   supabase start
   ```

3. **Run Migrations**
   ```bash
   # Apply database migrations
   supabase db push
   
   # Seed initial data
   supabase db seed
   ```

### Database Migrations

Run migrations in order:

```bash
# 1. Initial schema
supabase migration up 001_initial_schema

# 2. RLS policies
supabase migration up 002_rls_policies

# 3. Storage setup
supabase migration up 003_storage_setup

# 4. Enhanced RLS policies
supabase migration up 004_enhanced_rls_policies
```

### Seed Data

```bash
# Seed African countries data
psql -d postgres -f database/seed/african_countries.sql

# Run country requirements seeding script
npm run seed:countries
```

## Vercel Deployment

### Initial Setup

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Link Project**
   ```bash
   vercel link
   ```

### Deployment Configuration

Create `vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://app.afri-rise.com"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/webhooks/:path*",
      "destination": "/api/webhooks/:path*"
    }
  ]
}
```

### Environment Variables in Vercel

Set environment variables in Vercel dashboard or via CLI:

```bash
# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add ENCRYPTION_KEY production
# ... add all other environment variables
```

### Deploy to Vercel

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Custom Domain Setup

### Domain Configuration

1. **Add Domain in Vercel**
   - Go to Vercel dashboard
   - Navigate to your project
   - Go to Settings > Domains
   - Add your custom domain

2. **DNS Configuration**
   ```
   Type: CNAME
   Name: app (or @)
   Value: cname.vercel-dns.com
   ```

3. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - Verify HTTPS is working

### Subdomain Setup

For multiple environments:

```
# Production
app.afri-rise.com → Production deployment

# Staging
staging.afri-rise.com → Staging deployment

# API Documentation
docs.afri-rise.com → Documentation site
```

## Security Configuration

### HTTPS and Security Headers

Configure security headers in `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

### Environment Secrets

Store sensitive data securely:

1. **Vercel Environment Variables**
   - Use Vercel's encrypted environment variables
   - Never commit secrets to version control

2. **Supabase Secrets**
   - Use Supabase Vault for sensitive configuration
   - Rotate keys regularly

3. **Payment Gateway Secrets**
   - Store Pesapal keys in environment variables
   - Use different keys for staging/production

## Monitoring and Logging

### Error Tracking

Configure Sentry for error tracking:

```bash
npm install @sentry/nextjs
```

Create `sentry.client.config.js`:
```javascript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

### Performance Monitoring

1. **Vercel Analytics**
   - Enable in Vercel dashboard
   - Monitor Core Web Vitals

2. **Supabase Monitoring**
   - Monitor database performance
   - Set up alerts for high usage

3. **Custom Metrics**
   ```javascript
   // Track application metrics
   import { analytics } from '@/lib/analytics'
   
   analytics.track('application_submitted', {
     user_id: userId,
     application_id: applicationId
   })
   ```

### Health Checks

Create health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        storage: 'healthy'
      }
    })
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: error.message
    }, { status: 500 })
  }
}
```

## Backup and Recovery

### Database Backups

1. **Automated Backups**
   - Supabase provides automated daily backups
   - Configure backup retention policy

2. **Manual Backups**
   ```bash
   # Create manual backup
   supabase db dump --file backup.sql
   
   # Restore from backup
   supabase db reset --file backup.sql
   ```

### File Storage Backups

1. **Supabase Storage**
   - Configure bucket policies
   - Set up cross-region replication

2. **Backup Strategy**
   ```bash
   # Backup storage bucket
   supabase storage cp --recursive bucket-name ./backup/
   ```

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security headers configured
- [ ] SSL certificate ready
- [ ] Monitoring tools configured

### Deployment Steps

1. **Code Review**
   - [ ] Code reviewed and approved
   - [ ] Security scan completed
   - [ ] Performance tests passed

2. **Staging Deployment**
   - [ ] Deploy to staging environment
   - [ ] Run integration tests
   - [ ] Verify all functionality

3. **Production Deployment**
   - [ ] Deploy to production
   - [ ] Verify deployment health
   - [ ] Monitor for errors
   - [ ] Update DNS if needed

### Post-Deployment

- [ ] Verify all services are running
- [ ] Check monitoring dashboards
- [ ] Test critical user flows
- [ ] Update documentation
- [ ] Notify stakeholders

## Rollback Procedures

### Quick Rollback

```bash
# Rollback to previous deployment
vercel rollback

# Or rollback to specific deployment
vercel rollback [deployment-url]
```

### Database Rollback

```bash
# Rollback database migration
supabase migration down

# Restore from backup
supabase db reset --file backup.sql
```

### Emergency Procedures

1. **Service Outage**
   - Check Vercel status page
   - Verify Supabase status
   - Check error logs
   - Implement maintenance page

2. **Data Issues**
   - Stop write operations
   - Assess data integrity
   - Restore from backup if needed
   - Communicate with users

## Performance Optimization

### Build Optimization

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizeImages: true,
  },
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
}
```

### Caching Strategy

1. **Static Assets**
   - Configure CDN caching
   - Use appropriate cache headers

2. **API Responses**
   - Implement response caching
   - Use Redis for session storage

3. **Database Queries**
   - Optimize query performance
   - Use database indexes
   - Implement query caching

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs
   vercel logs
   
   # Local build test
   npm run build
   ```

2. **Environment Variable Issues**
   ```bash
   # List environment variables
   vercel env ls
   
   # Pull environment variables
   vercel env pull .env.local
   ```

3. **Database Connection Issues**
   ```bash
   # Test database connection
   supabase status
   
   # Check database logs
   supabase logs db
   ```

### Support Resources

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Next.js Documentation**: https://nextjs.org/docs
- **Project Documentation**: Internal wiki/docs

## Maintenance

### Regular Tasks

1. **Weekly**
   - Review error logs
   - Check performance metrics
   - Update dependencies

2. **Monthly**
   - Security audit
   - Backup verification
   - Performance optimization

3. **Quarterly**
   - Disaster recovery test
   - Security penetration test
   - Architecture review

### Updates and Patches

1. **Security Updates**
   - Apply immediately
   - Test in staging first
   - Monitor after deployment

2. **Feature Updates**
   - Follow standard deployment process
   - Coordinate with stakeholders
   - Update documentation

## Conclusion

This deployment guide provides a comprehensive approach to deploying and maintaining the AfriRise Capital Loan Application System. Follow these procedures to ensure reliable, secure, and performant deployments.

For questions or issues, contact the DevOps team or refer to the project documentation.