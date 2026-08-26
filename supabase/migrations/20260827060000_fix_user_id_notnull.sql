-- Allow anonymous membership requests by making user_id nullable
-- and storing visitor info in a new membership_requests table

-- First, make user_id nullable in branch_members
ALTER TABLE public.branch_members
  ALTER COLUMN user_id DROP NOT NULL;

-- Also make user_id nullable in branch_prayers and branch_donations for anonymous visitors
ALTER TABLE public.branch_prayers
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.branch_donations
  ALTER COLUMN user_id DROP NOT NULL;

-- Add a membership_requests table for anonymous visitors to store their details
CREATE TABLE IF NOT EXISTS public.membership_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- RLS for membership_requests
ALTER TABLE public.membership_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a membership request
CREATE POLICY "Anyone can submit membership requests" ON public.membership_requests
  FOR INSERT WITH CHECK (true);

-- Branch leaders and admins can view requests
CREATE POLICY "Branch leaders can view membership requests" ON public.membership_requests
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = membership_requests.branch_id
      AND b.leader_user_id = auth.uid()
    )
  );

-- Branch leaders and admins can update requests (approve/reject)
CREATE POLICY "Branch leaders can update membership requests" ON public.membership_requests
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = membership_requests.branch_id
      AND b.leader_user_id = auth.uid()
    )
  );

-- Branch leaders and admins can delete requests
CREATE POLICY "Branch leaders can delete membership requests" ON public.membership_requests
  FOR DELETE USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = membership_requests.branch_id
      AND b.leader_user_id = auth.uid()
    )
  );
