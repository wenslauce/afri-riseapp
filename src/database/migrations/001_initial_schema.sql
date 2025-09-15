-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Countries table
CREATE TABLE public.countries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  document_requirements JSONB NOT NULL DEFAULT '{
    "required_documents": [
      "Application Form",
      "Project Summary",
      "Audited Accounts",
      "2 Year Management Accounts",
      "5 Year Cash Flow Projection"
    ],
    "company_documents": [
      "Certificate of Incorporation",
      "PIN Certificate",
      "CR12",
      "Tax Compliance",
      "Operating Licenses"
    ],
    "director_documents": [
      "ID",
      "PIN"
    ]
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  country_id UUID REFERENCES countries(id),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  official_address TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table
CREATE TABLE public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
  application_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document uploads table
CREATE TABLE public.document_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment records table
CREATE TABLE public.payment_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  payment_gateway TEXT NOT NULL DEFAULT 'pesapal',
  gateway_transaction_id TEXT NOT NULL,
  gateway_reference TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  gateway_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(payment_gateway, gateway_transaction_id)
);

-- NDA signatures table
CREATE TABLE public.nda_signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  signature_data TEXT NOT NULL, -- Base64 encoded signature image
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_country_id ON user_profiles(country_id);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_document_uploads_application_id ON document_uploads(application_id);
CREATE INDEX idx_payment_records_application_id ON payment_records(application_id);
CREATE INDEX idx_payment_records_status ON payment_records(status);
CREATE INDEX idx_nda_signatures_application_id ON nda_signatures(application_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();