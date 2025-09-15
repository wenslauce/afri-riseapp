-- Enhanced Row Level Security Policies
-- This migration adds comprehensive RLS policies for all tables

-- Enable RLS on all tables if not already enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nda_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

DROP POLICY IF EXISTS "Users can view own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can update own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON public.applications;

DROP POLICY IF EXISTS "Users can view own documents" ON public.document_uploads;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.document_uploads;
DROP POLICY IF EXISTS "Users can update own documents" ON public.document_uploads;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.document_uploads;

DROP POLICY IF EXISTS "Users can view own payments" ON public.payment_records;
DROP POLICY IF EXISTS "Users can insert own payments" ON public.payment_records;
DROP POLICY IF EXISTS "Users can update own payments" ON public.payment_records;

DROP POLICY IF EXISTS "Users can view own signatures" ON public.nda_signatures;
DROP POLICY IF EXISTS "Users can insert own signatures" ON public.nda_signatures;

-- USER PROFILES POLICIES
-- Users can only access their own profile
CREATE POLICY "user_profiles_select_own" ON public.user_profiles
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "user_profiles_insert_own" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = id);

CREATE POLICY "user_profiles_update_own" ON public.user_profiles
    FOR UPDATE USING (auth.uid()::text = id)
    WITH CHECK (auth.uid()::text = id);

-- Prevent deletion of user profiles
CREATE POLICY "user_profiles_no_delete" ON public.user_profiles
    FOR DELETE USING (false);

-- APPLICATIONS POLICIES
-- Users can only access their own applications
CREATE POLICY "applications_select_own" ON public.applications
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "applications_insert_own" ON public.applications
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "applications_update_own" ON public.applications
    FOR UPDATE USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

-- Users can only delete draft applications
CREATE POLICY "applications_delete_draft_only" ON public.applications
    FOR DELETE USING (
        auth.uid()::text = user_id AND 
        status = 'draft'
    );

-- DOCUMENT UPLOADS POLICIES
-- Users can only access documents for their own applications
CREATE POLICY "documents_select_own" ON public.document_uploads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE applications.id = document_uploads.application_id 
            AND applications.user_id = auth.uid()::text
        )
    );

CREATE POLICY "documents_insert_own" ON public.document_uploads
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE applications.id = document_uploads.application_id 
            AND applications.user_id = auth.uid()::text
        )
    );

CREATE POLICY "documents_update_own" ON public.document_uploads
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE applications.id = document_uploads.application_id 
            AND applications.user_id = auth.uid()::text
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE applications.id = document_uploads.application_id 
            AND applications.user_id = auth.uid()::text
        )
    );

CREATE POLICY "documents_delete_own" ON public.document_uploads
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE applications.id = document_uploads.application_id 
            AND applications.user_id = auth.uid()::text
            AND applications.status IN ('draft', 'submitted')
        )
    );

-- PAYMENT RECORDS POLICIES
-- Users can only access payments for their own applications
CREATE POLICY "payments_select_own" ON public.payment_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE applications.id = payment_records.application_id 
            AND applications.user_id = auth.uid()::text
        )
    );

CREATE POLICY "payments_insert_own" ON public.payment_records
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE applications.id = payment_records.application_id 
            AND applications.user_id = auth.uid()::text
        )
    );

-- Only system can update payment status (via service role)
CREATE POLICY "payments_update_system_only" ON public.payment_records
    FOR UPDATE USING (
        auth.jwt() ->> 'role' = 'service_role' OR
        (
            EXISTS (
                SELECT 1 FROM public.applications 
                WHERE applications.id = payment_records.application_id 
                AND applications.user_id = auth.uid()::text
            ) AND status = 'pending'
        )
    );

-- No deletion of payment records
CREATE POLICY "payments_no_delete" ON public.payment_records
    FOR DELETE USING (false);

-- NDA SIGNATURES POLICIES
-- Users can only access signatures for their own applications
CREATE POLICY "signatures_select_own" ON public.nda_signatures
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE applications.id = nda_signatures.application_id 
            AND applications.user_id = auth.uid()::text
        )
    );

CREATE POLICY "signatures_insert_own" ON public.nda_signatures
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE applications.id = nda_signatures.application_id 
            AND applications.user_id = auth.uid()::text
        )
    );

-- No updates or deletions of signatures
CREATE POLICY "signatures_no_update" ON public.nda_signatures
    FOR UPDATE USING (false);

CREATE POLICY "signatures_no_delete" ON public.nda_signatures
    FOR DELETE USING (false);

