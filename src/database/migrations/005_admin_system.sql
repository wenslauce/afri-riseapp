-- Admin System Migration
-- Creates tables and policies for admin functionality

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'reviewer', 'analyst')),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES admin_users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deactivated_by UUID REFERENCES admin_users(id),
  deactivated_at TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Create application_review_notes table
CREATE TABLE IF NOT EXISTS application_review_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  admin_email TEXT NOT NULL,
  note TEXT NOT NULL,
  note_type TEXT NOT NULL CHECK (note_type IN ('info', 'warning', 'approval', 'rejection')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_application_review_notes_application_id (application_id),
  INDEX idx_application_review_notes_admin_id (admin_id),
  INDEX idx_application_review_notes_created_at (created_at)
);

-- Create email_logs table (if not exists from previous migrations)
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_email_logs_user_id (user_id),
  INDEX idx_email_logs_status (status),
  INDEX idx_email_logs_created_at (created_at)
);

-- Add admin-specific columns to applications table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'approved_at') THEN
    ALTER TABLE applications ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'rejected_at') THEN
    ALTER TABLE applications ADD COLUMN rejected_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'reviewed_by') THEN
    ALTER TABLE applications ADD COLUMN reviewed_by UUID REFERENCES admin_users(id);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Enable RLS on admin tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_review_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_users
-- Only super_admins can manage admin users
CREATE POLICY "Super admins can manage admin users" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.role = 'super_admin' 
      AND au.is_active = true
    )
  );

-- Admins can view their own record
CREATE POLICY "Admins can view own record" ON admin_users
  FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for application_review_notes
-- Admins can manage review notes
CREATE POLICY "Admins can manage review notes" ON application_review_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    )
  );

-- RLS Policies for email_logs
-- Admins can view email logs
CREATE POLICY "Admins can view email logs" ON email_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    )
  );

-- System can insert email logs
CREATE POLICY "System can insert email logs" ON email_logs
  FOR INSERT WITH CHECK (true);

-- System can update email logs
CREATE POLICY "System can update email logs" ON email_logs
  FOR UPDATE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for admin_users updated_at
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to check admin permissions
CREATE OR REPLACE FUNCTION check_admin_permission(
  user_uuid UUID,
  required_role TEXT DEFAULT 'admin'
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid 
    AND is_active = true
    AND (
      role = 'super_admin' OR
      (required_role = 'admin' AND role IN ('super_admin', 'admin')) OR
      (required_role = 'reviewer' AND role IN ('super_admin', 'admin', 'reviewer')) OR
      (required_role = 'analyst' AND role IN ('super_admin', 'admin', 'reviewer', 'analyst'))
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for application statistics
CREATE OR REPLACE VIEW admin_application_stats AS
SELECT 
  COUNT(*) as total_applications,
  COUNT(*) FILTER (WHERE status = 'draft') as draft_count,
  COUNT(*) FILTER (WHERE status = 'submitted') as submitted_count,
  COUNT(*) FILTER (WHERE status = 'under_review') as under_review_count,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
  ROUND(AVG(CAST(application_data->>'financing_amount' AS NUMERIC)), 2) as avg_financing_amount,
  SUM(CAST(application_data->>'financing_amount' AS NUMERIC)) as total_financing_amount,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'approved')::DECIMAL / 
     NULLIF(COUNT(*) FILTER (WHERE status IN ('approved', 'rejected')), 0)) * 100, 
    2
  ) as approval_rate,
  ROUND(
    AVG(
      CASE 
        WHEN status IN ('approved', 'rejected') THEN 
          EXTRACT(EPOCH FROM (COALESCE(approved_at, rejected_at) - created_at)) / 86400
        ELSE NULL 
      END
    ), 
    1
  ) as avg_processing_days
FROM applications;

-- Grant permissions to authenticated users (will be restricted by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON application_review_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON email_logs TO authenticated;
GRANT SELECT ON admin_application_stats TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create initial super admin (replace with actual admin email)
-- This should be run manually with the correct email after deployment
-- INSERT INTO admin_users (user_id, email, role, is_active, created_at)
-- SELECT id, email, 'super_admin', true, NOW()
-- FROM auth.users 
-- WHERE email = 'admin@afri-rise.com'
-- ON CONFLICT (email) DO NOTHING;

COMMENT ON TABLE admin_users IS 'Admin users with role-based access control';
COMMENT ON TABLE application_review_notes IS 'Review notes added by admin users to applications';
COMMENT ON TABLE email_logs IS 'Log of all emails sent by the system';
COMMENT ON VIEW admin_application_stats IS 'Aggregated statistics for admin dashboard';