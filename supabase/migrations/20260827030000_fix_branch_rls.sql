-- Add images column for multiple event pictures
ALTER TABLE public.branch_events
  ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;

-- Fix branch RLS policies: also allow the branch leader (via leader_user_id) to manage content
-- Drop and recreate policies for all branch tables

-- Branch events
DROP POLICY IF EXISTS "Branch admins can manage events" ON public.branch_events;
CREATE POLICY "Branch admins can manage events" ON public.branch_events FOR ALL USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (
    SELECT 1 FROM public.branches b
    WHERE b.id = branch_events.branch_id
    AND b.leader_user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.branch_members bm
    WHERE bm.branch_id = branch_events.branch_id
    AND bm.user_id = auth.uid()
    AND bm.role IN ('branch_admin', 'leader', 'member')
  )
);

-- Branch services
DROP POLICY IF EXISTS "Branch admins can manage services" ON public.branch_services;
CREATE POLICY "Branch admins can manage services" ON public.branch_services FOR ALL USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (
    SELECT 1 FROM public.branches b
    WHERE b.id = branch_services.branch_id
    AND b.leader_user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.branch_members bm
    WHERE bm.branch_id = branch_services.branch_id
    AND bm.user_id = auth.uid()
    AND bm.role IN ('branch_admin', 'leader', 'member')
  )
);

-- Branch episodes
DROP POLICY IF EXISTS "Branch admins can manage episodes" ON public.branch_episodes;
CREATE POLICY "Branch admins can manage episodes" ON public.branch_episodes FOR ALL USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (
    SELECT 1 FROM public.branches b
    WHERE b.id = branch_episodes.branch_id
    AND b.leader_user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.branch_members bm
    WHERE bm.branch_id = branch_episodes.branch_id
    AND bm.user_id = auth.uid()
    AND bm.role IN ('branch_admin', 'leader', 'member')
  )
);

-- Branch donations
DROP POLICY IF EXISTS "Branch admins can manage donations" ON public.branch_donations;
CREATE POLICY "Branch admins can manage donations" ON public.branch_donations FOR ALL USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (
    SELECT 1 FROM public.branches b
    WHERE b.id = branch_donations.branch_id
    AND b.leader_user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.branch_members bm
    WHERE bm.branch_id = branch_donations.branch_id
    AND bm.user_id = auth.uid()
    AND bm.role IN ('branch_admin', 'leader', 'member')
  )
);

-- Branch prayers
DROP POLICY IF EXISTS "Branch admins can manage prayers" ON public.branch_prayers;
CREATE POLICY "Branch admins can manage prayers" ON public.branch_prayers FOR ALL USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (
    SELECT 1 FROM public.branches b
    WHERE b.id = branch_prayers.branch_id
    AND b.leader_user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.branch_members bm
    WHERE bm.branch_id = branch_prayers.branch_id
    AND bm.user_id = auth.uid()
    AND bm.role IN ('branch_admin', 'leader', 'member')
  )
);

-- Branch members
DROP POLICY IF EXISTS "Branch admins can manage members" ON public.branch_members;
CREATE POLICY "Branch admins can manage members" ON public.branch_members FOR ALL USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (
    SELECT 1 FROM public.branches b
    WHERE b.id = branch_members.branch_id
    AND b.leader_user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.branch_members bm
    WHERE bm.branch_id = branch_members.branch_id
    AND bm.user_id = auth.uid()
    AND bm.role IN ('branch_admin', 'leader')
  )
);

-- Store items
DROP POLICY IF EXISTS "Branch admins can manage store items" ON public.store_items;
CREATE POLICY "Branch admins can manage store items" ON public.store_items FOR ALL USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (
    SELECT 1 FROM public.branches b
    WHERE b.id = store_items.branch_id
    AND b.leader_user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.branch_members bm
    WHERE bm.branch_id = store_items.branch_id
    AND bm.user_id = auth.uid()
    AND bm.role IN ('branch_admin', 'leader', 'member')
  )
);

-- Store orders
DROP POLICY IF EXISTS "Branch admins can manage orders" ON public.store_orders;
CREATE POLICY "Branch admins can manage orders" ON public.store_orders FOR ALL USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (
    SELECT 1 FROM public.branches b
    WHERE b.id = store_orders.branch_id
    AND b.leader_user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.branch_members bm
    WHERE bm.branch_id = store_orders.branch_id
    AND bm.user_id = auth.uid()
    AND bm.role IN ('branch_admin', 'leader', 'member')
  )
);