-- COUNTRIES POLICIES
-- Countries are read-only for all authenticated users
CREATE POLICY "countries_select_all" ON public.countries
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only service role can modify countries
CREATE POLICY "countries_admin_only" ON public.countries
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ADDITIONAL SECURITY FUNCTIONS
-- Function to check if user owns application
CREATE OR REPLACE FUNCTION public.user_owns_application(application_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.applications 
        WHERE id = application_id 
        AND user_id = auth.uid()::text
    );
$$;

-- Function to check if application is in editable state
CREATE OR REPLACE FUNCTION public.application_is_editable(application_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.applications 
        WHERE id = application_id 
        AND user_id = auth.uid()::text
        AND status IN ('draft', 'submitted')
    );
$$;

-- Function to get user's application count (for rate limiting)
CREATE OR REPLACE FUNCTION public.get_user_application_count()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT COUNT(*)::integer FROM public.applications 
    WHERE user_id = auth.uid()::text;
$$;

-- AUDIT TRIGGERS
-- Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name text NOT NULL,
    record_id uuid,
    operation text NOT NULL,
    old_values jsonb,
    new_values jsonb,
    user_id text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can access audit logs
CREATE POLICY "audit_log_service_only" ON public.audit_log
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_log (
            table_name, record_id, operation, old_values, user_id
        ) VALUES (
            TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), auth.uid()::text
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_log (
            table_name, record_id, operation, old_values, new_values, user_id
        ) VALUES (
            TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid()::text
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_log (
            table_name, record_id, operation, new_values, user_id
        ) VALUES (
            TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), auth.uid()::text
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$;

-- Create audit triggers for sensitive tables
DROP TRIGGER IF EXISTS audit_applications ON public.applications;
CREATE TRIGGER audit_applications
    AFTER INSERT OR UPDATE OR DELETE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_payment_records ON public.payment_records;
CREATE TRIGGER audit_payment_records
    AFTER INSERT OR UPDATE OR DELETE ON public.payment_records
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_nda_signatures ON public.nda_signatures;
CREATE TRIGGER audit_nda_signatures
    AFTER INSERT OR UPDATE OR DELETE ON public.nda_signatures
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- RATE LIMITING
-- Create rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL,
    action text NOT NULL,
    count integer DEFAULT 1,
    window_start timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, action, window_start)
);

-- Enable RLS on rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rate limits
CREATE POLICY "rate_limits_select_own" ON public.rate_limits
    FOR SELECT USING (user_id = auth.uid()::text);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    action_name text,
    max_requests integer DEFAULT 10,
    window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_count integer;
    window_start timestamp with time zone;
BEGIN
    -- Calculate window start time
    window_start := date_trunc('hour', now()) + 
                   (EXTRACT(minute FROM now())::integer / window_minutes) * 
                   (window_minutes || ' minutes')::interval;
    
    -- Get current count for this window
    SELECT count INTO current_count
    FROM public.rate_limits
    WHERE user_id = auth.uid()::text
    AND action = action_name
    AND window_start = window_start;
    
    -- If no record exists, create one
    IF current_count IS NULL THEN
        INSERT INTO public.rate_limits (user_id, action, count, window_start)
        VALUES (auth.uid()::text, action_name, 1, window_start);
        RETURN true;
    END IF;
    
    -- Check if limit exceeded
    IF current_count >= max_requests THEN
        RETURN false;
    END IF;
    
    -- Increment counter
    UPDATE public.rate_limits
    SET count = count + 1
    WHERE user_id = auth.uid()::text
    AND action = action_name
    AND window_start = window_start;
    
    RETURN true;
END;
$$;

-- SECURITY VIEWS
-- Create secure view for user dashboard data
CREATE OR REPLACE VIEW public.user_dashboard_view AS
SELECT 
    a.id,
    a.status,
    a.created_at,
    a.updated_at,
    a.application_data,
    COUNT(d.id) as document_count,
    COUNT(p.id) FILTER (WHERE p.status = 'completed') as completed_payments,
    COUNT(s.id) as signature_count
FROM public.applications a
LEFT JOIN public.document_uploads d ON a.id = d.application_id
LEFT JOIN public.payment_records p ON a.id = p.application_id
LEFT JOIN public.nda_signatures s ON a.id = s.application_id
WHERE a.user_id = auth.uid()::text
GROUP BY a.id, a.status, a.created_at, a.updated_at, a.application_data;

-- Grant access to the view
GRANT SELECT ON public.user_dashboard_view TO authenticated;

-- CLEANUP OLD DATA
-- Function to cleanup old audit logs (keep 1 year)
CREATE OR REPLACE FUNCTION public.cleanup_audit_logs()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
    DELETE FROM public.audit_log 
    WHERE created_at < now() - interval '1 year';
$$;

-- Function to cleanup old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
    DELETE FROM public.rate_limits 
    WHERE created_at < now() - interval '24 hours';
$$;