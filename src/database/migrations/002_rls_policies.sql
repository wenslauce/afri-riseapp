-- Enable Row Level Security on all tables
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nda_signatures ENABLE ROW LEVEL SECURITY;

-- Countries policies (public read access)
CREATE POLICY "Countries are viewable by everyone" ON public.countries
  FOR SELECT USING (true);

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Applications policies
CREATE POLICY "Users can view own applications" ON public.applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications" ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON public.applications
  FOR UPDATE USING (auth.uid() = user_id);

-- Document uploads policies
CREATE POLICY "Users can view own documents" ON public.document_uploads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = document_uploads.application_id 
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own documents" ON public.document_uploads
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = document_uploads.application_id 
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own documents" ON public.document_uploads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = document_uploads.application_id 
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own documents" ON public.document_uploads
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = document_uploads.application_id 
      AND applications.user_id = auth.uid()
    )
  );

-- Payment records policies
CREATE POLICY "Users can view own payments" ON public.payment_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = payment_records.application_id 
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own payments" ON public.payment_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = payment_records.application_id 
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own payments" ON public.payment_records
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = payment_records.application_id 
      AND applications.user_id = auth.uid()
    )
  );

-- NDA signatures policies
CREATE POLICY "Users can view own signatures" ON public.nda_signatures
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = nda_signatures.application_id 
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own signatures" ON public.nda_signatures
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = nda_signatures.application_id 
      AND applications.user_id = auth.uid()
    )
  );

-- Admin policies (for future admin functionality)
-- Note: These will be activated when admin roles are implemented
-- CREATE POLICY "Admins can view all data" ON public.applications
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM auth.users 
--       WHERE auth.users.id = auth.uid() 
--       AND auth.users.raw_app_meta_data->>'role' = 'admin'
--     )
--   );