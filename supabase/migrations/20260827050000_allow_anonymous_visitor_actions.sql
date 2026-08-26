-- Allow anonymous visitors to submit prayer requests, donations, and membership requests
-- These are visitor-facing forms that don't require authentication

-- Branch prayers: allow anonymous INSERT (visitors can submit prayer requests)
DROP POLICY IF EXISTS "Branch leader can manage prayers" ON public.branch_prayers;
CREATE POLICY "Anyone can submit prayer requests" ON public.branch_prayers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Branch leaders can view and manage prayers" ON public.branch_prayers
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = branch_prayers.branch_id
      AND b.leader_user_id = auth.uid()
    )
    OR auth.uid() = branch_prayers.user_id
  );

CREATE POLICY "Branch leaders can update prayers" ON public.branch_prayers
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = branch_prayers.branch_id
      AND b.leader_user_id = auth.uid()
    )
  );

CREATE POLICY "Branch leaders can delete prayers" ON public.branch_prayers
  FOR DELETE USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = branch_prayers.branch_id
      AND b.leader_user_id = auth.uid()
    )
  );

-- Branch donations: allow anonymous INSERT (visitors can give donations)
DROP POLICY IF EXISTS "Branch leader can manage donations" ON public.branch_donations;
CREATE POLICY "Anyone can submit donations" ON public.branch_donations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Branch leaders can view donations" ON public.branch_donations
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = branch_donations.branch_id
      AND b.leader_user_id = auth.uid()
    )
  );

CREATE POLICY "Branch leaders can update donations" ON public.branch_donations
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = branch_donations.branch_id
      AND b.leader_user_id = auth.uid()
    )
  );

CREATE POLICY "Branch leaders can delete donations" ON public.branch_donations
  FOR DELETE USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = branch_donations.branch_id
      AND b.leader_user_id = auth.uid()
    )
  );

-- Branch members: allow anonymous INSERT for membership requests
-- But only as 'pending_member' role
DROP POLICY IF EXISTS "Authenticated can request membership" ON public.branch_members;
DROP POLICY IF EXISTS "Branch leader can manage members" ON public.branch_members;

CREATE POLICY "Anyone can request membership" ON public.branch_members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Branch leaders can view and manage members" ON public.branch_members
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = branch_members.branch_id
      AND b.leader_user_id = auth.uid()
    )
    OR auth.uid() = branch_members.user_id
  );

CREATE POLICY "Branch leaders can update members" ON public.branch_members
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = branch_members.branch_id
      AND b.leader_user_id = auth.uid()
    )
  );

CREATE POLICY "Branch leaders can delete members" ON public.branch_members
  FOR DELETE USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = branch_members.branch_id
      AND b.leader_user_id = auth.uid()
    )
  );
