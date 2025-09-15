# Afri-Rise Loan Application System - Setup Guide

This guide will help you set up the complete loan application system with Supabase backend.

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier is sufficient for development)
- Basic knowledge of Next.js and React

## Step 1: Supabase Project Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project" and sign up/login
   - Click "New Project"
   - Choose your organization and enter project details:
     - Name: `afri-rise-loan-app`
     - Database Password: Generate a strong password
     - Region: Choose closest to your target users
   - Click "Create new project"

2. **Get Your Project Credentials**
   - Once your project is ready, go to Settings → API
   - Copy the following values:
     - Project URL
     - `anon` `public` key
     - `service_role` `secret` key (for database setup only)

## Step 2: Environment Configuration

1. **Create Environment File**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Update .env.local with your Supabase credentials:**
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Payment Gateway Configuration
   # Paystack (Primary gateway)
   PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
   PAYSTACK_ENVIRONMENT=test
   
   # Pesapal (East African gateway - supports M-Pesa)
   PESAPAL_CONSUMER_KEY=your_pesapal_consumer_key
   PESAPAL_CONSUMER_SECRET=your_pesapal_consumer_secret

   # Application Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   APPLICATION_FEE_AMOUNT=100
   
   # Note: NEXT_PUBLIC_APP_URL is used for payment callbacks and webhooks
   # In production, set this to your actual domain: https://yourdomain.com
   ```

## Step 3: Database Setup

You have two options for setting up the database:

### Option A: Manual Setup (Recommended)

1. **Go to your Supabase Dashboard**
   - Navigate to SQL Editor in your Supabase project

2. **Run the migration files in order:**
   
   **Step 1:** Copy and run `src/database/migrations/001_initial_schema.sql`
   - This creates all the necessary tables
   
   **Step 2:** Copy and run `src/database/migrations/002_rls_policies.sql`
   - This sets up Row Level Security policies
   
   **Step 3:** Copy and run `src/database/migrations/003_storage_setup.sql`
   - This creates storage buckets and policies
   
   **Step 4:** Copy and run `src/database/seed/african_countries.sql`
   - This populates the countries table with all African countries

### Option B: Automated Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the database setup script:**
   ```bash
   npm run setup-db
   ```

## Step 4: Verify Database Setup

1. **Check Tables Created:**
   - Go to Table Editor in Supabase Dashboard
   - You should see: `countries`, `user_profiles`, `applications`, `document_uploads`, `payment_records`, `nda_signatures`

2. **Check Storage Buckets:**
   - Go to Storage in Supabase Dashboard
   - You should see: `application-documents`, `nda-documents`

3. **Check Countries Data:**
   - Go to Table Editor → `countries`
   - You should see 54 African countries with their document requirements

## Step 5: Authentication Setup

1. **Configure Auth Settings:**
   - Go to Authentication → Settings in Supabase Dashboard
   - Enable "Enable email confirmations" (recommended)
   - Set Site URL to `http://localhost:3000`
   - Add redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/confirm`

2. **Email Templates (Optional):**
   - Go to Authentication → Email Templates
   - Customize the "Confirm signup" template if needed

## Step 6: Run the Application

1. **Install dependencies (if not done already):**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - You should see the Afri-Rise Equity Limited homepage

## Step 7: Test the Setup

1. **Test Registration:**
   - Click "Start Application" on the homepage
   - Try creating a new account
   - Check if you receive a confirmation email

2. **Test Database Connection:**
   - After registration, check the `auth.users` table in Supabase
   - Your new user should appear there

3. **Test Country Selection:**
   - During registration, verify that the country dropdown is populated
   - Select a country and complete registration

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error:**
   - Double-check your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Make sure there are no extra spaces or quotes

2. **Database connection errors:**
   - Verify your Supabase project is active (not paused)
   - Check that RLS policies are properly set up

3. **Countries not loading:**
   - Verify the countries seed data was inserted correctly
   - Check the browser console for any JavaScript errors

4. **Email confirmation not working:**
   - Check your Supabase Auth settings
   - Verify the Site URL and redirect URLs are correct

### Getting Help:

- Check the Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
- Review the application logs in the browser console
- Check the Supabase Dashboard logs for any database errors

## Next Steps

Once the basic setup is complete, you can:

1. Continue with Task 3: Build user registration and authentication system
2. Set up payment gateway integration (Pesapal)
3. Configure email notifications
4. Deploy to production (Vercel + Supabase)

## Production Deployment

For production deployment:

1. **Create a production Supabase project**
2. **Deploy to Vercel:**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Update Auth settings:**
   - Set production Site URL in Supabase Auth settings
   - Add production redirect URLs

The application is now ready for development and testing!