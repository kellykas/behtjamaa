-- Add temp_password to membership_requests so leaders can set a password when approving
ALTER TABLE public.membership_requests
  ADD COLUMN IF NOT EXISTS temp_password text;

-- Create member_login_credentials table for tracking member login accounts
CREATE TABLE IF NOT EXISTS public.member_login_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  membership_request_id uuid REFERENCES public.membership_requests(id) ON DELETE SET NULL,
  email text NOT NULL,
  full_name text NOT NULL,
  temp_password text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS for member_login_credentials
ALTER TABLE public.member_login_credentials ENABLE ROW LEVEL SECURITY;

-- Only branch leaders and admins can manage login credentials
CREATE POLICY "Branch leaders can manage login credentials" ON public.member_login_credentials
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = member_login_credentials.branch_id
      AND b.leader_user_id = auth.uid()
    )
  );

-- Add has_login column to branch_members to track if member has credentials
ALTER TABLE public.branch_members
  ADD COLUMN IF NOT EXISTS has_login boolean DEFAULT false;
