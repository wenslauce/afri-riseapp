# Afri-Rise Equity Limited - Loan Application System

A comprehensive digital loan application platform for companies across African countries, built with Next.js and Supabase.

## Features

- **Multi-Country Support**: Supports all African countries with country-specific document requirements
- **Complete Application Workflow**: Registration → Application Form → Document Upload → Payment → Digital NDA Signing
- **Real-time Progress Tracking**: Live updates on application status
- **Secure Document Storage**: Organized document management with Supabase Storage
- **Multiple Payment Gateways**: Pesapal integration with support for additional payment providers
- **Digital Signatures**: Canvas-based NDA signing with timestamp verification
- **Responsive Design**: Mobile-optimized interface with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Payment**: Pesapal (extensible to other gateways)
- **Authentication**: Supabase Auth with email/password
- **File Storage**: Supabase Storage with organized buckets

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Pesapal merchant account (for payments)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd afririseapp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your Supabase and Pesapal credentials in `.env.local`

4. Set up the database schema (see Database Setup section)

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Setup

The application requires several database tables and policies. Run the SQL scripts in the following order:

1. Countries and document requirements
2. User profiles extension
3. Applications and related tables
4. Row Level Security policies

See the `src/database/` directory for migration scripts.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable React components
├── utils/                  # Utility functions and Supabase clients
├── types/                  # TypeScript type definitions
├── lib/                    # Business logic and services
└── database/               # Database schemas and migrations
```

## Application Flow

1. **Registration**: User creates account and selects their country
2. **Application Form**: Complete loan application with company details
3. **Document Upload**: Upload required documents based on country requirements
4. **Payment**: Pay application fee via Pesapal or other configured gateways
5. **NDA Signing**: Digital signature capture for legal agreement
6. **Progress Tracking**: Real-time status updates throughout the process

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
PESAPAL_CONSUMER_KEY=your_pesapal_consumer_key
PESAPAL_CONSUMER_SECRET=your_pesapal_consumer_secret
PESAPAL_ENVIRONMENT=sandbox # or production
NEXT_PUBLIC_APP_URL=http://localhost:3000
APPLICATION_FEE_AMOUNT=100 # in USD cents
```

## Deployment

The application is designed to be deployed on Vercel with Supabase as the backend service.

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is proprietary software owned by Afri-Rise Equity Limited.

## Support

For technical support or questions about the application process, contact:
- Email: support@afri-rise.com
- Phone: [Contact Number]