-- ============================================================================
-- BRANCH ADMINS (scoped sign-ons created by a Super Admin)
-- ============================================================================
--   * Super Admin   -> existing system admin (user_roles.role = 'admin'), full access
--   * Branch Admin  -> created by a super admin; limited to chosen branches
--                      (branch_ids) and chosen site capabilities (permissions)
--
-- Safe to run more than once. Policies are only created for tables that
-- actually exist in this database; anything missing is skipped and reported,
-- so this script never fails on a partially-provisioned database.

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.branch_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  temp_password text,
  branch_ids uuid[] NOT NULL DEFAULT '{}',
  permissions text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS branch_admins_email_key ON public.branch_admins (lower(email));
CREATE INDEX IF NOT EXISTS idx_branch_admins_user ON public.branch_admins(user_id);

ALTER TABLE public.branch_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins manage branch admins" ON public.branch_admins;
CREATE POLICY "Super admins manage branch admins" ON public.branch_admins FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Branch admins can read own record" ON public.branch_admins;
CREATE POLICY "Branch admins can read own record" ON public.branch_admins FOR SELECT
  USING (user_id = auth.uid());

-- Keep updated_at fresh (guarded in case the helper function is absent)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'update_updated_at_column'
  ) THEN
    DROP TRIGGER IF EXISTS update_branch_admins_updated_at ON public.branch_admins;
    CREATE TRIGGER update_branch_admins_updated_at
      BEFORE UPDATE ON public.branch_admins
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER -> bypass RLS, avoid recursion)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_branch_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.branch_admins ba WHERE ba.user_id = _user_id AND ba.is_active);
$$;

CREATE OR REPLACE FUNCTION public.branch_admin_can(_user_id uuid, _permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.branch_admins ba
    WHERE ba.user_id = _user_id AND ba.is_active AND _permission = ANY(ba.permissions)
  );
$$;

CREATE OR REPLACE FUNCTION public.branch_admin_manages(_user_id uuid, _branch_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.branch_admins ba
    WHERE ba.user_id = _user_id AND ba.is_active AND _branch_id = ANY(ba.branch_ids)
  );
$$;

CREATE OR REPLACE FUNCTION public.my_branch_admin()
RETURNS TABLE (id uuid, full_name text, email text, branch_ids uuid[], permissions text[], is_active boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT ba.id, ba.full_name, ba.email, ba.branch_ids, ba.permissions, ba.is_active
  FROM public.branch_admins ba WHERE ba.user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.link_branch_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _email text;
  _rows int;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  SELECT u.email INTO _email FROM auth.users u WHERE u.id = auth.uid();
  IF _email IS NULL THEN RETURN false; END IF;
  UPDATE public.branch_admins ba
     SET user_id = auth.uid(), updated_at = now()
   WHERE lower(ba.email) = lower(_email) AND ba.user_id IS NULL;
  GET DIAGNOSTICS _rows = ROW_COUNT;
  RETURN _rows > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_branch_admin(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.branch_admin_can(uuid, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.branch_admin_manages(uuid, uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.my_branch_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.link_branch_admin() TO authenticated;

-- ---------------------------------------------------------------------------
-- Capability policies
--   Site-wide tables  : permission only
--   Branch-scoped tbl : permission AND the branch must be assigned
-- Skipped silently (and reported) when the table is not present.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r record;
  _created int := 0;
  _skipped text[] := '{}';
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      ('public.site_settings',       'Branch admins with content permission manage settings',    'ALL',    'public.branch_admin_can(auth.uid(), ''content'')'),
      ('public.team_members',        'Branch admins with team permission manage team',            'ALL',    'public.branch_admin_can(auth.uid(), ''team'')'),
      ('public.services',            'Branch admins with services permission manage services',    'ALL',    'public.branch_admin_can(auth.uid(), ''services'')'),
      ('public.episodes',            'Branch admins with events permission manage episodes',       'ALL',    'public.branch_admin_can(auth.uid(), ''events'')'),
      ('public.live_events',         'Branch admins with events permission manage live events',    'ALL',    'public.branch_admin_can(auth.uid(), ''events'')'),
      ('public.prayer_requests',     'Branch admins with prayers permission manage prayer requests','ALL',    'public.branch_admin_can(auth.uid(), ''prayers'')'),
      ('public.branches',            'Assigned branch admins can update their branches',           'UPDATE', 'public.branch_admin_can(auth.uid(), ''branches'') AND public.branch_admin_manages(auth.uid(), id)'),
      ('public.branch_members',      'Assigned branch admins manage branch members',               'ALL',    'public.branch_admin_can(auth.uid(), ''members'') AND public.branch_admin_manages(auth.uid(), branch_id)'),
      ('public.membership_requests', 'Assigned branch admins manage membership requests',          'ALL',    'public.branch_admin_can(auth.uid(), ''members'') AND public.branch_admin_manages(auth.uid(), branch_id)'),
      ('public.branch_events',       'Assigned branch admins manage branch events',                'ALL',    'public.branch_admin_can(auth.uid(), ''events'') AND public.branch_admin_manages(auth.uid(), branch_id)'),
      ('public.branch_services',     'Assigned branch admins manage branch services',              'ALL',    'public.branch_admin_can(auth.uid(), ''services'') AND public.branch_admin_manages(auth.uid(), branch_id)'),
      ('public.branch_episodes',     'Assigned branch admins manage branch episodes',              'ALL',    'public.branch_admin_can(auth.uid(), ''events'') AND public.branch_admin_manages(auth.uid(), branch_id)'),
      ('public.branch_prayers',      'Assigned branch admins manage branch prayers',               'ALL',    'public.branch_admin_can(auth.uid(), ''prayers'') AND public.branch_admin_manages(auth.uid(), branch_id)'),
      ('public.branch_donations',    'Assigned branch admins manage branch donations',             'ALL',    'public.branch_admin_can(auth.uid(), ''giving'') AND public.branch_admin_manages(auth.uid(), branch_id)'),
      ('public.store_items',         'Assigned branch admins manage store items',                  'ALL',    'public.branch_admin_can(auth.uid(), ''store'') AND public.branch_admin_manages(auth.uid(), branch_id)'),
      ('public.store_orders',        'Assigned branch admins manage store orders',                 'ALL',    'public.branch_admin_can(auth.uid(), ''giving'') AND public.branch_admin_manages(auth.uid(), branch_id)')
    ) AS t(tbl, pol, cmd, cond)
  LOOP
    IF to_regclass(r.tbl) IS NULL THEN
      _skipped := _skipped || r.tbl;
      CONTINUE;
    END IF;
    EXECUTE format('DROP POLICY IF EXISTS %I ON %s', r.pol, r.tbl);
    EXECUTE format(
      'CREATE POLICY %I ON %s FOR %s USING (%s) WITH CHECK (%s)',
      r.pol, r.tbl, r.cmd, r.cond, r.cond
    );
    _created := _created + 1;
  END LOOP;

  RAISE NOTICE 'Branch-admin policies created: % | tables skipped (not present): %', _created, _skipped;
END $$;

-- ---------------------------------------------------------------------------
-- Report: what this database actually has
-- ---------------------------------------------------------------------------
SELECT t AS expected_table, (to_regclass('public.' || t) IS NOT NULL) AS present
FROM unnest(ARRAY[
  'site_settings', 'team_members', 'services',
  'episodes', 'live_events', 'prayer_requests',
  'branches', 'branch_members', 'membership_requests',
  'branch_events', 'branch_services', 'branch_episodes',
  'branch_prayers', 'branch_donations', 'store_items', 'store_orders'
]) AS t
ORDER BY present, t;
