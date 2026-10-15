-- ============================================================================
-- Branch grouping: USA states as branches, local chapters as child branches
-- ============================================================================
-- A branch can optionally be a "state branch" that owns a set of sub-branches.
-- Sub-branches remain real branches (same table), so they keep all existing
-- branch behavior (logo, banner, leader, portal page, etc.).
--
-- parent_id      -> points to the state branch for local chapters
-- is_state_branch -> true for top-level state chapters (or any parent branch)
-- state_code     -> normalized US state code used for lookup/sorting, e.g. "NY"
-- This keeps one source of truth (branches) while still supporting nested structure.

ALTER TABLE public.branches
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_state_branch BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS state_code TEXT;

CREATE INDEX IF NOT EXISTS idx_branches_parent_id ON public.branches(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_branches_is_state_branch ON public.branches(is_state_branch) WHERE is_state_branch;

-- Canonicalize state codes (blank/lowercase/spaces) for consistency
CREATE OR REPLACE FUNCTION public.normalize_state_code(raw text)
RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT CASE
    WHEN raw IS NULL THEN NULL
    ELSE upper(trim(regexp_replace(raw, '[^A-Za-z0-9]', '', 'g')))
  END;
$$;

-- Keep state_code derived from name/slug when it looks like a US state branch.
-- This is a lightweight helper used by admin saves; it does not overwrite manual values.
CREATE OR REPLACE FUNCTION public.derive_state_code_from_name(name text)
RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT public.normalize_state_code(name);
$$;

-- Branch-level read policy already exists; ensure child branches are still readable
-- by anyone when the parent is active.
DROP POLICY IF EXISTS "Child branches viewable when parent active" ON public.branches;
CREATE POLICY "Child branches viewable when parent active" ON public.branches FOR SELECT
  USING (
    active IS NULL OR active = true
    OR parent_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.branches parent
      WHERE parent.id = branches.parent_id
        AND (parent.active IS NULL OR parent.active = true)
    )
  );

-- Branch admins can manage their own branches (existing policies should already cover this).
-- Add an explicit policy to allow branch admins to manage child branches of branches they manage.
DROP POLICY IF EXISTS "Branch admins manage child branches" ON public.branches;
CREATE POLICY "Branch admins manage child branches" ON public.branches FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = branches.id
        AND (
          public.branch_admin_can(auth.uid(), 'branches')
          AND public.branch_admin_manages(auth.uid(), b.branch_id) -- no-op guard if column missing
          OR b.leader_user_id = auth.uid()
        )
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = branches.id
        AND (
          public.branch_admin_can(auth.uid(), 'branches')
          AND public.branch_admin_manages(auth.uid(), b.branch_id)
          OR b.leader_user_id = auth.uid()
        )
    )
  );
