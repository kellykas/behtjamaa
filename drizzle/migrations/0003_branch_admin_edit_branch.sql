-- ============================================================================
-- Branch admins can edit their own branch (name, location, description, logo…)
-- ============================================================================
-- The only write policy on public.branches is the super-admin one, so a branch
-- admin pressing Save in Admin > Branches wrote nothing and reported nothing.
--
-- The new UPDATE policy reads public.branch_admins through the existing
-- SECURITY DEFINER helper branch_admin_manages(), never public.branches itself,
-- so it cannot re-enter its own policy (42P17 recursion).
--
-- Portal access (leader_user_id) and the grouping columns stay super-admin only:
-- the trigger below rejects those changes for a signed-in branch admin, so the
-- wider UPDATE grant cannot be used to hand out portal access or re-parent
-- branches. Sessions without an app user (SQL editor, service role, migrations)
-- are left alone.

-- Re-create the super-admin policy with the has_role argument order that the
-- live database actually has (_user_id, _role).
DROP POLICY IF EXISTS "Admins can manage branches" ON public.branches;
CREATE POLICY "Admins can manage branches" ON public.branches FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Branch admins can update their branches" ON public.branches;
CREATE POLICY "Branch admins can update their branches" ON public.branches FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.branch_admin_manages(auth.uid(), id)
    OR leader_user_id = auth.uid()
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.branch_admin_manages(auth.uid(), id)
    OR leader_user_id = auth.uid()
  );

CREATE OR REPLACE FUNCTION public.guard_branch_admin_branch_updates()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- No app session (SQL editor, service role, migrations): not our threat model.
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN NEW;
  END IF;

  IF NEW.leader_user_id IS DISTINCT FROM OLD.leader_user_id
     OR NEW.is_state_branch IS DISTINCT FROM OLD.is_state_branch
     OR NEW.parent_id IS DISTINCT FROM OLD.parent_id
     OR NEW.state_code IS DISTINCT FROM OLD.state_code THEN
    RAISE EXCEPTION 'Only a super admin can change portal access or branch grouping';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_branch_admin_branch_updates ON public.branches;
CREATE TRIGGER trg_guard_branch_admin_branch_updates
BEFORE UPDATE ON public.branches
FOR EACH ROW
EXECUTE FUNCTION public.guard_branch_admin_branch_updates();
