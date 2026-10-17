-- Branch grouping: a state branch owns a set of local chapter branches.
--
-- Replaces 20260831000000_branch_grouping.sql, which never applied: its
-- "Branch admins manage child branches" policy referenced branches.branch_id,
-- a column that does not exist on branches, so CREATE POLICY aborted and the
-- whole migration rolled back (columns, indexes and functions included).
-- branch_admin_manages takes the branch's own id, which is what b.id is here.

ALTER TABLE public.branches
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_state_branch BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS state_code TEXT;

CREATE INDEX IF NOT EXISTS idx_branches_parent_id ON public.branches(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_branches_is_state_branch ON public.branches(is_state_branch) WHERE is_state_branch;

-- Canonicalize state codes (blank/lowercase/spaces) for consistent lookup and sorting.
CREATE OR REPLACE FUNCTION public.normalize_state_code(raw text)
RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT CASE
    WHEN raw IS NULL THEN NULL
    ELSE upper(trim(regexp_replace(raw, '[^A-Za-z0-9]', '', 'g')))
  END;
$$;

CREATE OR REPLACE FUNCTION public.derive_state_code_from_name(name text)
RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT public.normalize_state_code(name);
$$;

-- Child branches stay readable when their parent state branch is active.
DROP POLICY IF EXISTS "Child branches viewable when parent active" ON public.branches;
CREATE POLICY "Child branches viewable when parent active" ON public.branches FOR SELECT USING (
  active IS NULL OR active = true
  OR parent_id IS NULL
  OR EXISTS (
    SELECT 1 FROM public.branches parent
    WHERE parent.id = branches.parent_id
      AND (parent.active IS NULL OR parent.active = true)
  )
);

-- A branch admin granted the branches capability, or a branch's own leader,
-- can manage the branch row itself (including its role as a parent).
DROP POLICY IF EXISTS "Branch admins manage child branches" ON public.branches;
CREATE POLICY "Branch admins manage child branches" ON public.branches FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = branches.id
        AND (
          (
            public.branch_admin_can(auth.uid(), 'branches')
            AND public.branch_admin_manages(auth.uid(), b.id)
          )
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
          (
            public.branch_admin_can(auth.uid(), 'branches')
            AND public.branch_admin_manages(auth.uid(), b.id)
          )
          OR b.leader_user_id = auth.uid()
        )
    )
  );