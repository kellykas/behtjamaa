-- ============================================================================
-- MISSING CONTENT TABLES: public.team_members + public.services
-- ============================================================================
-- The Cloud database reported these two tables as absent while site_settings,
-- episodes, live_events, prayer_requests and every branch_*/store_* table were
-- present. Queries that touched them failed, so the Admin -> Team and
-- Admin -> Services editors could neither load nor save.
--
-- This mirrors the definitions in 20260826000000_content_management.sql.
-- Safe to run more than once:
--   * tables are created only when absent
--   * policies are dropped and recreated
--   * triggers are created only if the helper function exists
--   * seed rows are inserted only when the table is empty
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Team members
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  bio text,
  avatar_url text,
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_team_members_sort_order ON public.team_members (sort_order);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members viewable by everyone" ON public.team_members;
CREATE POLICY "Team members viewable by everyone" ON public.team_members FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;
CREATE POLICY "Admins can manage team members" ON public.team_members FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ---------------------------------------------------------------------------
-- Services / ministry areas
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  icon text,
  bible_verse text,
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_services_sort_order ON public.services (sort_order);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Services viewable by everyone" ON public.services;
CREATE POLICY "Services viewable by everyone" ON public.services FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
CREATE POLICY "Admins can manage services" ON public.services FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ---------------------------------------------------------------------------
-- updated_at triggers (only when the shared helper function exists)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'update_updated_at_column'
  ) THEN
    FOREACH t IN ARRAY ARRAY['team_members', 'services'] LOOP
      EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON public.%I', t, t);
      EXECUTE format(
        'CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()',
        t, t
      );
    END LOOP;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Branch-admin capabilities for these tables (only when that feature is
-- installed; see 20260829090000_branch_admins.sql)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'branch_admin_can'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Branch admins with team permission manage team" ON public.team_members';
    EXECUTE 'CREATE POLICY "Branch admins with team permission manage team" ON public.team_members FOR ALL USING (public.branch_admin_can(auth.uid(), ''team'')) WITH CHECK (public.branch_admin_can(auth.uid(), ''team''))';

    EXECUTE 'DROP POLICY IF EXISTS "Branch admins with services permission manage services" ON public.services';
    EXECUTE 'CREATE POLICY "Branch admins with services permission manage services" ON public.services FOR ALL USING (public.branch_admin_can(auth.uid(), ''services'')) WITH CHECK (public.branch_admin_can(auth.uid(), ''services''))';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Seed defaults (only into empty tables, so real content is never overwritten)
-- ---------------------------------------------------------------------------
INSERT INTO public.team_members (name, role, bio, sort_order)
SELECT v.name, v.role, v.bio, v.sort_order
FROM (VALUES
  ('Chris Sadiki', 'President & Founder', 'Called by God in 2010 to win souls through the arts. Leading BEHT JAMAA since its founding on January 7, 2011.', 1),
  ('Reagan Lescot', 'Secretary', 'Dedicated servant of God, organizing and coordinating ministry activities.', 2),
  ('Fab Meekboy', 'Project Manager', 'Talented artist and project leader, driving BEHT JAMAA''s creative initiatives forward.', 3)
) AS v(name, role, bio, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.team_members);

INSERT INTO public.services (title, description, icon, bible_verse, sort_order)
SELECT v.title, v.description, v.icon, v.bible_verse, v.sort_order
FROM (VALUES
  ('Evangelism', 'Winning souls for Jesus Christ through outreach programs, street ministry, and community engagement.', 'Heart', 'How beautiful are the feet of those who bring good news! - Romans 10:15', 1),
  ('Artistic Activities', 'Using music, dance, drama, and visual arts to spread the Gospel and glorify God.', 'Music', 'Sing to the Lord a new song; sing to the Lord, all the earth. - Psalm 96:1', 2),
  ('Community Service', 'Serving our local communities through practical acts of love and compassion.', 'Users', 'For even the Son of Man did not come to be served, but to serve. - Mark 10:45', 3),
  ('Workshops & Festivals', 'Organizing youth conferences, workshops, and festivals to equip and inspire the next generation.', 'Calendar', 'Don''t let anyone look down on you because you are young, but set an example. - 1 Timothy 4:12', 4),
  ('Humanitarian Work', 'Providing relief and support to those in need, reflecting God''s love in action.', 'HeartHandshake', 'Religion that God our Father accepts as pure and faultless is this: to look after orphans and widows. - James 1:27', 5)
) AS v(title, description, icon, bible_verse, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.services);

-- ---------------------------------------------------------------------------
-- Verification
-- ---------------------------------------------------------------------------
SELECT t AS table_name, (to_regclass('public.' || t) IS NOT NULL) AS present
FROM unnest(ARRAY['team_members', 'services']) AS t
ORDER BY t;
