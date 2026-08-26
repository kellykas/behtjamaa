-- Add leader_user_id to branches so the portal can check real user access
ALTER TABLE public.branches
  ADD COLUMN IF NOT EXISTS leader_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- SECURITY DEFINER function so the client can check branch leadership via RPC
-- NOTE: has_role(_user_id UUID, _role app_role) -- user_id FIRST, role SECOND
CREATE OR REPLACE FUNCTION public.is_branch_leader(_branch_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.branches
    WHERE id = _branch_id
      AND (
        leader_user_id = _user_id
        OR EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_roles.user_id = _user_id
            AND user_roles.role = 'admin'
        )
      )
  )
$$;

-- Allow any authenticated user to call is_branch_leader (it only returns a bool and is SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION public.is_branch_leader(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_branch_leader(uuid, uuid) TO anon;
