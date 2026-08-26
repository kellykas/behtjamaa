-- =====================================================
-- BRANCHES AND BRANCH-SCOPED TABLES
-- =====================================================

-- Branches table
CREATE TABLE IF NOT EXISTS public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  location text,
  description text,
  leader_name text,
  leader_email text,
  phone text,
  logo_url text,
  banner_url text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Branch members (links users to branches with roles)
CREATE TABLE IF NOT EXISTS public.branch_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('branch_admin', 'leader', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(branch_id, user_id)
);

-- Branch events
CREATE TABLE IF NOT EXISTS public.branch_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  scheduled_at timestamptz NOT NULL,
  stream_url text,
  location text,
  is_live boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Branch services
CREATE TABLE IF NOT EXISTS public.branch_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  icon text,
  bible_verse text,
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Branch episodes (podcast)
CREATE TABLE IF NOT EXISTS public.branch_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  audio_url text,
  thumbnail_url text,
  category text DEFAULT 'sermon',
  duration text,
  published boolean DEFAULT false,
  featured boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Branch donations
CREATE TABLE IF NOT EXISTS public.branch_donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  donor_name text,
  donor_email text,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  frequency text DEFAULT 'one_time' CHECK (frequency IN ('one_time', 'monthly')),
  message text,
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Branch prayer requests
CREATE TABLE IF NOT EXISTS public.branch_prayers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  request text NOT NULL,
  is_anonymous boolean DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'praying', 'answered')),
  prayed_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Store items
CREATE TABLE IF NOT EXISTS public.store_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  image_url text,
  category text DEFAULT 'merchandise',
  active boolean DEFAULT true,
  stock integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Store orders
CREATE TABLE IF NOT EXISTS public.store_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text,
  customer_email text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  shipping_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_branch_members_branch ON public.branch_members(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_members_user ON public.branch_members(user_id);
CREATE INDEX IF NOT EXISTS idx_branch_events_branch ON public.branch_events(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_services_branch ON public.branch_services(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_episodes_branch ON public.branch_episodes(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_donations_branch ON public.branch_donations(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_prayers_branch ON public.branch_prayers(branch_id);
CREATE INDEX IF NOT EXISTS idx_store_items_branch ON public.store_items(branch_id);
CREATE INDEX IF NOT EXISTS idx_store_orders_branch ON public.store_orders(branch_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Branches: readable by everyone, writable by admins
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Branches are viewable by everyone" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Admins can manage branches" ON public.branches FOR ALL USING (
  public.has_role('admin'::public.app_role, auth.uid())
);

-- Branch members
ALTER TABLE public.branch_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Branch members viewable by everyone" ON public.branch_members FOR SELECT USING (true);
CREATE POLICY "Branch admins can manage members" ON public.branch_members FOR ALL USING (
  public.has_role('admin'::public.app_role, auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.branch_members bm
    WHERE bm.branch_id = branch_members.branch_id
    AND bm.user_id = auth.uid()
    AND bm.role IN ('branch_admin', 'leader')
  )
);
CREATE POLICY "Users can join branches" ON public.branch_members FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- Branch events
ALTER TABLE public.branch_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Branch events viewable by everyone" ON public.branch_events FOR SELECT USING (true);
CREATE POLICY "Branch admins can manage events" ON public.branch_events FOR ALL USING (
  public.has_role('admin'::public.app_role, auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.branch_members bm
    WHERE bm.branch_id = branch_events.branch_id
    AND bm.user_id = auth.uid()
    AND bm.role IN ('branch_admin', 'leader')
  )
);

-- Branch services
ALTER TABLE public.branch_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Branch services viewable by everyone" ON public.branch_services FOR SELECT USING (true);
CREATE POLICY "Branch admins can manage services" ON public.branch_services FOR ALL USING (
  public.has_role('admin'::public.app_role, auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.branch_members bm
    WHERE bm.branch_id = branch_services.branch_id
    AND bm.user_id = auth.uid()
    AND bm.role IN ('branch_admin', 'leader')
  )
);

-- Branch episodes
ALTER TABLE public.branch_episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published branch episodes viewable by everyone" ON public.branch_episodes FOR SELECT USING (
  published = true
  OR public.has_role('admin'::public.app_role, auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.branch_members bm
    WHERE bm.branch_id = branch_episodes.branch_id
    AND bm.user_id = auth.uid()
    AND bm.role IN ('branch_admin', 'leader')
  )
);
CREATE POLICY "Branch admins can manage episodes" ON public.branch_episodes FOR ALL USING (
  public.has_role('admin'::public.app_role, auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.branch_members bm
    WHERE bm.branch_id = branch_episodes.branch_id
    AND bm.user_id = auth.uid()
    AND bm.role IN ('branch_admin', 'leader')
  )
);

-- Branch donations
ALTER TABLE public.branch_donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Branch admins can view donations" ON public.branch_donations FOR SELECT USING (
  public.has_role('admin'::public.app_role, auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.branch_members bm
    WHERE bm.branch_id = branch_donations.branch_id
    AND bm.user_id = auth.uid()
    AND bm.role IN ('branch_admin', 'leader')
  )
);
CREATE POLICY "Anyone can create donations" ON public.branch_donations FOR INSERT WITH CHECK (true);

-- Branch prayers
ALTER TABLE public.branch_prayers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Branch prayers viewable by branch members" ON public.branch_prayers FOR SELECT USING (
  public.has_role('admin'::public.app_role, auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.branch_members bm
    WHERE bm.branch_id = branch_prayers.branch_id
    AND bm.user_id = auth.uid()
  )
);
CREATE POLICY "Authenticated users can create prayers" ON public.branch_prayers FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Branch admins can manage prayers" ON public.branch_prayers FOR UPDATE USING (
  public.has_role('admin'::public.app_role, auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.branch_members bm
    WHERE bm.branch_id = branch_prayers.branch_id
    AND bm.user_id = auth.uid()
    AND bm.role IN ('branch_admin', 'leader')
  )
);

-- Store items
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store items viewable by everyone" ON public.store_items FOR SELECT USING (true);
CREATE POLICY "Branch admins can manage store items" ON public.store_items FOR ALL USING (
  public.has_role('admin'::public.app_role, auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.branch_members bm
    WHERE bm.branch_id = store_items.branch_id
    AND bm.user_id = auth.uid()
    AND bm.role IN ('branch_admin', 'leader')
  )
);

-- Store orders
ALTER TABLE public.store_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Branch admins can view all orders" ON public.store_orders FOR SELECT USING (
  public.has_role('admin'::public.app_role, auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.branch_members bm
    WHERE bm.branch_id = store_orders.branch_id
    AND bm.user_id = auth.uid()
    AND bm.role IN ('branch_admin', 'leader')
  )
  OR user_id = auth.uid()
);
CREATE POLICY "Authenticated users can create orders" ON public.store_orders FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Branch admins can update orders" ON public.store_orders FOR UPDATE USING (
  public.has_role('admin'::public.app_role, auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.branch_members bm
    WHERE bm.branch_id = store_orders.branch_id
    AND bm.user_id = auth.uid()
    AND bm.role IN ('branch_admin', 'leader')
  )
);
