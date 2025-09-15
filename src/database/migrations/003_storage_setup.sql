-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('application-documents', 'application-documents', false),
  ('nda-documents', 'nda-documents', false);

-- Storage policies for application documents
CREATE POLICY "Users can upload their own application documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'application-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own application documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'application-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own application documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'application-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own application documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'application-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for NDA documents
CREATE POLICY "Users can upload their own NDA documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'nda-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own NDA documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'nda-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- This function will be called when a new user signs up
  -- The actual profile creation will be handled in the application
  -- after the user completes the registration form with additional details
  RETURN NEW;
END;
$$;

-- Trigger for new user creation (placeholder for future use)
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();